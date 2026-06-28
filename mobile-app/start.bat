@echo off
echo Starting BabyGrow Metro Bundler...
echo.
cd /d "%~dp0"
echo Current directory: %CD%
echo.
npx expo start --clear
