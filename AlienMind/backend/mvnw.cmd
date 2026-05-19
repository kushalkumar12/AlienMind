@echo off
setlocal

set SCRIPT_DIR=%~dp0

powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%.mvn\download-maven.ps1"
if errorlevel 1 exit /b %errorlevel%

"%SCRIPT_DIR%.mvn\apache-maven-3.9.9\bin\mvn.cmd" %*
