# Creates a pre-production environment (staging or UAT) from nothing, once, as a subscription
# Owner in an MFA session: resource group, foundation, the API identity's roles, the GitHub
# deployer, and the GitHub environment's variables and secrets. Re-running it rotates the
# environment's secrets. docs/operations/environments.md describes the environments.
[CmdletBinding()]
param(
  [Parameter(Mandatory)] [ValidateSet('staging', 'uat')] [string] $Environment,
  [string] $SubscriptionId = '4a1b5113-89f9-4d27-acfe-581493385536',
  [string] $Location = 'canadacentral',
  [string] $Repository = 'QuinntyneBrown/sweet-hand',
  # GitHub's OIDC subject for this repository carries the owner and repository IDs (azure-production.md).
  [string] $OidcSubjectPrefix = 'repo:QuinntyneBrown@1749159/sweet-hand@1413231887'
)
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true

az account set --subscription $SubscriptionId
$active = az account show --query id -o tsv
if ($active -ne $SubscriptionId) { throw "Azure CLI selected unexpected subscription $active" }
$tenantId = az account show --query tenantId -o tsv

$resourceGroup = "rg-sweethand-$Environment"
$hostName = "$Environment.sweethand.ca"
az group create --name $resourceGroup --location $Location --tags application=SweetHand environment=$Environment owner=quinntynebrown | Out-Null

function New-Secret([int] $Bytes) {
  ([Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes($Bytes))) -replace '[+/=]', ''
}
$postgresPassword = New-Secret 32
$ipHashSecret = New-Secret 48
$sitePassword = New-Secret 12

# The same values deploy-staging.yml and deploy-uat.yml pass; the bot challenge starts off (L2-104.9).
$parameters = @(
  "envName=$Environment", "siteHostnames=$hostName", 'customEmailDomain=false', 'botChallenge=off',
  'postgresBackupRetentionDays=7', 'postgresGeoRedundantBackup=false', 'budgetAmount=60',
  "postgresAdminPassword=$postgresPassword", "ipHashSecret=$ipHashSecret", "sitePassword=$sitePassword"
)
az deployment group create --resource-group $resourceGroup --name "$Environment-foundation" --template-file "$PSScriptRoot/main.bicep" `
  --parameters @parameters deployApi=false deployMigration=false | Out-Null
az deployment group create --resource-group $resourceGroup --name "$Environment-roles" --template-file "$PSScriptRoot/roles.bicep" `
  --parameters "envName=$Environment" | Out-Null

# The environment's own GitHub deployer: Contributor on this resource group and nothing else.
$appName = "github-sweethand-$Environment"
$appId = az ad app list --display-name $appName --query '[0].appId' -o tsv
if (-not $appId) { $appId = az ad app create --display-name $appName --query appId -o tsv }
$principalId = az ad sp list --filter "appId eq '$appId'" --query '[0].id' -o tsv
if (-not $principalId) { $principalId = az ad sp create --id $appId --query id -o tsv }
$subject = "${OidcSubjectPrefix}:environment:$Environment"
$matching = az ad app federated-credential list --id $appId --query "[?subject=='$subject'] | length(@)" -o tsv
if ($matching -eq '0') {
  $credential = New-TemporaryFile
  @{ name = "github-$Environment"; issuer = 'https://token.actions.githubusercontent.com'; subject = $subject; audiences = @('api://AzureADTokenExchange') } |
    ConvertTo-Json | Set-Content -Path $credential
  az ad app federated-credential create --id $appId --parameters "@$credential" | Out-Null
  Remove-Item $credential
}
$scope = az group show --name $resourceGroup --query id -o tsv
az role assignment create --assignee-object-id $principalId --assignee-principal-type ServicePrincipal --role Contributor --scope $scope | Out-Null

# The GitHub environment, its variables and its secrets.
gh api --method PUT "repos/$Repository/environments/$Environment" | Out-Null
gh variable set AZURE_CLIENT_ID --env $Environment --repo $Repository --body $appId
gh variable set AZURE_TENANT_ID --env $Environment --repo $Repository --body $tenantId
gh variable set AZURE_SUBSCRIPTION_ID --env $Environment --repo $Repository --body $SubscriptionId
gh secret set POSTGRES_ADMIN_PASSWORD --env $Environment --repo $Repository --body $postgresPassword
gh secret set IP_HASH_SECRET --env $Environment --repo $Repository --body $ipHashSecret
gh secret set SITE_PASSWORD --env $Environment --repo $Repository --body $sitePassword

$defaultHostname = az staticwebapp show --resource-group $resourceGroup --name "swa-sweethand-launch-$Environment" --query defaultHostname -o tsv
Write-Output "$Environment is ready for delivery."
Write-Output "Add this record in Namecheap Advanced DNS: CNAME  $Environment  $defaultHostname"
Write-Output "Site password to share with testers: $sitePassword"
