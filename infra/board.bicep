// The founder's sprint board (ADR 0014): one Free-tier Static Web App in its own resource
// group, deployed by deploy-board.yml on every push to main. It has no backend, no database
// and no personal data, so none of main.bicep applies to it. Applied once by
// new-board.ps1, then on every delivery (idempotent).
targetScope = 'resourceGroup'

// Static Web Apps has no Canada Central control plane on this subscription (ADR 0011); the
// board holds no personal data, so the control-plane region does not matter here.
param location string = 'eastus2'
param name string = 'swa-sweethand-board'

resource swa 'Microsoft.Web/staticSites@2023-12-01' = {
  name: name
  location: location
  tags: { application: 'SweetHand', environment: 'board', owner: 'quinntynebrown' }
  sku: { name: 'Free', tier: 'Free' }
  properties: { allowConfigFileUpdates: true, stagingEnvironmentPolicy: 'Disabled' }
}

output staticWebAppName string = swa.name
output staticWebAppHostname string = swa.properties.defaultHostname
