#!/usr/bin/env node
/**
 * Pointe un domaine Cloudflare vers CE serveur : crée/met à jour les
 * enregistrements A pour le domaine nu et pour www.
 *
 * Idempotent — relancer ne crée pas de doublons.
 *
 * Usage:
 *   node scripts/configure-dns.js --domain aspirob.com                 # IP auto-détectée
 *   node scripts/configure-dns.js --domain aspirob.com --ip 1.2.3.4
 *   node scripts/configure-dns.js --domain aspirob.com --proxied       # derrière le CDN Cloudflare
 *   node scripts/configure-dns.js --domain aspirob.com --wait          # attend que la zone existe
 *
 * ⚠️  --proxied active le proxy Cloudflare (CDN + protection DDoS). À NE PAS utiliser
 * avant d'avoir obtenu le certificat Let's Encrypt : le challenge HTTP-01 de certbot
 * a besoin d'un accès direct au serveur. Activez-le après le passage en HTTPS.
 */
import 'dotenv/config';
import minimist from 'minimist';
import {
  getZone,
  waitForZone,
  upsertARecord,
  detectPublicIp,
  checkTokenPermissions,
} from './cloudflare-dns.js';

const args = minimist(process.argv.slice(2));
const domain = args.domain;
const proxied = !!args.proxied;
const shouldWait = !!args.wait;

if (!domain) {
  console.error(
    'Usage: node configure-dns.js --domain aspirob.com [--ip 1.2.3.4] [--proxied] [--wait]'
  );
  process.exit(1);
}

async function main() {
  if (args['check-token']) {
    console.log('Diagnostic des permissions du token Cloudflare (aucune modification)...\n');
    const r = await checkTokenPermissions();
    console.log(`Zones visibles      : ${r.zoneCount ?? 'inconnu'}${r.zones?.length ? ` (${r.zones.join(', ')})` : ''}`);
    console.log(`Accès DNS records   : ${r.dnsEdit === true ? '✅ oui' : r.dnsEdit === false ? '❌ non' : '❓ indéterminé'}`);
    r.notes.forEach((n) => console.log(`  · ${n}`));
    if (r.dnsEdit === false) {
      console.log(
        `\n👉 Ajoutez à votre token, sur https://dash.cloudflare.com/profile/api-tokens :\n` +
          `   · Zone / Zone / Read\n` +
          `   · Zone / DNS  / Edit\n` +
          `   (en gardant Account / Registrar / Edit pour l'achat de domaine)`
      );
    }
    return;
  }

  const ip = args.ip || (await detectPublicIp());
  console.log(`Domaine : ${domain}`);
  console.log(`Cible   : ${ip}${args.ip ? '' : ' (IP publique auto-détectée de ce serveur)'}`);
  console.log(`Proxy   : ${proxied ? 'activé (CDN Cloudflare)' : 'désactivé (DNS only)'}`);

  const zone = shouldWait
    ? await waitForZone(domain).then((z) => (console.log('\nZone trouvée.'), z))
    : await getZone(domain);

  if (!zone) {
    // Attention : /zones?name= renvoie une liste VIDE (et non un 403) quand le token
    // n'a pas la permission Zone:Read. On ne peut donc pas distinguer les trois cas.
    console.error(
      `\n❌ Zone "${domain}" introuvable avec ce token. Trois causes possibles :\n` +
        `   1. Le token n'a pas la permission "Zone:Read" — un token limité à "Registrar:Edit"\n` +
        `      voit 0 zone même quand la zone existe. C'est la cause la plus fréquente.\n` +
        `      Vérifiez avec : node scripts/configure-dns.js --domain ${domain} --check-token\n` +
        `   2. Le domaine n'est pas encore enregistré, ou la zone vient d'être créée et n'est pas\n` +
        `      encore visible : relancez avec --wait.\n` +
        `   3. Le domaine est enregistré sur un autre compte Cloudflare que ` +
        `${process.env.CLOUDFLARE_ACCOUNT_ID ?? '(account id absent)'}.`
    );
    process.exit(1);
  }

  console.log(`\nZone   : ${zone.name} (${zone.id}) — statut: ${zone.status}`);
  if (zone.name_servers?.length) {
    console.log(`NS     : ${zone.name_servers.join(', ')}`);
  }

  const targets = [domain, `www.${domain}`];
  console.log('');
  for (const name of targets) {
    const { action, record } = await upsertARecord(zone.id, name, ip, { proxied });
    const label = {
      created: '✅ créé',
      updated: '♻️  mis à jour',
      unchanged: '= inchangé',
    }[action];
    console.log(`${label}  A  ${record.name} → ${record.content} (TTL ${record.ttl}, proxied=${record.proxied})`);
  }

  if (zone.status !== 'active') {
    console.log(
      `\n⚠️  La zone est en statut "${zone.status}" — la délégation DNS n'est pas encore effective. ` +
        `Si le domaine vient d'être acheté via Cloudflare Registrar, c'est normal, patientez.`
    );
  }

  console.log(`\nVérifier la propagation :`);
  console.log(`  dig +short ${domain} @1.1.1.1`);
  console.log(`\nPuis activer HTTPS (le DNS doit résoudre pour que certbot valide) :`);
  console.log(`  node scripts/deploy-vps.js --site sites/<slug> --domain ${domain} --email vous@example.com\n`);
}

main().catch((err) => {
  console.error('\nErreur:', err.message);
  process.exit(1);
});
