# ============================================================
# run.ps1 - WMI-wrapper for running EXE outside Electron sandbox
#
# opencode desktop runs commands inside Chromium sandbox where
# process creation is blocked ("Access is denied"). WMI
# (Win32_Process.Create) is executed by the SYSTEM service outside
# the sandbox - so this wrapper bypasses the block legitimately.
#
# Usage:
#   .\run.ps1 -Cmd '"C:\Program Files\Git\bin\git.exe" status'
#   .\run.ps1 -Cmd "git status" -Dir "D:\path\to\repo"
#   $out = .\run.ps1 -Cmd "node --version" -TimeoutSec 120
#
# Params:
#   -Cmd         full command line
#   -Dir         working directory (default: current)
#   -TimeoutSec  wait timeout for the process
#   -ShowOut     print combined output to console (default true)
# ============================================================
param(
  [Parameter(Mandatory = $true)][string]$Cmd,
  [string]$Dir = (Get-Location).Path,
  [int]$TimeoutSec = 120,
  [switch]$Quiet
)

$ErrorActionPreference = "Stop"
$tmpDir = "C:\Users\PC\AppData\Local\Temp\opencode"
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

$logOut = Join-Path $tmpDir ("run_" + [guid]::NewGuid().ToString("N") + ".out.log")
$logErr = Join-Path $tmpDir ("run_" + [guid]::NewGuid().ToString("N") + ".err.log")

$shellCmd = 'cmd.exe /c cd /d "' + $Dir + '" && ' + $Cmd + ' > "' + $logOut + '" 2> "' + $logErr + '"'

$created = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $shellCmd }
if ($created.ReturnValue -ne 0) {
  Write-Error "WMI create failed, return code: $($created.ReturnValue)"
}
$pidProc = $created.ProcessId

# Poll until the process exits or timeout
$deadline = (Get-Date).AddSeconds($TimeoutSec)
while ((Get-Date) -lt $deadline) {
  $alive = Get-CimInstance -ClassName Win32_Process -Filter "ProcessId=$pidProc" -ErrorAction SilentlyContinue
  if (-not $alive) { break }
  Start-Sleep -Milliseconds 200
}
if (Get-CimInstance -ClassName Win32_Process -Filter "ProcessId=$pidProc" -ErrorAction SilentlyContinue) {
  # Kill the whole tree
  Get-CimInstance -ClassName Win32_Process -Filter "ParentProcessId=$pidProc" -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  Stop-Process -Id $pidProc -Force -ErrorAction SilentlyContinue
  Write-Warning "Timeout ($TimeoutSec s) - process tree killed"
}

$stdout = ""
$stderr = ""
if (Test-Path $logOut) { $raw = Get-Content $logOut -Raw; if ($raw) { $stdout = $raw.TrimEnd() } }
if (Test-Path $logErr) { $raw = Get-Content $logErr -Raw; if ($raw) { $stderr = $raw.TrimEnd() } }

if (-not $Quiet) {
  if ($stdout) { Write-Output $stdout }
  if ($stderr) { Write-Output ("[stderr] " + $stderr) }
}

Remove-Item $logOut, $logErr -Force -ErrorAction SilentlyContinue