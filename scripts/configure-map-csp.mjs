import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const localProfilePath = join(projectRoot, 'power-platform.local.json')
const localProfile = JSON.parse(readFileSync(localProfilePath, 'utf8'))
for (const key of ['environmentId', 'appId', 'tenantId', 'account']) {
  if (typeof localProfile[key] !== 'string' || !localProfile[key].trim()) {
    throw new Error('Preencha o perfil administrativo local usando power-platform.example.json.')
  }
}
const expectedEnvironment = localProfile.environmentId
const expectedApp = localProfile.appId
const imageOrigin = 'https://tile.openstreetmap.org'
const selectedSettings = ['PowerApps_CSPEnabledCodeApps', 'PowerApps_CSPReportingEndpoint', 'PowerApps_CSPConfigCodeApps']

async function main() {
  const apply = process.argv.includes('--apply')
  const config = JSON.parse(readFileSync(join(projectRoot, 'power.config.json'), 'utf8'))
  if (config.environmentId !== expectedEnvironment || config.appId !== expectedApp) {
    throw new Error('O aplicativo ou ambiente difere do destino autorizado.')
  }

  // Usa o provider instalado do CLI; nenhum token é impresso nem salvo nos diagnósticos.
  const cliRoot = join(projectRoot, 'node_modules', '@microsoft', 'power-apps-cli', 'dist')
  const providers = readdirSync(cliRoot).filter(name => /^NodeMsalAuthenticationProvider-.*\.js$/.test(name))
  if (providers.length !== 1) throw new Error('Provider oficial do CLI não identificado.')
  const { NodeMsalAuthenticationProvider } = await import(pathToFileURL(join(cliRoot, providers[0])).href)
  const auth = new NodeMsalAuthenticationProvider()
  await auth.initAsync('prod')
  if (await auth.getCachedAccountAsync() !== localProfile.account) {
    throw new Error('A conta ativa difere da conta deste projeto.')
  }
  const token = await auth.getAccessTokenForResourceSilently('https://api.powerplatform.com')
  if (!token) throw new Error('Autenticação administrativa adicional necessária.')
  if (auth.getUserTenantId() !== localProfile.tenantId) {
    throw new Error('Tenant diferente do destino autorizado.')
  }
  const endpoint = new URL('https://api.powerplatform.com/environmentmanagement/environments/' + expectedEnvironment + '/settings')
  endpoint.searchParams.set('api-version', '2022-03-01-preview')
  const headers = { Authorization: 'Bearer ' + token }

  async function readSettings() {
    const url = new URL(endpoint)
    url.searchParams.set('$select', selectedSettings.join(','))
    const response = await fetch(url, { headers })
    if (!response.ok) throw new Error('Consulta CSP falhou: HTTP ' + response.status)
    const settings = (await response.json()).objectResult?.[0]
    if (settings?.Id !== expectedEnvironment) throw new Error('Resposta com ambiente inesperado.')
    return settings
  }

  const before = await readSettings()
  const directives = before.PowerApps_CSPConfigCodeApps == null ? {} : JSON.parse(before.PowerApps_CSPConfigCodeApps)
  if (!directives || typeof directives !== 'object' || Array.isArray(directives)) {
    throw new Error('Coleção de diretivas CSP inválida.')
  }
  const imageKey = Object.keys(directives).find(key => key.toLowerCase() === 'img-src') ?? 'Img-Src'
  const imageDirective = directives[imageKey] ?? { sources: [] }
  if (!Array.isArray(imageDirective.sources)) throw new Error('Diretiva img-src inválida.')
  const alreadyAllowed = imageDirective.sources.some(entry => entry.source === imageOrigin)
  const afterDirectives = structuredClone(directives)
  afterDirectives[imageKey] = {
    ...imageDirective,
    sources: alreadyAllowed ? imageDirective.sources : [...imageDirective.sources, { source: imageOrigin }],
  }
  const patch = { PowerApps_CSPConfigCodeApps: JSON.stringify(afterDirectives) }
  const preview = {
    environmentId: expectedEnvironment,
    appId: expectedApp,
    scope: 'Todos os Code Apps deste ambiente; exceção somente para imagens deste domínio.',
    domainToAllow: imageOrigin,
    alreadyAllowed,
    enforcementBefore: before.PowerApps_CSPEnabledCodeApps,
    reportingEndpointBefore: before.PowerApps_CSPReportingEndpoint,
    customDirectivesBefore: directives,
    customDirectivesAfter: afterDirectives,
    settingsToPatch: patch,
  }
  const diagnostics = join(projectRoot, 'diagnostics')
  mkdirSync(diagnostics, { recursive: true })
  writeFileSync(join(diagnostics, 'map-csp-proposed.json'), JSON.stringify(preview, null, 2) + '\n', 'utf8')
  if (!apply) {
    console.log(JSON.stringify({ mode: 'preview', ...preview }, null, 2))
    return
  }
  if (alreadyAllowed) {
    console.log(JSON.stringify({ mode: 'unchanged', environmentId: expectedEnvironment, domain: imageOrigin }))
    return
  }

  // Execute --apply somente após autorização para a alteração no ambiente.
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = join(diagnostics, 'map-csp-before-' + stamp + '.json')
  writeFileSync(backupFile, JSON.stringify(before, null, 2) + '\n', 'utf8')
  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!response.ok) throw new Error('Atualização CSP falhou: HTTP ' + response.status + '. Backup: ' + backupFile)
  const after = await readSettings()
  const observed = JSON.parse(after.PowerApps_CSPConfigCodeApps ?? '{}')
  const observedKey = Object.keys(observed).find(key => key.toLowerCase() === 'img-src')
  if (!observedKey || !observed[observedKey].sources?.some(entry => entry.source === imageOrigin)) {
    throw new Error('A API não confirmou a exceção img-src.')
  }
  if (after.PowerApps_CSPEnabledCodeApps !== before.PowerApps_CSPEnabledCodeApps ||
      after.PowerApps_CSPReportingEndpoint !== before.PowerApps_CSPReportingEndpoint) {
    throw new Error('Uma configuração não incluída no PATCH mudou durante a verificação.')
  }
  for (const [key, value] of Object.entries(directives)) {
    if (key !== imageKey && JSON.stringify(observed[key]) !== JSON.stringify(value)) {
      throw new Error('Diretiva anterior não preservada: ' + key)
    }
  }
  writeFileSync(join(diagnostics, 'map-csp-applied.json'), JSON.stringify({
    appliedAtUtc: new Date().toISOString(), before, after, backupFile,
  }, null, 2) + '\n', 'utf8')
  console.log(JSON.stringify({ mode: 'applied', environmentId: expectedEnvironment, domain: imageOrigin, verified: true }, null, 2))
}

main().catch(error => { console.error(error.message); process.exitCode = 1 })
