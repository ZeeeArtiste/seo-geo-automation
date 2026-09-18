#!/usr/bin/env bash
# Surveillance locale d'un certificat Let's Encrypt.
#
# Let's Encrypt a cessé d'envoyer des emails d'expiration le 4 juin 2025
# (letsencrypt.org/2025/01/22/ending-expiration-emails/). Ce script remplace
# cette alerte, sans dépendance externe.
#
# Il vérifie DEUX choses, car elles échouent indépendamment :
#   1. la date d'expiration du certificat SUR LE DISQUE (le renouvellement a-t-il eu lieu ?)
#   2. la date d'expiration du certificat RÉELLEMENT SERVI par nginx
#      (un renouvellement réussi mais sans reload laisse nginx servir l'ancien)
#
# Usage:
#   check-cert.sh                          # TOUS les certificats de la machine (auto-découverte)
#   check-cert.sh --domain aspirob.com     # un seul domaine
#   check-cert.sh --warn-days 30           # seuil d'alerte personnalisé
# Sortie: 0 si tout va bien, 1 si alerte. Journalise via logger (journalctl -t cert-check).

set -uo pipefail

DOMAIN=""
WARN_DAYS=21

while [ $# -gt 0 ]; do
  case "$1" in
    --domain) DOMAIN="$2"; shift 2 ;;
    --warn-days) WARN_DAYS="$2"; shift 2 ;;
    *) echo "Option inconnue: $1" >&2; exit 2 ;;
  esac
done


status=0

note() { echo "$1"; logger -t cert-check "$1"; }
alert() { echo "ALERTE: $1" >&2; logger -t cert-check -p user.err "ALERTE: $1"; status=1; }

days_left_from_date() {
  local end_epoch now_epoch
  end_epoch=$(date -d "$1" +%s 2>/dev/null) || return 1
  now_epoch=$(date +%s)
  echo $(( (end_epoch - now_epoch) / 86400 ))
}

check_one() {
  local DOMAIN="$1"
  local CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
  local disk_days="" disk_end served_end served_days

  # ── 1. Certificat sur le disque
  if [ ! -f "$CERT" ]; then
    alert "$DOMAIN : aucun certificat sur le disque ($CERT)"
  else
    disk_end=$(openssl x509 -enddate -noout -in "$CERT" | cut -d= -f2)
    disk_days=$(days_left_from_date "$disk_end") || disk_days=""
    if [ -z "$disk_days" ]; then
      alert "$DOMAIN : date d'expiration illisible sur le disque"
    elif [ "$disk_days" -lt 0 ]; then
      alert "$DOMAIN : certificat sur disque EXPIRÉ depuis $(( -disk_days )) jour(s)"
    elif [ "$disk_days" -lt "$WARN_DAYS" ]; then
      alert "$DOMAIN : expire dans $disk_days jour(s) — le renouvellement automatique n'a pas eu lieu"
    else
      note "$DOMAIN : certificat disque OK, $disk_days jour(s) restants"
    fi
  fi

  # ── 2. Certificat réellement servi par nginx
  served_end=$(echo | timeout 15 openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null \
               | openssl x509 -enddate -noout 2>/dev/null | cut -d= -f2)

  if [ -z "$served_end" ]; then
    alert "$DOMAIN : impossible de récupérer le certificat servi sur le port 443"
  else
    served_days=$(days_left_from_date "$served_end") || served_days=""
    if [ -z "$served_days" ]; then
      alert "$DOMAIN : date d'expiration illisible sur le certificat servi"
    elif [ "$served_days" -lt "$WARN_DAYS" ]; then
      alert "$DOMAIN : le certificat SERVI expire dans $served_days jour(s)"
    else
      note "$DOMAIN : certificat servi OK, $served_days jour(s) restants"
    fi

    # Écart disque/servi = renouvellement effectué mais nginx pas rechargé
    if [ -n "${disk_days:-}" ] && [ -n "$served_days" ] \
       && [ $(( disk_days - served_days )) -gt 1 ]; then
      alert "$DOMAIN : nginx sert un certificat plus ancien que celui du disque " \
            "(disque ${disk_days}j / servi ${served_days}j) — un reload est nécessaire"
    fi
  fi
}

# Sans --domain, on découvre tous les certificats présents. Ainsi un nouveau
# domaine déployé par deploy-vps.js est surveillé automatiquement, sans avoir
# à créer un service systemd par domaine.
if [ -n "$DOMAIN" ]; then
  check_one "$DOMAIN"
else
  found=0
  for dir in /etc/letsencrypt/live/*/; do
    [ -f "$dir/fullchain.pem" ] || continue
    check_one "$(basename "$dir")"
    found=$((found + 1))
  done
  if [ "$found" -eq 0 ]; then
    note "Aucun certificat Let's Encrypt sur cette machine — rien à vérifier"
  else
    note "$found certificat(s) vérifié(s)"
  fi
fi

exit $status
