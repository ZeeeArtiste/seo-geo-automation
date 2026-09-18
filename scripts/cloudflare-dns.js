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
 * Deux pièges, tous les deux sources de faux diagnostics :
 *
 * 1. `GET /zones?name=X` renvoie `success: true` avec une liste VIDE quand le token
 *    n'a pas Zone:Read — et non un 403. "Zone absente" et "zone invisible" sont
 *    donc indistinguables par ce seul appel.
 * 2. Sonder un zone-id inexistant sur l'endpoint DNS renvoie 403 QUOI QU'IL ARRIVE,
 *    puisque cette zone n'est dans le scope d'aucun token. Ce n'est donc PAS une
 *    preuve d'absence de permission DNS (faux négatif garanti).
 *
 * Conséquence : la permission DNS n'est vérifiable que contre une zone RÉELLE.
 * Tant que le compte n'a aucune zone, le résultat est 'indeterminate' — et il ne
 * faut surtout pas le traiter comme un refus.
 */
export async function checkTokenPermissions() {
  const h = headers();
  const out = {
    tokenValid: null,
    zoneCount: null,
    zones: [],
    dnsAccess: 'indeterminate', // 'granted' | 'denied' | 'indeterminate'
    notes: [],
  };

  // Validité : les tokens "account-owned" échouent sur /user/tokens/verify (401)
  // alors qu'ils sont parfaitement valides. On teste donc les deux endpoints.
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  for (const url of [
    accountId ? `${BASE}/accounts/${accountId}/tokens/verify` : null,
    `${BASE}/user/tokens/verify`,
  ].filter(Boolean)) {
    const r = await fetch(url, { headers: h });
    const j = await r.json().catch(() => ({}));
    if (j.success) {
      out.tokenValid = true;
      out.notes.push(`Token validé via ${url.includes('/accounts/') ? 'l\'endpoint compte (token account-owned)' : 'l\'endpoint utilisateur'}.`);
      break;
    }
    out.tokenValid = false;
  }

  const zres = await fetch(`${BASE}/zones?per_page=50`, { headers: h });
  const zj = await zres.json().catch(() => ({}));
  if (zj.success) {
    out.zones = (zj.result || []).map((z) => ({ name: z.name, id: z.id }));
    out.zoneCount = out.zones.length;
  } else {
    out.notes.push(`GET /zones a échoué: ${JSON.stringify(zj.errors)}`);
  }

  if (!out.zoneCount) {
    out.notes.push(
      "Aucune zone dans ce compte : la permission DNS n'est pas vérifiable pour l'instant " +
        '(il faut une zone réelle pour la tester).'
    );
    out.dnsAccess = 'indeterminate';
    return out;
  }

  // Test décisif : lister les enregistrements d'une zone réellement accessible.
  const z = out.zones[0];
  const dres = await fetch(`${BASE}/zones/${z.id}/dns_records?per_page=1`, { headers: h });
  if (dres.ok) {
    out.dnsAccess = 'granted';
    out.notes.push(`Lecture DNS confirmée sur la zone réelle "${z.name}".`);
  } else if (dres.status === 403) {
    out.dnsAccess = 'denied';
    out.notes.push(
      `403 en listant le DNS de la zone réelle "${z.name}" : il manque Zone:DNS:Edit.`
    );
  } else {
    out.notes.push(`Réponse inattendue sur le DNS de "${z.name}": HTTP ${dres.status}`);
  }

  return out;
}
