$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectPath
$testPath = Join-Path $projectPath '.cms-test'
$dataPath = Join-Path $testPath 'postgres'
$envPath = Join-Path $testPath 'test.env'
$pgBin = 'C:\Program Files\PostgreSQL\16\bin'
if (-not (Test-Path -LiteralPath (Join-Path $pgBin 'initdb.exe'))) {
  throw 'Install PostgreSQL 16, or update $pgBin in this test helper.'
}
New-Item -ItemType Directory -Force -Path $testPath | Out-Null
if (-not (Test-Path -LiteralPath $envPath)) {
  if (Test-Path -LiteralPath $dataPath) { throw 'An existing test cluster has no test.env. Restore its test.env before proceeding.' }
  $dbPassword = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
  $authSecret = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
  $adminPassword = [guid]::NewGuid().ToString('N')
  @(
    "DATABASE_URL=postgresql://mellon_test:$dbPassword@127.0.0.1:55438/postgres",
    'BETTER_AUTH_URL=http://127.0.0.1:3012',
    "BETTER_AUTH_SECRET=$authSecret",
    'ADMIN_EMAILS=cms-test@example.test',
    'ADMIN_BOOTSTRAP_EMAIL=cms-test@example.test',
    'ADMIN_BOOTSTRAP_NAME=CMS Test Admin',
    "ADMIN_BOOTSTRAP_PASSWORD=$adminPassword"
  ) | Set-Content -LiteralPath $envPath -Encoding ascii
  $passwordPath = Join-Path $testPath 'init-password.txt'
  try {
    Set-Content -LiteralPath $passwordPath -Value $dbPassword -Encoding ascii
    & (Join-Path $pgBin 'initdb.exe') -D $dataPath -U mellon_test --pwfile=$passwordPath --auth=scram-sha-256 --encoding=UTF8
    if ($LASTEXITCODE -ne 0) { throw 'Test database initialization failed.' }
  } finally { if (Test-Path -LiteralPath $passwordPath) { Remove-Item -LiteralPath $passwordPath } }
}
foreach ($line in Get-Content -LiteralPath $envPath) {
  $pair = $line -split '=', 2
  if ($pair.Length -eq 2) { [Environment]::SetEnvironmentVariable($pair[0], $pair[1], 'Process') }
}
$testDatabase = [uri]$env:DATABASE_URL
if ($testDatabase.Host -ne '127.0.0.1' -or $testDatabase.Port -ne 55438) { throw 'This helper only supports the isolated local test database on port 55438.' }
& (Join-Path $pgBin 'pg_ctl.exe') -D $dataPath status | Out-Null
if ($LASTEXITCODE -ne 0) {
  & (Join-Path $pgBin 'pg_ctl.exe') -D $dataPath -l (Join-Path $testPath 'postgres.log') -o '-h 127.0.0.1 -p 55438' start
  if ($LASTEXITCODE -ne 0) { throw 'Could not start the isolated test database.' }
}
npm run cms:migrate
if ($LASTEXITCODE -ne 0) { throw 'Test database migration failed.' }
npm run cms:admin
if ($LASTEXITCODE -ne 0) { throw 'Test administrator creation failed.' }
Write-Host 'Local CMS test database is ready. Run npm run test:cms.'
