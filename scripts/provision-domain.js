#!/usr/bin/env node
/**
 * Automatise le cycle complet d'un domaine : vérification → achat → zone → DNS.
 *
 *   1. Vérifie la disponibilité et le prix réel (Cloudflare Registrar)
 *   2. Achète le domaine            ← UNIQUEMENT avec --confirm (débit immédiat)
 *   3. Attend que la zone apparaisse (Registrar la crée automatiquement)
 *   4. Crée les enregistrements A du domaine nu et de www vers CE serveur
 *
 * Idempotent : si le domaine est déjà enregistré sur ce compte, l'étape d'achat
 * est sautée et seule la partie DNS est (re)appliquée.
 *
 * Usage:
 *   node scripts/provision-domain.js --domain aspirob.com            # dry-run complet, ne paie rien
 *   node scripts/provision-domain.js --domain aspirob.com --confirm  # achète puis configure le DNS
 *   node scripts/provision-domain.js --domain aspirob.com --confirm --ip 1.2.3.4
 *
 * ⚠️  L'achat est NON REMBOURSABLE. Prérequis côté Cloudflare, à faire une fois
 * dans le dashboard, sinon l'étape 2 échoue : moyen de paiement par défaut ET
 * contact registrant par défaut configurés.
 */
import 'dotenv/config';
import minimist from 'minimist';
import { checkDomains, registerDomain, pollRegistrationStatus } from './cloudflare-registrar.js';
import {
  getZone,
  waitForZone,
  upsertARecord,
  detectPublicIp,
  checkTokenPermissions,
} from './cloudflare-dns.js';

const args = minimist(process.argv.slice(2));
const domain = args.domain;
const confirmed = !!args.confirm;
const proxied = !!args.proxied;

if (!domain) {
  console.error(
    'Usage: node provision-domain.js --domain aspirob.com [--confirm] [--ip 1.2.3.4] [--proxied]'
  );
  process.exit(1);
}

