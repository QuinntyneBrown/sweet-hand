targetScope = 'resourceGroup'

@description('Primary Canadian region for stateful resources.')
param location string = 'canadacentral'
param baseName string = 'swh-prod'
param deployApi bool = false
param deployMigration bool = false
param containerImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
@secure()
param postgresAdminPassword string
@secure()
param ipHashSecret string
@secure()
param turnstileSecret string
param turnstileHostnames string = 'sweethand.ca,www.sweethand.ca'
param postgresAdmin string = 'sweethand_migrate'
param contactEmail string = 'hello@sweethand.ca'
param mailingAddress string = '309–2091 Hurontario Street, Mississauga, Ontario L5A 4E6'
@description('Link the custom email domain to Communication Services; true only once Azure reports the domain verified.')
param linkEmailDomain bool = false
param budgetAmount int = 100
param budgetEmail string = 'quinntyne@hotmail.com'
param budgetStartDate string = '2026-10-01'

var suffix = take(uniqueString(subscription().id, resourceGroup().id), 6)
var acrName = 'acrsweethand${suffix}'
var vaultName = 'kv-swh-${suffix}'
var postgresName = 'psql-swh-${suffix}'
var swaName = 'swa-sweethand-launch-prod'
var staticWebAppLocation = 'eastus2'
var environmentName = 'cae-${baseName}'
var apiName = 'ca-swh-api'
var identityName = 'id-${baseName}-api'
var workspaceName = 'log-${baseName}'
var appInsightsName = 'appi-${baseName}'
var communicationName = 'acs-${baseName}-${suffix}'
var emailName = 'email-${baseName}-${suffix}'
var databaseUrl = 'postgresql://${postgresAdmin}:${uriComponent(postgresAdminPassword)}@${postgresName}.postgres.database.azure.com:5432/sweethand?sslmode=require'

resource vnet 'Microsoft.Network/virtualNetworks@2024-05-01' = {
  name: 'vnet-${baseName}'
  location: location
  properties: {
    addressSpace: { addressPrefixes: ['10.40.0.0/16'] }
    subnets: [
      {
        name: 'container-apps'
        properties: {
          addressPrefix: '10.40.0.0/23'
          delegations: [{ name: 'Microsoft.App.environments', properties: { serviceName: 'Microsoft.App/environments' } }]
        }
      }
      {
        name: 'postgres'
        properties: {
          addressPrefix: '10.40.2.0/28'
          delegations: [{ name: 'Microsoft.DBforPostgreSQL.flexibleServers', properties: { serviceName: 'Microsoft.DBforPostgreSQL/flexibleServers' } }]
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
    ]
  }
}

resource privateDns 'Microsoft.Network/privateDnsZones@2024-06-01' = {
  name: 'private.postgres.database.azure.com'
  location: 'global'
}

resource privateDnsLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01' = {
  parent: privateDns
  name: 'sweethand-prod'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: { id: vnet.id }
  }
}

resource logs 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: workspaceName
  location: location
  properties: { retentionInDays: 30, features: { enableLogAccessUsingOnlyResourcePermissions: true }, sku: { name: 'PerGB2018' } }
}

resource insights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: { Application_Type: 'web', WorkspaceResourceId: logs.id }
}

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: { name: 'Standard' }
  properties: { adminUserEnabled: false, publicNetworkAccess: 'Enabled' }
}

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
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

resource vault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: vaultName
  location: location
  properties: {
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enablePurgeProtection: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    publicNetworkAccess: 'Enabled'
    sku: { family: 'A', name: 'standard' }
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

resource databaseUrlSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: vault
  name: 'database-url'
  properties: { value: databaseUrl }
}
resource ipHashSecretResource 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: vault
  name: 'ip-hash-secret'
  properties: { value: ipHashSecret }
}
resource turnstileSecretResource 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: vault
  name: 'turnstile-secret'
  properties: { value: turnstileSecret }
}

resource postgres 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: postgresName
  location: location
  sku: { name: 'Standard_B1ms', tier: 'Burstable' }
  properties: {
    administratorLogin: postgresAdmin
    administratorLoginPassword: postgresAdminPassword
    version: '16'
    createMode: 'Default'
    storage: { storageSizeGB: 32, autoGrow: 'Enabled' }
    backup: { backupRetentionDays: 35, geoRedundantBackup: 'Enabled' }
    highAvailability: { mode: 'Disabled' }
    network: {
      delegatedSubnetResourceId: vnet.properties.subnets[1].id
      privateDnsZoneArmResourceId: privateDns.id
      publicNetworkAccess: 'Disabled'
    }
    authConfig: { activeDirectoryAuth: 'Disabled', passwordAuth: 'Enabled' }
  }
  dependsOn: [privateDnsLink]
}

resource environment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: environmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logs.properties.customerId
        sharedKey: logs.listKeys().primarySharedKey
      }
    }
    vnetConfiguration: { infrastructureSubnetId: vnet.properties.subnets[0].id, internal: false }
  }
}

resource swa 'Microsoft.Web/staticSites@2023-12-01' = {
  name: swaName
  location: staticWebAppLocation
  sku: { name: 'Standard', tier: 'Standard' }
  properties: { allowConfigFileUpdates: true, stagingEnvironmentPolicy: 'Enabled' }
}

resource communication 'Microsoft.Communication/communicationServices@2023-04-01' = {
  name: communicationName
  location: 'global'
  properties: { dataLocation: 'Canada', linkedDomains: linkEmailDomain ? [emailDomain.id] : [] }
}

resource email 'Microsoft.Communication/emailServices@2023-04-01' = {
  name: emailName
  location: 'global'
  properties: { dataLocation: 'Canada' }
}

