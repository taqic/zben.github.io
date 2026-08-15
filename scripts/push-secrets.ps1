# Push Cloudflare Pages secrets from .dev.vars without echoing values.
# Usage: powershell -File scripts/push-secrets.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$varsFile = Join-Path $root ".dev.vars"
if (-not (Test-Path $varsFile)) {
  Write-Host "Missing .dev.vars 鈥?copy secrets/smtp.local.env.example first."
  exit 1
}
$map = @{}
Get-Content $varsFile | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#")) { return }
  $i = $line.IndexOf("=")
  if ($i -lt 1) { return }
  $k = $line.Substring(0, $i).Trim()
  $v = $line.Substring($i + 1).Trim()
  $map[$k] = $v
}
$keys = @(
  "SMTP_HOST","SMTP_PORT","SMTP_USER","SMTP_PASS","SMTP_FROM",
  "PADDLE_WEBHOOK_SECRET","PADDLE_API_KEY","LICENSE_HMAC_SECRET"
)
foreach ($k in $keys) {
  if (-not $map.ContainsKey($k) -or [string]::IsNullOrWhiteSpace($map[$k])) {
    Write-Host "skip empty: $k"
    continue
  }
  Write-Host "putting $k ..."
  $map[$k] | npx --yes wrangler pages secret put $k --project-name=zben-github-io
}
Write-Host "done (values not printed)."

