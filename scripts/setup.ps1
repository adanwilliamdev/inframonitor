# Setup Inicial do InfraMonitor
Write-Host "🔧 Configurando InfraMonitor..." -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Verifica Java
if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Java não encontrado. Instale o JDK 17 ou superior." -ForegroundColor Red
    pause
    exit 1
}

# Verifica Maven
if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Maven não encontrado. Tentando continuar..." -ForegroundColor Yellow
}

# Backend
Write-Host "📦 Configurando Backend..." -ForegroundColor Yellow
cd backend
if (Get-Command mvn -ErrorAction SilentlyContinue) {
    mvn clean install -DskipTests
} else {
    Write-Host "ℹ️  Maven não disponível. Pulando build do backend." -ForegroundColor Yellow
}
cd ..

# Frontend
Write-Host "🎨 Configurando Frontend..." -ForegroundColor Yellow
cd frontend
if (Get-Command npm -ErrorAction SilentlyContinue) {
    npm install
} else {
    Write-Host "❌ npm não encontrado. Instale o Node.js." -ForegroundColor Red
    pause
    exit 1
}
cd ..

Write-Host ""
Write-Host "✅ Setup concluído com sucesso!" -ForegroundColor Green
Write-Host "🚀 Execute scripts\start.ps1 para iniciar o sistema." -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..." -ForegroundColor Yellow
pause