resource emailDomain 'Microsoft.Communication/emailServices/domains@2023-04-01' = {
  parent: email
  name: 'sweethand.ca'
  location: 'global'
  properties: { domainManagement: 'CustomerManaged', userEngagementTracking: 'Disabled' }
}

resource emailSender 'Microsoft.Communication/emailServices/domains/senderUsernames@2023-04-01' = {
  parent: emailDomain
  name: 'hello'
  properties: { username: 'hello', displayName: 'Sweet Hand' }
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

resource api 'Microsoft.App/containerApps@2024-03-01' = if (deployApi) {
  name: apiName
  location: location
  identity: { type: 'UserAssigned', userAssignedIdentities: { '${identity.id}': {} } }
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: { external: true, targetPort: 4300, transport: 'auto', allowInsecure: false }
      registries: [{ server: acr.properties.loginServer, identity: identity.id }]
      secrets: [
        { name: 'database-url', keyVaultUrl: databaseUrlSecret.properties.secretUriWithVersion, identity: identity.id }
        { name: 'ip-hash-secret', keyVaultUrl: ipHashSecretResource.properties.secretUriWithVersion, identity: identity.id }
        { name: 'turnstile-secret', keyVaultUrl: turnstileSecretResource.properties.secretUriWithVersion, identity: identity.id }
      ]
    }
    template: {
      containers: [{
        name: 'api'
        image: containerImage
        resources: { cpu: json('0.5'), memory: '1Gi' }
        env: [
          { name: 'DATABASE_URL', secretRef: 'database-url' }
          { name: 'IP_HASH_SECRET', secretRef: 'ip-hash-secret' }
          { name: 'TURNSTILE_SECRET', secretRef: 'turnstile-secret' }
          { name: 'TURNSTILE_HOSTNAMES', value: turnstileHostnames }
          { name: 'ALLOWED_ORIGINS', value: 'https://sweethand.ca,https://www.sweethand.ca' }
          { name: 'TRUST_PROXY', value: 'true' }
          { name: 'PRELAUNCH_MODE', value: 'true' }
          { name: 'SECURE_COOKIES', value: 'true' }
          { name: 'SITE_URL', value: 'https://sweethand.ca' }
          { name: 'CONTACT_EMAIL', value: contactEmail }
          { name: 'OPERATOR_MAILING_ADDRESS', value: mailingAddress }
          { name: 'ACS_EMAIL_ENDPOINT', value: 'https://${communication.name}.communication.azure.com' }
          { name: 'ACS_EMAIL_SENDER', value: contactEmail }
          { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: insights.properties.ConnectionString }
          { name: 'AZURE_CLIENT_ID', value: identity.properties.clientId }
        ]
        probes: [
          { type: 'Liveness', httpGet: { path: '/health/live', port: 4300, scheme: 'HTTP' }, initialDelaySeconds: 15, periodSeconds: 20 }
          { type: 'Readiness', httpGet: { path: '/health/ready', port: 4300, scheme: 'HTTP' }, initialDelaySeconds: 10, periodSeconds: 10 }
        ]
      }]
      scale: { minReplicas: 1, maxReplicas: 1 }
    }
  }
  dependsOn: [acrPull, vaultReader, postgres, communicationContributor]
}

resource migrate 'Microsoft.App/jobs@2024-03-01' = if (deployMigration) {
  name: 'caj-swh-migrate'
  location: location
  identity: { type: 'UserAssigned', userAssignedIdentities: { '${identity.id}': {} } }
  properties: {
    environmentId: environment.id
    configuration: {
      triggerType: 'Manual'
      replicaTimeout: 900
      replicaRetryLimit: 1
      manualTriggerConfig: { parallelism: 1, replicaCompletionCount: 1 }
      registries: [{ server: acr.properties.loginServer, identity: identity.id }]
      secrets: [{ name: 'database-url', keyVaultUrl: databaseUrlSecret.properties.secretUriWithVersion, identity: identity.id }]
    }
    template: { containers: [{ name: 'migrate', image: containerImage, command: ['npm'], args: ['run', 'migrate'], resources: { cpu: json('0.5'), memory: '1Gi' }, env: [{ name: 'DATABASE_URL', secretRef: 'database-url' }] }] }
  }
  dependsOn: [acrPull, vaultReader, postgres]
}

resource budget 'Microsoft.Consumption/budgets@2023-11-01' = {
  name: 'budget-${baseName}'
  properties: {
    category: 'Cost'
    amount: budgetAmount
    timeGrain: 'Monthly'
    timePeriod: { startDate: budgetStartDate }
    notifications: {
      actual50: { enabled: true, operator: 'GreaterThanOrEqualTo', threshold: 50, thresholdType: 'Actual', contactEmails: [budgetEmail] }
      actual80: { enabled: true, operator: 'GreaterThanOrEqualTo', threshold: 80, thresholdType: 'Actual', contactEmails: [budgetEmail] }
      actual100: { enabled: true, operator: 'GreaterThanOrEqualTo', threshold: 100, thresholdType: 'Actual', contactEmails: [budgetEmail] }
      forecast100: { enabled: true, operator: 'GreaterThanOrEqualTo', threshold: 100, thresholdType: 'Forecasted', contactEmails: [budgetEmail] }
    }
  }
}

output acrName string = acr.name
output acrLoginServer string = acr.properties.loginServer
output staticWebAppName string = swa.name
output containerAppName string = apiName
output communicationServiceName string = communication.name
output emailServiceName string = email.name
output keyVaultName string = vault.name
output postgresServerName string = postgres.name
output apiFqdn string = deployApi ? api!.properties.configuration.ingress.fqdn : ''
