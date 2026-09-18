#!/usr/bin/env node
/**
 * Déploie un site Astro déjà généré sur CE serveur, via nginx + Let's Encrypt.
 * À exécuter EN ROOT, directement sur le VPS (pas depuis une machine distante) —
 * voir scripts/vps-bootstrap.sh pour préparer le serveur au préalable.
 *
 * Usage:
 *   node scripts/deploy-vps.js --site sites/cleantop --domain cleantop.example.com \
 *     [--email vous@example.com] [--no-ssl]
 *
 * Sans --email, certbot est appelé avec --register-unsafely-without-email (pas
 * d'alerte d'expiration de certificat envoyée). Avec --no-ssl, le site reste en
 * HTTP simple (utile pour un premier test avant que le DNS du domaine ne pointe
 * vers ce serveur — certbot a besoin du DNS déjà propagé pour valider le domaine).
 */
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));
const siteDir = args.site;
const domain = args.domain;
const email = args.email;
const skipSsl = !!args['no-ssl'];

if (!siteDir || !domain) {
  console.error(
    'Usage: node deploy-vps.js --site sites/xxx --domain votredomaine.com [--email vous@example.com] [--no-ssl]'
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

  console.log(`\n▶ Certificat SSL (Let's Encrypt) pour ${domain}`);
  const emailFlag = email ? `--email ${email}` : '--register-unsafely-without-email';
  try {
    run(
      `certbot --nginx -d ${domain} -d www.${domain} ${emailFlag} --agree-tos --non-interactive --redirect`
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
