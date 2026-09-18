#!/usr/bin/env bash
# Bootstrap initial d'un VPS Ubuntu fraîchement provisionné, pour héberger les
# sites générés par ce pipeline : nginx + Let's Encrypt (certbot), un vhost par
# site (voir scripts/deploy-vps.js).
#
# À exécuter UNE SEULE FOIS, en root, sur le serveur neuf :
#   bash scripts/vps-bootstrap.sh

set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Ce script doit être exécuté en root (sudo bash vps-bootstrap.sh)." >&2
  exit 1
fi

echo "→ Mise à jour du système..."
apt-get update -y
apt-get upgrade -y

echo "→ Installation de Node.js 22 LTS..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

echo "→ Installation de nginx, certbot, git..."
apt-get install -y nginx certbot python3-certbot-nginx git ufw

echo "→ Configuration du pare-feu (SSH, HTTP, HTTPS)..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "→ Démarrage de nginx..."
systemctl enable nginx
systemctl start nginx

echo ""
echo "✅ Bootstrap terminé."
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "nginx: $(nginx -v 2>&1)"
echo ""
echo "Prochaine étape :"
echo "  git clone <url-du-repo> && cd seo-geo-automation"
echo "  npm install"
echo "  cp .env.example .env   # remplir ANTHROPIC_API_KEY (et Cloudflare si besoin)"
echo ""
echo "Puis pour un site déjà généré :"
echo "  node scripts/deploy-vps.js --site sites/tonsite --domain tondomaine.com --email toi@example.com"
