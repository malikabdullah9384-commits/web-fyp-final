Write-Host ""
Write-Host "  FYP Management System" -ForegroundColor Cyan
Write-Host "  Foundation University Islamabad" -ForegroundColor Cyan
Write-Host ""

# Start MongoDB
$mongodPath = "D:\mongodb-extract\mongodb-win32-x86_64-windows-7.0.21\bin\mongod.exe"
$mongoRunning = Get-Process mongod -ErrorAction SilentlyContinue
if (-not $mongoRunning) {
    Write-Host "  [1/3] Starting MongoDB..." -ForegroundColor Yellow
    Start-Process -FilePath $mongodPath -ArgumentList "--dbpath D:\mongodb\data\db --logpath D:\mongodb\logs\mongod.log --port 27017" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "  [1/3] MongoDB started" -ForegroundColor Green
} else {
    Write-Host "  [1/3] MongoDB already running" -ForegroundColor Green
}

# Start Backend
Write-Host "  [2/3] Starting Backend (port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Abdullah\fyp-management-system\backend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "  [3/3] Starting Frontend (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Abdullah\fyp-management-system\frontend'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "  All services starting..." -ForegroundColor Green
Write-Host "  Browser will open at http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  LOGIN CREDENTIALS" -ForegroundColor White
Write-Host "  ─────────────────────────────────────────"
Write-Host "  SuperAdmin : superadmin@fui.edu.pk / SuperAdmin@123"
Write-Host "  Admin      : admin@fui.edu.pk      / Admin@123"
Write-Host "  Supervisor : asad@fui.edu.pk        / Asad@123"
Write-Host "  Student    : abdullah@fui.edu.pk    / Abdullah@123"
Write-Host "  ─────────────────────────────────────────"
Write-Host ""
