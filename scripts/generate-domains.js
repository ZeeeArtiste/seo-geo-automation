#!/usr/bin/env node
/**
 * Génère 10 suggestions de noms de domaine pour une niche donnée.
 * N'ACHÈTE RIEN — donne juste des suggestions. Vérifiez la disponibilité
 * manuellement (whois) ou via l'API de votre registrar avant tout achat.
 *
 * Usage: node scripts/generate-domains.js --niche "aspirateurs robots"
 */
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import minimist from 'minimist';
import { checkDomains } from './cloudflare-registrar.js';

const args = minimist(process.argv.slice(2));
const niche = args.niche;
const checkAvailability = !!args['check-availability'];

if (!niche) {
  console.error('Usage: node generate-domains.js --niche "votre niche" [--check-availability]');
  process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY manquant dans .env');
  process.exit(1);
}

const client = new Anthropic();

async function main() {
  const msg = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Tu es expert en branding et en SEO. Pour la niche "${niche}", propose 10 noms
de domaine courts (moins de 15 caractères si possible), mémorisables, en .com ou .fr,
qui sonnent comme une marque légitime de comparateur/guide d'achat (pas "meilleur-${niche}-pas-cher.com",
évite les noms qui crient "site d'affiliation généré en masse").

Réponds UNIQUEMENT en JSON, sans texte autour, format :
[{"domain": "exemple.com", "reasoning": "pourquoi ce nom fonctionne en une phrase"}]`
    }]
  });

  const text = msg.content.find(b => b.type === 'text')?.text ?? '[]';
  const clean = text.replace(/```json|```/g, '').trim();
  let suggestions;
  try {
    suggestions = JSON.parse(clean);
  } catch (e) {
    console.error('Réponse non-JSON reçue:', text);
    process.exit(1);
  }

  if (!checkAvailability) {
    console.log(`\nSuggestions de domaines pour "${niche}":\n`);
    suggestions.forEach((s, i) => console.log(`${i + 1}. ${s.domain} — ${s.reasoning}`));
    console.log('\n⚠️  Disponibilité non vérifiée (données du LLM, pas fiables). Relancez avec --check-availability');
    console.log('   pour interroger la Cloudflare Registrar API en temps réel.\n');
    return;
  }

  console.log('\nVérification en temps réel via Cloudflare Registrar API...\n');
  const names = suggestions.map(s => s.domain);
  // L'API accepte 20 domaines max par appel — 10 suggestions passe largement.
  const results = await checkDomains(names);

  const byName = new Map(results.map(r => [r.name, r]));
  suggestions.forEach((s, i) => {
    const check = byName.get(s.domain);
    if (!check) {
      console.log(`${i + 1}. ${s.domain} — non vérifiable (extension probablement non supportée par l'API)`);
    } else if (check.registrable) {
      console.log(`${i + 1}. ✅ ${s.domain} — DISPONIBLE — ${check.pricing.registration_cost} ${check.pricing.currency}/an — ${s.reasoning}`);
    } else {
      console.log(`${i + 1}. ❌ ${s.domain} — indisponible (${check.reason || 'raison inconnue'})`);
    }
  });

  console.log('\nPour enregistrer un domaine disponible :');
  console.log(`  node scripts/register-domain.js --domain "nom-choisi.dev"\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
