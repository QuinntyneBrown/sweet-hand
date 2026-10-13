# Creates the sprint board's home from nothing, once, as a subscription Owner in an MFA
# session: its resource group, the Free-tier Static Web App, the GitHub deployer and the
# `board` GitHub environment's variables (ADR 0014). deploy-board.yml then publishes the
# board on every push to main. Safe to re-run.
[CmdletBinding()]
param(
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

$environment = 'board'
$resourceGroup = 'rg-sweethand-board'
$staticWebApp = 'swa-sweethand-board'
az group create --name $resourceGroup --location $Location --tags application=SweetHand environment=$environment owner=quinntynebrown | Out-Null
az deployment group create --resource-group $resourceGroup --name 'board-foundation' --template-file "$PSScriptRoot/board.bicep" `
  --parameters "name=$staticWebApp" | Out-Null

# The board's own GitHub deployer: Contributor on this resource group and nothing else.
$appName = "github-sweethand-$environment"
$appId = az ad app list --display-name $appName --query '[0].appId' -o tsv
if (-not $appId) { $appId = az ad app create --display-name $appName --query appId -o tsv }
$principalId = az ad sp list --filter "appId eq '$appId'" --query '[0].id' -o tsv
if (-not $principalId) { $principalId = az ad sp create --id $appId --query id -o tsv }
$subject = "${OidcSubjectPrefix}:environment:$environment"
$matching = az ad app federated-credential list --id $appId --query "[?subject=='$subject'] | length(@)" -o tsv
if ($matching -eq '0') {
  $credential = New-TemporaryFile
  @{ name = "github-$environment"; issuer = 'https://token.actions.githubusercontent.com'; subject = $subject; audiences = @('api://AzureADTokenExchange') } |
    ConvertTo-Json | Set-Content -Path $credential
  az ad app federated-credential create --id $appId --parameters "@$credential" | Out-Null
  Remove-Item $credential
}
$scope = az group show --name $resourceGroup --query id -o tsv
az role assignment create --assignee-object-id $principalId --assignee-principal-type ServicePrincipal --role Contributor --scope $scope | Out-Null

# The GitHub environment and its variables. The board needs no secrets: the deployment
# token is read from Azure on every run.
gh api --method PUT "repos/$Repository/environments/$environment" | Out-Null
gh variable set AZURE_CLIENT_ID --env $environment --repo $Repository --body $appId
gh variable set AZURE_TENANT_ID --env $environment --repo $Repository --body $tenantId
gh variable set AZURE_SUBSCRIPTION_ID --env $environment --repo $Repository --body $SubscriptionId

$defaultHostname = az staticwebapp show --resource-group $resourceGroup --name $staticWebApp --query defaultHostname -o tsv
Write-Output "The board is ready for delivery; the next push to main publishes it at https://$defaultHostname/"
Write-Output "Or publish main now: gh workflow run deploy-board.yml --repo $Repository"
