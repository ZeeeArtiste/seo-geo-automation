/**
 * Wrapper léger autour de la Cloudflare DNS API, pour pointer un domaine
 * fraîchement enregistré vers ce serveur.
 *
 * Nécessite dans .env :
 *   CLOUDFLARE_API_TOKEN  avec les permissions :
 *     - Zone / Zone / Read   (pour retrouver la zone par son nom)
 *     - Zone / DNS  / Edit   (pour créer/mettre à jour les enregistrements A)
 *
 * Un token "Registrar: write" seul NE SUFFIT PAS (403 Authentication error).
 */
const BASE = 'https://api.cloudflare.com/client/v4';

function headers() {
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    throw new Error('CLOUDFLARE_API_TOKEN manquant dans .env');
  }
  return {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, { ...opts, headers: headers() });
  const data = await res.json().catch(() => ({}));
  if (!data.success) {
    const errs = JSON.stringify(data.errors ?? `HTTP ${res.status}`);
    if (res.status === 403) {
      throw new Error(
        `Cloudflare a refusé l'appel (403) sur ${path} — il manque très probablement ` +
          `les permissions "Zone:Read" et "Zone:DNS:Edit" sur votre token. Détail: ${errs}`
      );
    }
    throw new Error(`Cloudflare API error sur ${path}: ${errs}`);
  }
  return data.result;
}

/** Retrouve une zone par son nom. Renvoie null si absente. */
export async function getZone(name) {
  const zones = await api(`/zones?name=${encodeURIComponent(name)}`);
  return zones.length ? zones[0] : null;
}

/**
 * Attend que la zone existe. Cloudflare Registrar crée la zone automatiquement
 * après un enregistrement réussi, mais avec quelques secondes de latence.
 */
export async function waitForZone(name, { timeoutMs = 120000, intervalMs = 5000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const zone = await getZone(name);
    if (zone) return zone;
    if (Date.now() >= deadline) {
      throw new Error(
        `La zone "${name}" n'est pas apparue dans ce compte Cloudflare après ` +
          `${Math.round(timeoutMs / 1000)}s. Le domaine est-il bien enregistré sur ce compte ?`
      );
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

export async function listARecords(zoneId, name) {
  return api(`/zones/${zoneId}/dns_records?type=A&name=${encodeURIComponent(name)}`);
}

/**
 * Crée l'enregistrement A, ou le met à jour s'il existe déjà avec une autre IP.
 * Idempotent : relancer le script ne duplique rien.
 * Renvoie { action: 'created'|'updated'|'unchanged', record }
 */
export async function upsertARecord(zoneId, name, ip, { proxied = false, ttl = 300 } = {}) {
  const existing = await listARecords(zoneId, name);

  if (existing.length === 0) {
    const record = await api(`/zones/${zoneId}/dns_records`, {
      method: 'POST',
      body: JSON.stringify({ type: 'A', name, content: ip, ttl, proxied }),
    });
    return { action: 'created', record };
  }

  const current = existing[0];
  if (current.content === ip && current.proxied === proxied) {
    return { action: 'unchanged', record: current };
  }

  const record = await api(`/zones/${zoneId}/dns_records/${current.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ type: 'A', name, content: ip, ttl, proxied }),
  });
  return { action: 'updated', record };
}

/** IP publique IPv4 de CETTE machine (c'est elle qui héberge nginx). */
export async function detectPublicIp() {
  const sources = ['https://api.ipify.org', 'https://ifconfig.me/ip'];
  for (const url of sources) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const ip = (await res.text()).trim();
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return ip;
    } catch {
      /* source suivante */
    }
  }
  throw new Error("Impossible de détecter l'IP publique — passez-la explicitement avec --ip");
}

/**
 * Diagnostic des permissions du token, sans rien modifier.
 *
 * Subtilité : /zones?name=X renvoie `success: true` avec une liste vide quand le
 * token n'a pas Zone:Read — impossible de distinguer "zone absente" de "zone
 * invisible". On sonde donc en plus un zone-id inexistant mais bien formé sur
 * l'endpoint DNS : un 403 signale l'absence de permission DNS.
 */
export async function checkTokenPermissions() {
  const h = headers();
  const out = { zoneRead: null, dnsEdit: null, zoneCount: null, notes: [] };

  const zres = await fetch(`${BASE}/zones?per_page=50`, { headers: h });
  const zj = await zres.json().catch(() => ({}));
  if (zj.success) {
    out.zoneCount = (zj.result || []).length;
    out.zones = (zj.result || []).map((z) => z.name);
  } else {
    out.notes.push(`GET /zones a échoué: ${JSON.stringify(zj.errors)}`);
  }

  const fake = '0'.repeat(32);
  const dres = await fetch(`${BASE}/zones/${fake}/dns_records`, { headers: h });
  if (dres.status === 403) {
    out.dnsEdit = false;
    out.notes.push(
      "403 sur l'endpoint DNS : le token n'a pas accès aux enregistrements DNS."
    );
  } else if (dres.status === 404 || dres.status === 400) {
    out.dnsEdit = true;
    out.notes.push(
      'Le token atteint bien l\'endpoint DNS (la zone sondée est inexistante, ce qui est attendu).'
    );
  } else {
    out.notes.push(`Réponse inattendue de l'endpoint DNS: HTTP ${dres.status}`);
  }

  out.zoneRead = out.zoneCount !== null && out.dnsEdit !== false ? true : out.dnsEdit === false ? false : null;
  return out;
}
