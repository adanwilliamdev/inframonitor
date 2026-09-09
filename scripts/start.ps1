# Script de Inicialização do InfraMonitor
Write-Host "🚀 Iniciando InfraMonitor..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Verifica Java
if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Java não encontrado. Instale o JDK 17 ou superior." -ForegroundColor Red
    pause
    exit 1
}

# Verifica Node.js
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js." -ForegroundColor Red
    pause
    exit 1
}

# Inicia o Backend
Write-Host "📦 Iniciando Backend..." -ForegroundColor Yellow
cd backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "mvn clean spring-boot:run"
cd ..

# Aguarda backend iniciar
Start-Sleep -Seconds 10

# Inicia o Frontend
Write-Host "🎨 Iniciando Frontend..." -ForegroundColor Yellow
cd frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"
cd ..

Write-Host ""
Write-Host "✅ InfraMonitor iniciado com sucesso!" -ForegroundColor Green
Write-Host "🌐 Acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:8080" -ForegroundColor Cyan
Write-Host "📊 H2 Console: http://localhost:8080/h2-console" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..." -ForegroundColor Yellow
pause
