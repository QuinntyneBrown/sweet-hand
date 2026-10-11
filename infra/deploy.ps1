[CmdletBinding()]
param(
  [Parameter(Mandatory)] [string] $PostgresAdminPassword,
  [Parameter(Mandatory)] [string] $TurnstileSecret,
  [string] $SubscriptionId = '4a1b5113-89f9-4d27-acfe-581493385536',
  [string] $ResourceGroup = 'rg-sweethand-prod',
  [string] $Location = 'canadacentral',
  [string] $ImageTag = 'bootstrap'
)
$ErrorActionPreference = 'Stop'
az account set --subscription $SubscriptionId
$active = az account show --query id -o tsv
if ($active -ne $SubscriptionId) { throw "Azure CLI selected unexpected subscription $active" }
az group create --name $ResourceGroup --location $Location --tags application=SweetHand environment=production owner=quinntynebrown | Out-Null
$ipHash = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$common = @('--resource-group', $ResourceGroup, '--template-file', "$PSScriptRoot/main.bicep", '--parameters', "postgresAdminPassword=$PostgresAdminPassword", "turnstileSecret=$TurnstileSecret", "ipHashSecret=$ipHash")
az deployment group create --name sweethand-foundation @common --parameters deployApi=false deployMigration=false | Out-Null
$acr = az deployment group show --resource-group $ResourceGroup --name sweethand-foundation --query properties.outputs.acrName.value -o tsv
az acr build --registry $acr --image "sweet-hand-api:$ImageTag" --file "$PSScriptRoot/../backend/Dockerfile" "$PSScriptRoot/.."
$image = "${acr}.azurecr.io/sweet-hand-api:$ImageTag"
az deployment group create --name sweethand-migration @common --parameters deployApi=false deployMigration=true "containerImage=$image" | Out-Null
$execution = az containerapp job start --resource-group $ResourceGroup --name caj-swh-migrate --query name -o tsv
do {
  Start-Sleep -Seconds 10
  $status = az containerapp job execution show --resource-group $ResourceGroup --name caj-swh-migrate --job-execution-name $execution --query properties.status -o tsv
} while ($status -notin @('Succeeded', 'Failed'))
if ($status -ne 'Succeeded') { throw "Migration execution $execution failed" }
az deployment group create --name sweethand-production @common --parameters deployApi=true deployMigration=true "containerImage=$image" | Out-Null
$apiId = az containerapp show --resource-group $ResourceGroup --name ca-swh-api --query id -o tsv
$linked = az staticwebapp backends show --resource-group $ResourceGroup --name swa-sweethand-launch-prod --query "[?backendResourceId=='$apiId'] | length(@)" -o tsv 2>$null
if ($linked -ne '1') {
  az staticwebapp backends link --resource-group $ResourceGroup --name swa-sweethand-launch-prod --backend-resource-id $apiId --backend-region $Location | Out-Null
}
Write-Output "Azure foundation, migrations and API deployed; /api is linked to the Static Web App."
