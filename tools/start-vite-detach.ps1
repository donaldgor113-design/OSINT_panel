# start-vite-detach.ps1 - launch Vite dev server via WMI so it survives
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

$cmdLine = 'cmd.exe /c cd /d "' + $root + '" && npm run dev -- --port 5173 --strictPort >> "' + $logFile + '" 2>&1'
$created = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmdLine }
if ($created.ReturnValue -ne 0) {
  Write-Error "WMI create failed, return code: $($created.ReturnValue)"
}
Set-Content -Path $pidFile -Value $created.ProcessId
Start-Sleep -Seconds 6
Write-Output "Started dev server pid $($created.ProcessId), log: $logFile"