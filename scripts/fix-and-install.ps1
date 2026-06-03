param(
  [switch]$StartDev
)

function Ensure-Admin {
  $current = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($current)
  if (-not $principal.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)) {
    Write-Error "Script must be run as Administrator. Right-click PowerShell and 'Run as administrator'."
    exit 1
  }
}

Ensure-Admin

Write-Host "Stopping node processes..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

$problemPath = "D:\Project NoteVault\node_modules\lightningcss-win32-x64-msvc"
if (Test-Path $problemPath) {
  Write-Host "Attempting to remove $problemPath"
  try {
    Remove-Item -LiteralPath $problemPath -Recurse -Force -ErrorAction Stop
    Write-Host "Removed $problemPath"
  } catch {
    Write-Warning "Failed to remove specific module, taking ownership of node_modules and removing full folder."
    takeown /f "D:\Project NoteVault\node_modules" /r | Out-Null
    icacls "D:\Project NoteVault\node_modules" /grant "$env:USERNAME`:F" /t | Out-Null
    Remove-Item -LiteralPath "D:\Project NoteVault\node_modules" -Recurse -Force
  }
} else {
  Write-Host "No specific lightningcss module found. Proceeding to ensure node_modules removed if exists."
  if (Test-Path "D:\Project NoteVault\node_modules") {
    takeown /f "D:\Project NoteVault\node_modules" /r | Out-Null
    icacls "D:\Project NoteVault\node_modules" /grant "$env:USERNAME`:F" /t | Out-Null
    Remove-Item -LiteralPath "D:\Project NoteVault\node_modules" -Recurse -Force
  }
}

Write-Host "Cleaning npm cache..."
npm cache clean --force

Write-Host "Installing dependencies (npm ci)..."
$install = npm ci 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Error "npm ci failed. Output:"; Write-Host $install
  Write-Host "You can try 'npm install' as a fallback."
  exit $LASTEXITCODE
}

Write-Host "Dependencies installed successfully."

if ($StartDev) {
  Write-Host "Starting signed-upload proxy in background..."
  Start-Process -NoNewWindow -FilePath "node" -ArgumentList "server/signedUploadProxy.js" -WorkingDirectory "D:\Project NoteVault"
  Start-Sleep -Seconds 2
  Write-Host "Starting Vite dev server (in new window)..."
  Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory "D:\Project NoteVault"
}

Write-Host "Done. If any step failed, paste the script output to me and I'll diagnose further."
