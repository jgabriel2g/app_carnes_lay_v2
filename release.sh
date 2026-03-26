#!/bin/bash
set -e

# Leer version de package.json
VERSION=$(node -p "require('./package.json').version")
echo "📦 Preparando release v${VERSION}..."

# Verificar que estamos en main
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo "❌ Debes estar en la rama main. Estás en: $BRANCH"
  exit 1
fi

# Verificar que gh está autenticado
if ! gh auth status &>/dev/null; then
  echo "❌ No estás autenticado en gh. Ejecuta: gh auth login"
  exit 1
fi

# Exportar GH_TOKEN para electron-builder
export GH_TOKEN=$(gh auth token)
echo "✅ GH_TOKEN configurado"

# Commit de todos los cambios
echo "📝 Commiteando cambios..."
git add -A
git commit -m "release v${VERSION}" || echo "⚠️  No hay cambios nuevos para commitear"

# Crear tag
echo "🏷️  Creando tag v${VERSION}..."
git tag -f "v${VERSION}"

# Push de commits y tag
echo "⬆️  Subiendo a origin..."
git push origin main
git push origin "v${VERSION}" --force

# Build y publish para Windows
echo "🔨 Construyendo y publicando para Windows..."
npm run publish:win

echo ""
echo "✅ Release v${VERSION} publicado exitosamente"
echo "🔗 https://github.com/jgabriel2g/app_carnes_lay_v2/releases/tag/v${VERSION}"
