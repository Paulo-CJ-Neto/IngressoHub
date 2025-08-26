# ingressohub Monorepo Setup Script
Write-Host "🚀 Configurando ingressohub Monorepo..." -ForegroundColor Green

# Instalar dependências raiz
Write-Host "📦 Instalando dependências raiz..." -ForegroundColor Yellow
npm install

# Instalar dependências em todos os workspaces
Write-Host "📦 Instalando dependências dos workspaces..." -ForegroundColor Yellow
npm run install:all

# Build das entidades
Write-Host "🔨 Buildando pacote entities..." -ForegroundColor Yellow
npm run build:entities

Write-Host "✅ Setup concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Para executar o mobile: npm run dev:mobile" -ForegroundColor Cyan
Write-Host "🔌 Para executar a API: npm run dev:api" -ForegroundColor Cyan
Write-Host "🔨 Para buildar tudo: npm run build" -ForegroundColor Cyan
