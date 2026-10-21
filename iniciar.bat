@echo off
cd /d "%~dp0"
echo Iniciando Ferreteria en http://localhost:3000
start "" http://localhost:3000
npm run dev
pause
