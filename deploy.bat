@echo off
cd /d %~dp0

echo =========================
echo    FAZENDO DEPLOY...
echo =========================

firebase deploy --only hosting

echo =========================
echo   DEPLOY FINALIZADO
echo =========================

pause