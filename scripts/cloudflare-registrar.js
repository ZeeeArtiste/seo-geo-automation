/**
 * Wrapper léger autour de la Cloudflare Registrar API (beta).
 * Doc: https://developers.cloudflare.com/registrar/registrar-api/
 *
 * Nécessite dans .env :
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_API_TOKEN   (token avec permission "Registrar write")
 */
const BASE = 'https://api.cloudflare.com/client/v4';

function assertEnv() {
  if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
    throw new Error(
      'CLOUDFLARE_ACCOUNT_ID et CLOUDFLARE_API_TOKEN doivent être définis dans .env ' +
      '(voir README.md § Cloudflare Registrar)'
    );
  }
}

function headers() {
  return {
    'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

/** Recherche de candidats à partir d'un mot-clé (données mises en cache côté Cloudflare, pas la vérité finale). */
export async function searchDomains(query, limit = 5) {
  assertEnv();
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const url = `${BASE}/accounts/${accountId}/registrar/domain-search?q=${encodeURIComponent(query)}&limit=${limit}`;
  const res = await fetch(url, { headers: headers() });
  const data = await res.json();
  if (!data.success) throw new Error(`Cloudflare search error: ${JSON.stringify(data.errors)}`);
  return data.result.domains; // [{name, registrable, pricing: {registration_cost, ...}}]
}

/** Vérification en temps réel — à appeler juste avant tout enregistrement. Max 20 domaines par appel. */
export async function checkDomains(domains) {
  assertEnv();
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const url = `${BASE}/accounts/${accountId}/registrar/domain-check`;
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ domains }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Cloudflare check error: ${JSON.stringify(data.errors)}`);
  return data.result.domains; // [{name, registrable, pricing?, reason?}]
}

/** Enregistrement effectif — PAYANT ET NON REMBOURSABLE une fois réussi. */
export async function registerDomain(domainName) {
  assertEnv();
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const url = `${BASE}/accounts/${accountId}/registrar/registrations`;
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ domain_name: domainName }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Cloudflare registration error: ${JSON.stringify(data.errors)}`);
  return data.result; // {domain_name, state, completed, context?, links}
}

export async function pollRegistrationStatus(domainName) {
  assertEnv();
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const url = `${BASE}/accounts/${accountId}/registrar/registrations/${domainName}/registration-status`;
  const res = await fetch(url, { headers: headers() });
  const data = await res.json();
  if (!data.success) throw new Error(`Cloudflare status error: ${JSON.stringify(data.errors)}`);
  return data.result;
}
