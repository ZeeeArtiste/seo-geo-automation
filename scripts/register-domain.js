#!/usr/bin/env node
/**
 * Enregistre un domaine via la Cloudflare Registrar API.
 * L'enregistrement est PAYANT ET NON REMBOURSABLE une fois réussi — ce script
 * affiche donc toujours le prix réel et exige --confirm avant de payer quoi que ce soit.
 *
 * Usage:
 *   node scripts/register-domain.js --domain "cleantop.dev"              # affiche juste le prix
 *   node scripts/register-domain.js --domain "cleantop.dev" --confirm    # enregistre réellement
 */
import 'dotenv/config';
import minimist from 'minimist';
import { checkDomains, registerDomain, pollRegistrationStatus } from './cloudflare-registrar.js';

const args = minimist(process.argv.slice(2));
const domain = args.domain;
const confirmed = !!args.confirm;

if (!domain) {
  console.error('Usage: node register-domain.js --domain "nom.dev" [--confirm]');
  process.exit(1);
}

async function main() {
  console.log(`Vérification de "${domain}" auprès de Cloudflare...`);
  const [check] = await checkDomains([domain]);

  if (!check || !check.registrable) {
    console.log(`\n❌ "${domain}" n'est pas disponible à l'enregistrement via l'API.`);
    if (check?.reason) console.log(`   Raison: ${check.reason}`);
    process.exit(1);
  }

  console.log(`\n✅ "${domain}" est disponible.`);
  console.log(`   Prix: ${check.pricing.registration_cost} ${check.pricing.currency} (1ère année)`);
  console.log(`   Renouvellement: ${check.pricing.renewal_cost} ${check.pricing.currency}/an`);

  if (!confirmed) {
    console.log(`\nAucun achat effectué. Relancez avec --confirm pour enregistrer réellement ce domaine`);
    console.log(`(le compte de paiement par défaut de votre compte Cloudflare sera débité).`);
    return;
  }

  console.log(`\n💳 Enregistrement en cours (facturation immédiate, non remboursable)...`);
  const result = await registerDomain(domain);

  if (result.completed && result.state === 'succeeded') {
    console.log(`\n✅ "${domain}" enregistré avec succès.`);
    console.log(`   Expire le: ${result.context?.registration?.expires_at}`);
    console.log(`   Auto-renew: ${result.context?.registration?.auto_renew} (activez-le manuellement si voulu)`);
  } else if (!result.completed) {
    console.log(`\n⏳ Enregistrement en cours de traitement (état: ${result.state}). Vérification du statut...`);
    let status = await pollRegistrationStatus(domain);
    let attempts = 0;
    while (!status.completed && attempts < 10) {
      await new Promise(r => setTimeout(r, 3000));
      status = await pollRegistrationStatus(domain);
      attempts++;
    }
    if (status.state === 'succeeded') {
      console.log(`✅ "${domain}" enregistré avec succès.`);
    } else if (status.state === 'action_required') {
      console.log(`⚠️  Action requise de votre part — connectez-vous au dashboard Cloudflare pour la voir.`);
    } else {
      console.log(`État final: ${status.state}. Vérifiez le dashboard Cloudflare pour les détails.`);
    }
  } else {
    console.log(`\n⚠️  État inattendu: ${JSON.stringify(result, null, 2)}`);
  }
}

main().catch(err => {
  console.error('\nErreur:', err.message);
  process.exit(1);
});
