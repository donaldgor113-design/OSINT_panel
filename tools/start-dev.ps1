# start-dev.ps1 - launch Vite dev server detached (survives wrapper exit)
param(
  [int]$Port = 5173
)

$ErrorActionPreference = "Stop"
$root = "D:\УКА\Soft\osint_panel\webapp"
$tmpDir = "C:\Users\PC\AppData\Local\Temp\opencode"
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null
$logFile = Join-Path $tmpDir "vite-dev.log"
$pidFile = Join-Path $tmpDir "vite-dev.pid"

$oldPid = 0
if (Test-Path $pidFile) { $oldPid = [int](Get-Content $pidFile) }
if ($oldPid -gt 0) {
  $existing = Get-Process -Id $oldPid -ErrorAction SilentlyContinue
  if ($existing -and $existing.ProcessName -match "node") {
    Write-Output "Dev server already running (pid $($existing.Id))"
    exit 0
  }
}

$proc = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c", "cd /d `"$root`" && npm run dev -- --port $Port --strictPort >> `"$logFile`" 2>&1" `
  -WindowStyle Hidden -PassThru

Set-Content -Path $pidFile -Value $proc.Id
Start-Sleep -Seconds 6
Write-Output "Started dev server pid $($proc.Id), log: $logFile"