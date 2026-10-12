targetScope = 'resourceGroup'

@description('Primary Canadian region for stateful resources.')
param location string = 'canadacentral'
@description('The environment this resource group holds (docs/operations/environments.md). Every default below is production\'s.')
@allowed(['prod', 'staging', 'uat'])
param envName string = 'prod'
param baseName string = 'swh-${envName}'
@description('Public hostnames the site answers on; the first is the canonical site URL.')
param siteHostnames string = 'sweethand.ca,www.sweethand.ca'
param deployApi bool = false
param deployMigration bool = false
param containerImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
@secure()
param postgresAdminPassword string
@secure()
param ipHashSecret string
@description('turnstile verifies sign-ups with Cloudflare; off is the explicit, temporary operator choice before the widget exists (L2-104.9).')
@allowed(['turnstile', 'off'])
param botChallenge string = 'turnstile'
@secure()
param turnstileSecret string = ''
param turnstileHostnames string = siteHostnames
param postgresAdmin string = 'sweethand_migrate'
param contactEmail string = 'hello@sweethand.ca'
param mailingAddress string = '309–2091 Hurontario Street, Mississauga, Ontario L5A 4E6'
@description('Send from the verified sweethand.ca domain (production) or from an Azure-managed azurecomm.net domain that needs no DNS (staging, UAT).')
param customEmailDomain bool = true
@description('Link the custom email domain to Communication Services; true only once Azure reports the domain verified.')
param linkEmailDomain bool = false
@description('Hide every API route outside the launch-list surface (ADR 0011).')
param prelaunchMode bool = true
param postgresBackupRetentionDays int = 35
param postgresGeoRedundantBackup bool = true
@secure()
@description('Password that Static Web Apps asks for before serving the site; empty leaves the site public (production).')
param sitePassword string = ''
param budgetAmount int = 100
param budgetEmail string = 'quinntyne@hotmail.com'
param budgetStartDate string = '2026-10-01'

var suffix = take(uniqueString(subscription().id, resourceGroup().id), 6)
var acrName = 'acrsweethand${suffix}'
var vaultName = 'kv-swh-${suffix}'
var postgresName = 'psql-swh-${suffix}'
var swaName = 'swa-sweethand-launch-${envName}'
var staticWebAppLocation = 'eastus2'
var environmentName = 'cae-${baseName}'
var apiName = 'ca-swh-api'
var identityName = 'id-${baseName}-api'
var workspaceName = 'log-${baseName}'
var appInsightsName = 'appi-${baseName}'
var communicationName = 'acs-${baseName}-${suffix}'
var emailName = 'email-${baseName}-${suffix}'
var siteHosts = split(siteHostnames, ',')
var siteOrigins = join(map(siteHosts, host => 'https://${host}'), ',')
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
  name: 'sweethand-${envName}'
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

