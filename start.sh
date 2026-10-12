#!/usr/bin/env bash
# Startet den On Track 2 Trainer: prüft Node, installiert Abhängigkeiten bei Bedarf, startet den Dev-Server.
# Aufruf: ./start.sh   (weitere Argumente gehen an Vite, z. B. ./start.sh --host)
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js fehlt – bitte Node 22.12 oder neuer installieren (https://nodejs.org)." >&2
  exit 1
fi

# Vite 8 braucht Node ^20.19 oder >=22.12
if ! node -e '
  const [maj, min] = process.versions.node.split(".").map(Number);
  process.exit((maj === 20 && min >= 19) || (maj === 22 && min >= 12) || maj > 22 ? 0 : 1);
'; then
  echo "Node $(node -v) ist zu alt – bitte Node 22.12 oder neuer installieren." >&2
  exit 1
fi

# Abhängigkeiten installieren, wenn sie fehlen oder package-lock.json neuer ist
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  echo "Installiere Abhängigkeiten …"
  npm install
fi

echo "Starte den Trainer – die Adresse (meist http://localhost:5173/) steht gleich unten."
exec npm run dev -- "$@"
