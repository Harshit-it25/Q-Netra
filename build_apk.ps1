$ErrorActionPreference = "Stop"

if (Test-Path "C:\Users\harsh\.jdks\temurin-21") {
    $env:JAVA_HOME = "C:\Users\harsh\.jdks\temurin-21"
} else {
    $jdkDirs = Get-ChildItem "C:\Users\harsh\.jdks", "C:\Program Files\Microsoft", "C:\Program Files\Java" -Filter "*jdk*" -ErrorAction SilentlyContinue | Sort-Object Name -Descending
    $env:JAVA_HOME = $jdkDirs[0].FullName
}

$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$env:ANDROID_HOME = "$env:USERPROFILE\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = "$env:USERPROFILE\AppData\Local\Android\Sdk"

Write-Host "Using JAVA_HOME: $env:JAVA_HOME"
java -version

Set-Location android
Write-Host "Building Android APK (assembleDebug)..."
.\gradlew.bat assembleDebug