async function main() {
  const ip = args.ip || (await detectPublicIp());

  // ── Préflight. On ne bloque que sur un refus DÉMONTRÉ : quand le compte n'a
  // encore aucune zone, la permission DNS est invérifiable (il faut une zone réelle
  // pour la tester), et bloquer là-dessus rendrait tout premier achat impossible.
  console.log('▶ 0/4 Préflight des permissions du token');
  const perms = await checkTokenPermissions();
  console.log(
    `   Token: ${perms.tokenValid ? 'valide' : 'INVALIDE'} | zones visibles: ${
      perms.zoneCount ?? '?'
    } | accès DNS: ${
      { granted: '✅ confirmé', denied: '❌ refusé', indeterminate: '❓ invérifiable' }[perms.dnsAccess]
    }`
  );
  perms.notes.forEach((n) => console.log(`   · ${n}`));

  if (perms.tokenValid === false) {
    console.error(`\n❌ Token Cloudflare invalide — corrigez CLOUDFLARE_API_TOKEN dans .env.`);
    process.exit(1);
  }

  if (perms.dnsAccess === 'denied') {
    console.error(
      `\n❌ Le token n'a pas Zone:DNS:Edit (refus démontré sur une zone réelle).\n` +
        `   J'interromps ICI, avant tout achat : acheter puis échouer sur le DNS vous\n` +
        `   laisserait avec un domaine payé et non configuré.`
    );
    process.exit(1);
  }

  if (perms.dnsAccess === 'indeterminate' && confirmed) {
    console.log(
      `\n⚠️  La permission DNS ne peut pas être vérifiée avant l'achat (aucune zone sur ce\n` +
        `   compte — c'est justement l'achat qui crée la première zone). Je continue.\n` +
        `   Filet de sécurité : si le DNS échoue après l'achat, le domaine reste acquis et\n` +
        `   il suffira de corriger le token puis de relancer cette même commande — l'étape\n` +
        `   d'achat sera sautée et seul le DNS sera appliqué. Rien n'est perdu.`
    );
  }

  // ── 1. Disponibilité / déjà possédé ?
  console.log(`\n▶ 1/4 Vérification de "${domain}"`);
  const existingZone = await getZone(domain);
  let alreadyOwned = !!existingZone;

  if (alreadyOwned) {
    console.log(`   Déjà présent sur ce compte (zone ${existingZone.id}) — achat sauté.`);
  } else {
    const [check] = await checkDomains([domain]);
    if (!check || !check.registrable) {
      console.error(`\n❌ "${domain}" n'est pas enregistrable via l'API.` +
        (check?.reason ? ` Raison: ${check.reason}` : ''));
      process.exit(1);
    }
    console.log(`   ✅ Disponible — ${check.pricing.registration_cost} ${check.pricing.currency} ` +
      `la 1ère année, puis ${check.pricing.renewal_cost} ${check.pricing.currency}/an`);

    // ── 2. Achat
    if (!confirmed) {
      console.log(`\n▶ 2/4 Achat — SAUTÉ (dry-run)`);
      console.log(`\n▶ 3/4 Attente de la zone — sauté`);
      console.log(`▶ 4/4 DNS — voici ce qui SERAIT créé :`);
      console.log(`   A  ${domain}      → ${ip}  (proxied=${proxied})`);
      console.log(`   A  www.${domain}  → ${ip}  (proxied=${proxied})`);
      console.log(
        `\nAucun débit, aucune modification. Relancez avec --confirm pour acheter ` +
          `et configurer réellement.\n`
      );
      return;
    }

    console.log(`\n▶ 2/4 Achat (facturation immédiate, non remboursable)`);
    const result = await registerDomain(domain);
    let state = result.state;
    if (!result.completed) {
      console.log(`   État "${state}" — attente de finalisation...`);
      let status = await pollRegistrationStatus(domain);
      for (let i = 0; !status.completed && i < 20; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        status = await pollRegistrationStatus(domain);
      }
      state = status.state;
    }
    if (state !== 'succeeded') {
      console.error(
        `\n❌ Enregistrement non abouti (état: ${state}).\n` +
          `   Si l'état est "action_required", ouvrez le dashboard Cloudflare : il manque\n` +
          `   généralement le moyen de paiement ou le contact registrant par défaut.`
      );
      process.exit(1);
    }
    console.log(`   ✅ "${domain}" enregistré.`);
  }

  // ── 3. Zone
  console.log(`\n▶ 3/4 Attente de la zone Cloudflare`);
  const zone = existingZone || (await waitForZone(domain));
  console.log(`   Zone ${zone.id} — statut: ${zone.status}`);
  if (zone.name_servers?.length) console.log(`   NS: ${zone.name_servers.join(', ')}`);

  // ── 4. DNS
  console.log(`\n▶ 4/4 Enregistrements DNS → ${ip}`);
  for (const name of [domain, `www.${domain}`]) {
    const { action, record } = await upsertARecord(zone.id, name, ip, { proxied });
    const label = { created: '✅ créé', updated: '♻️  mis à jour', unchanged: '= inchangé' }[action];
    console.log(`   ${label}  A  ${record.name} → ${record.content} (TTL ${record.ttl})`);
  }

  console.log(`\n✅ Domaine provisionné.\n`);
  console.log(`Vérifier la propagation :`);
  console.log(`  dig +short ${domain} @1.1.1.1`);
  console.log(`\nPuis activer HTTPS :`);
  console.log(`  node scripts/deploy-vps.js --site sites/<slug> --domain ${domain} --email vous@example.com\n`);
  if (proxied) {
    console.log(
      `⚠️  --proxied est actif : le challenge HTTP-01 de certbot peut échouer derrière le ` +
        `proxy Cloudflare. Désactivez le proxy le temps d'obtenir le certificat.\n`
    );
  }
}

main().catch((err) => {
  console.error('\nErreur:', err.message);
  process.exit(1);
});
