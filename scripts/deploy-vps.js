#!/usr/bin/env node
/**
 * Déploie un site Astro déjà généré sur CE serveur, via nginx + Let's Encrypt.
 * À exécuter EN ROOT, directement sur le VPS (pas depuis une machine distante) —
 * voir scripts/vps-bootstrap.sh pour préparer le serveur au préalable.
 *
 * Usage:
 *   node scripts/deploy-vps.js --site sites/cleantop --domain cleantop.example.com \
 *     [--email vous@example.com] [--no-ssl] [--force-ssl]
 *
 * Sans --email, certbot est appelé avec --register-unsafely-without-email (pas
 * d'alerte d'expiration de certificat envoyée). Avec --no-ssl, le site reste en
 * HTTP simple (utile pour un premier test avant que le DNS du domaine ne pointe
 * vers ce serveur — certbot a besoin du DNS déjà propagé pour valider le domaine).
 *
 * Avant d'appeler certbot, le script vérifie que le domaine résout réellement.
 * Un domaine qui ne résout pas ferait échouer la validation Let's Encrypt et
 * consommerait le quota d'échecs (5 par nom et par heure) : on reste alors en
 * HTTP plutôt que de brûler ce quota. `--force-ssl` passe outre la vérification.
 */
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import minimist from 'minimist';
import dns from 'dns/promises';

const args = minimist(process.argv.slice(2));
const siteDir = args.site;
const domain = args.domain;
const email = args.email;
// minimist convertit `--no-ssl` en `{ ssl: false }` (convention --no-<flag>),
// donc args['no-ssl'] est toujours undefined. On accepte les deux formes.
const skipSsl = !!args['no-ssl'] || args.ssl === false;
const forceSsl = !!args['force-ssl'];

if (!siteDir || !domain) {
  console.error(
    'Usage: node deploy-vps.js --site sites/xxx --domain votredomaine.com [--email vous@example.com] [--no-ssl] [--force-ssl]'
  );
  process.exit(1);
}

if (typeof process.getuid === 'function' && process.getuid() !== 0) {
  console.error(
    'Ce script doit être exécuté en root (sudo) — il écrit dans /etc/nginx et /var/www.'
  );
  process.exit(1);
}

const fullSitePath = path.resolve(siteDir);
const webRoot = `/var/www/${domain}`;
const nginxAvailable = `/etc/nginx/sites-available/${domain}`;
const nginxEnabled = `/etc/nginx/sites-enabled/${domain}`;

function run(cmd, opts = {}) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

function nginxConfig() {
  return `server {
    listen 80;
    listen [::]:80;
    server_name ${domain} www.${domain};

    root ${webRoot};
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml application/xml text/xml;

    add_header X-Content-Type-Options "nosniff" always;
}
`;
}


/**
 * Vérifie que les noms à certifier résolvent, AVANT d'appeler certbot.
 *
 * Principe (appris à nos dépens) : on ne bloque que sur un échec démontré.
 *   · aucun nom ne résout        → on n'appelle pas certbot (échec garanti,
 *                                  et 2 échecs de quota consommés pour rien)
 *   · seul l'apex résout         → on certifie l'apex seul plutôt que de faire
 *                                  échouer toute la commande à cause de `www`
 *   · résout vers une autre IP   → on AVERTIT sans bloquer : c'est le cas normal
 *                                  derrière un proxy Cloudflare (nuage orange),
 *                                  où le HTTP-01 peut tout à fait aboutir.
 */
async function resolvableNames(names, serverIp) {
  const resolvable = [];
  for (const name of names) {
    try {
      const ips = await dns.resolve4(name);
      resolvable.push(name);
      const onThisServer = serverIp && ips.includes(serverIp);
      console.log(
        `   ${name} → ${ips.join(', ')}${
          onThisServer ? ' ✅' : serverIp ? ' ⚠️  (pas l\'IP de ce serveur)' : ''
        }`
      );
    } catch (e) {
      console.log(`   ${name} → ne résout pas (${e.code ?? e.message})`);
    }
  }
  return resolvable;
}

