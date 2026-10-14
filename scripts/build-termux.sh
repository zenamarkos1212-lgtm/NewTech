#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================
#  NEW-TECH INSTITUTE TV RECOVERY TOOL (ኒው-ቴክ ኢንስቲትዩት)
#  Automated Termux Setup & Local Offline Runner for Android
# ==============================================================

set -e

echo -e "\e[1;33m[1/4] Updating Termux packages and installing Node.js...\e[0m"
pkg update -y
pkg install -y nodejs-lts git

echo -e "\e[1;33m[2/4] Setting up project directory...\e[0m"
mkdir -p ~/newtech-tv-tool
cd ~/newtech-tv-tool

echo -e "\e[1;33m[3/4] Installing project dependencies...\e[0m"
npm install --omit=dev || npm install

echo -e "\e[1;33m[4/4] Building production app bundle...\e[0m"
npm run build

echo -e "\e[1;32m==============================================================\e[0m"
echo -e "\e[1;32m SUCCESS! New-Tech TV Recovery Tool is ready.\e[0m"
echo -e "\e[1;36m Starting local offline server on your phone at:\e[0m"
echo -e "\e[1;33m http://localhost:3000\e[0m"
echo -e "\e[1;32m==============================================================\e[0m"

# Launch preview server accessible via local browser
npx vite preview --port 3000 --host
