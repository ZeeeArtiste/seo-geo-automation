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
  // Nom dérivé du domaine : plusieurs sites partagent le même contexte http,
  // deux maps homonymes provoqueraient un échec au rechargement de nginx.
  const mapVar = 'cacheControl';
  return `# Durée de cache par type de ressource. Les fichiers d'Astro portent un hash
# de contenu dans leur nom et peuvent être mis en cache indéfiniment ; le HTML
# doit être revalidé, sinon une correction publiée reste invisible.
map $uri $${mapVar} {
    default                                 "public, max-age=0, must-revalidate";
    ~^/_astro/                              "public, max-age=31536000, immutable";
    ~*\\.(webp|jpg|jpeg|png|svg|ico|woff2)$  "public, max-age=2592000";
}

server {
    listen 80;
    listen [::]:80;
    server_name ${domain} www.${domain};

    root ${webRoot};
    index index.html;

    # Sans cette directive, nginx envoie « Content-Type: text/html » sans
    # charset. Les navigateurs s'en sortent grâce au <meta>, mais tout
    # récupérateur machine qui se fie à l'en-tête retombe sur ISO-8859-1 et
    # lit « approches opposÃ©es » — y compris les crawlers IA.
    charset utf-8;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml application/xml text/xml;

    # ── En-têtes de sécurité ─────────────────────────────────────────────
    # Seul X-Content-Type-Options était posé. Pas de Content-Security-Policy
    # ici : le site embarque des scripts inline (suivi de lecture du sommaire)
    # qu'une CSP stricte casserait — à ajouter avec un nonce si besoin.
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), interest-cohort=()" always;
    # HSTS : n'a d'effet qu'en HTTPS, donc inoffensif tant que certbot n'est
    # pas passé. Sans preload, pour rester réversible.
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Durée de cache calculée par le map ci-dessus. Volontairement ici et non
    # dans des blocs location : un add_header placé dans un location ANNULE
    # tous ceux hérités du serveur — les en-têtes de sécurité disparaîtraient
    # des pages HTML sans le moindre avertissement de nginx.
    add_header Cache-Control $cacheControl always;

    # Page 404 du site plutôt que celle de nginx, qui expose sa version.
    error_page 404 /404.html;
    server_tokens off;
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
    // www répondait 200 avec un contenu identique : seule la balise canonical
    // évitait la duplication. On ajoute la redirection dans le bloc 443 que
    // certbot vient de créer — après son passage, pour ne pas lui compliquer
    // le repérage des blocs server.
    const conf = await fs.readFile(nginxAvailable, 'utf-8');
    if (!conf.includes('# redirection www')) {
      const patched = conf.replace(
        /(listen 443 ssl;[^\n]*\n)/,
        `$1\n    # redirection www vers le domaine nu\n    if ($host = www.${domain}) {\n        return 301 https://${domain}$request_uri;\n    }\n`
      );
      if (patched !== conf) {
        await fs.writeFile(nginxAvailable, patched, 'utf-8');
        run('nginx -t');
        run('systemctl reload nginx');
        console.log(`   www.${domain} redirige désormais vers ${domain}`);
      }
    }

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
