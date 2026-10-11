// Role assignments for the API's managed identity. Applied once by a subscription
// Owner (an MFA session): the GitHub deployer holds Contributor only and cannot
// write role assignments, so `main.bicep` never carries them.
targetScope = 'resourceGroup'

param baseName string = 'swh-prod'

var suffix = take(uniqueString(subscription().id, resourceGroup().id), 6)

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: 'acrsweethand${suffix}'
}

resource vault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: 'kv-swh-${suffix}'
}

resource communication 'Microsoft.Communication/communicationServices@2023-04-01' existing = {
  name: 'acs-${baseName}-${suffix}'
}

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: 'id-${baseName}-api'
}

resource acrPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acr.id, identity.id, 'acrpull')
  scope: acr
  properties: {
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
  }
}

resource vaultReader 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(vault.id, identity.id, 'secrets-user')
  scope: vault
  properties: {
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
  }
}

resource communicationContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(communication.id, identity.id, 'communication-contributor')
  scope: communication
  properties: {
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '09976791-48a7-449e-bb21-39d1a415f350')
  }
}
