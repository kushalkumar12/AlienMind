@echo off
setlocal

cd /d "%~dp0"
call "%~dp0mvnw.cmd" -Dmaven.test.skip=true spring-boot:run
