$ErrorActionPreference = "Stop"

$version = "3.9.9"
$mavenDir = Join-Path $PSScriptRoot "apache-maven-$version"
$mavenCmd = Join-Path $mavenDir "bin\mvn.cmd"
$zipPath = Join-Path $PSScriptRoot "apache-maven-$version-bin.zip"
$downloadUrl = "https://archive.apache.org/dist/maven/maven-3/$version/binaries/apache-maven-$version-bin.zip"

if (Test-Path $mavenCmd) {
    exit 0
}

New-Item -ItemType Directory -Force -Path $PSScriptRoot | Out-Null
Write-Host "Downloading Apache Maven $version for this project..."
Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath

Write-Host "Extracting Apache Maven $version..."
Expand-Archive -Path $zipPath -DestinationPath $PSScriptRoot -Force
Remove-Item -Path $zipPath -Force