// The identity's role assignments (AcrPull, Key Vault Secrets User, Communication and
// Email Service Owner) live in roles.bicep, applied once by an Owner.

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
resource turnstileSecretResource 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (botChallenge == 'turnstile') {
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
    backup: { backupRetentionDays: postgresBackupRetentionDays, geoRedundantBackup: postgresGeoRedundantBackup ? 'Enabled' : 'Disabled' }
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

// The database the connection string names; migrations create everything inside it.
resource sweethandDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = {
  parent: postgres
  name: 'sweethand'
  properties: { charset: 'UTF8', collation: 'en_US.utf8' }
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

// Staging and UAT sit behind a shared password so nobody mistakes them for the real site
// or joins a launch list that is not production's.
resource swaPassword 'Microsoft.Web/staticSites/basicAuth@2023-12-01' = if (!empty(sitePassword)) {
  parent: swa
  name: 'default'
  properties: { applicableEnvironmentsMode: 'AllEnvironments', password: sitePassword, secretUrl: '' }
}

resource communication 'Microsoft.Communication/communicationServices@2023-04-01' = {
  name: communicationName
  location: 'global'
  properties: {
    dataLocation: 'Canada'
    linkedDomains: customEmailDomain ? (linkEmailDomain ? [emailDomain.id] : []) : [managedEmailDomain.id]
  }
}

resource email 'Microsoft.Communication/emailServices@2023-04-01' = {
  name: emailName
  location: 'global'
  properties: { dataLocation: 'Canada' }
}

resource emailDomain 'Microsoft.Communication/emailServices/domains@2023-04-01' = if (customEmailDomain) {
  parent: email
  name: 'sweethand.ca'
  location: 'global'
  properties: { domainManagement: 'CustomerManaged', userEngagementTracking: 'Disabled' }
}

resource emailSender 'Microsoft.Communication/emailServices/domains/senderUsernames@2023-04-01' = if (customEmailDomain) {
  parent: emailDomain
  name: 'hello'
  properties: { username: 'hello', displayName: 'Sweet Hand' }
}

resource managedEmailDomain 'Microsoft.Communication/emailServices/domains@2023-04-01' = if (!customEmailDomain) {
  parent: email
  name: 'AzureManagedDomain'
  location: 'global'
  properties: { domainManagement: 'AzureManaged', userEngagementTracking: 'Disabled' }
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
      secrets: concat([
        { name: 'database-url', keyVaultUrl: databaseUrlSecret.properties.secretUriWithVersion, identity: identity.id }
        { name: 'ip-hash-secret', keyVaultUrl: ipHashSecretResource.properties.secretUriWithVersion, identity: identity.id }
      ], botChallenge == 'turnstile' ? [
        { name: 'turnstile-secret', keyVaultUrl: turnstileSecretResource!.properties.secretUriWithVersion, identity: identity.id }
      ] : [])
    }
    template: {
      containers: [{
        name: 'api'
        image: containerImage
        resources: { cpu: json('0.5'), memory: '1Gi' }
        // The Static Web Apps default hostname stays a valid origin so the site works before the custom domain validates.
        env: concat([
          { name: 'DATABASE_URL', secretRef: 'database-url' }
          { name: 'IP_HASH_SECRET', secretRef: 'ip-hash-secret' }
          { name: 'BOT_CHALLENGE', value: botChallenge }
          { name: 'TURNSTILE_HOSTNAMES', value: '${turnstileHostnames},${swa.properties.defaultHostname}' }
          { name: 'ALLOWED_ORIGINS', value: '${siteOrigins},https://${swa.properties.defaultHostname}' }
          { name: 'TRUST_PROXY', value: 'true' }
          { name: 'PRELAUNCH_MODE', value: prelaunchMode ? 'true' : 'false' }
          { name: 'SECURE_COOKIES', value: 'true' }
          { name: 'SITE_URL', value: 'https://${siteHosts[0]}' }
          { name: 'CONTACT_EMAIL', value: contactEmail }
          { name: 'OPERATOR_MAILING_ADDRESS', value: mailingAddress }
          { name: 'ACS_EMAIL_ENDPOINT', value: 'https://${communication.name}.communication.azure.com' }
          { name: 'ACS_EMAIL_SENDER', value: customEmailDomain ? contactEmail : 'DoNotReply@${managedEmailDomain!.properties.mailFromSenderDomain}' }
          { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: insights.properties.ConnectionString }
          { name: 'AZURE_CLIENT_ID', value: identity.properties.clientId }
        ], botChallenge == 'turnstile' ? [{ name: 'TURNSTILE_SECRET', secretRef: 'turnstile-secret' }] : [])
        probes: [
          { type: 'Liveness', httpGet: { path: '/health/live', port: 4300, scheme: 'HTTP' }, initialDelaySeconds: 15, periodSeconds: 20 }
          { type: 'Readiness', httpGet: { path: '/health/ready', port: 4300, scheme: 'HTTP' }, initialDelaySeconds: 10, periodSeconds: 10 }
        ]
      }]
      scale: { minReplicas: 1, maxReplicas: 1 }
    }
  }
  dependsOn: [sweethandDb]
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
  dependsOn: [sweethandDb]
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
output staticWebAppHostname string = swa.properties.defaultHostname
output containerAppName string = apiName
output communicationServiceName string = communication.name
output emailServiceName string = email.name
output keyVaultName string = vault.name
output postgresServerName string = postgres.name
output apiFqdn string = deployApi ? api!.properties.configuration.ingress.fqdn : ''