async function detectServerIp() {
  for (const url of ['https://api.ipify.org', 'https://ifconfig.me/ip']) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const ip = (await res.text()).trim();
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return ip;
    } catch {
      /* source suivante */
    }
  }
  return null;
}

async function main() {
  if (!(await fs.pathExists(fullSitePath))) {
    console.error(`Introuvable: ${fullSitePath}`);
    process.exit(1);
  }

  console.log(`\n▶ Build du site (${siteDir})`);
  run('npm install', { cwd: fullSitePath });
  run('npm run build', { cwd: fullSitePath });

  const distDir = path.join(fullSitePath, 'dist');
  if (!(await fs.pathExists(distDir))) {
    console.error(`Le build n'a produit aucun dossier dist/ dans ${fullSitePath}`);
    process.exit(1);
  }

  console.log(`\n▶ Copie vers ${webRoot}`);
  await fs.ensureDir(webRoot);
  await fs.emptyDir(webRoot);
  await fs.copy(distDir, webRoot);

  console.log(`\n▶ Config nginx (${nginxAvailable})`);
  await fs.writeFile(nginxAvailable, nginxConfig(), 'utf-8');
  if (!(await fs.pathExists(nginxEnabled))) {
    await fs.symlink(nginxAvailable, nginxEnabled);
  }

  run('nginx -t');
  run('systemctl reload nginx');
  console.log(`\n✅ Site servi en HTTP : http://${domain}`);

  if (skipSsl) {
    console.log(
      '\n⚠️  --no-ssl : le site reste en HTTP. Relancez sans ce flag une fois le DNS propagé pour activer HTTPS.'
    );
    return;
  }

  console.log(`\n▶ Vérification DNS avant d'appeler certbot`);
  const serverIp = await detectServerIp();
  if (serverIp) console.log(`   IP de ce serveur : ${serverIp}`);
  let names = [domain, `www.${domain}`];

  if (forceSsl) {
    console.log('   --force-ssl : vérification ignorée.');
  } else {
    names = await resolvableNames(names, serverIp);
    if (names.length === 0) {
      console.log(
        `\n⚠️  Aucun nom ne résout — certbot échouerait à coup sûr et consommerait\n` +
          `   le quota Let's Encrypt (5 échecs par nom et par heure). Le site reste\n` +
          `   servi en HTTP : http://${domain}\n\n` +
          `   Créez les enregistrements A puis relancez :\n` +
          `     node scripts/configure-dns.js --domain ${domain}\n` +
          `     node scripts/deploy-vps.js --site ${siteDir} --domain ${domain}${
            email ? ` --email ${email}` : ''
          }\n`
      );
      return;
    }
    if (names.length < 2) {
      console.log(
        `   Seul ${names.join(', ')} résout — je ne demande le certificat que pour ce nom,\n` +
          `   sinon toute la commande échouerait à cause du nom manquant.`
      );
    }
  }

  console.log(`\n▶ Certificat SSL (Let's Encrypt) pour ${names.join(', ')}`);
  const emailFlag = email ? `--email ${email}` : '--register-unsafely-without-email';
  const domainFlags = names.map((n) => `-d ${n}`).join(' ');
  try {
    run(
      `certbot --nginx ${domainFlags} ${emailFlag} --agree-tos --non-interactive --redirect`
    );
    console.log(`\n✅ HTTPS activé : https://${domain}`);
  } catch (e) {
    console.error(
      `\n❌ certbot a échoué — vérifiez que les enregistrements DNS A/AAAA de ${domain} ` +
        `pointent bien vers l'IP de ce serveur avant de réessayer (la validation Let's Encrypt ` +
        `en a besoin). Le site reste servi en HTTP en attendant : http://${domain}`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
