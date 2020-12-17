#!/bin/sh

echo "Tiến hành cài đặt tại ~/c3cbot (home directory)..."
cd ~

echo "Cài đặt những thứ cần thiết để build c3cbot..."
apt install -y nodejs-lts make clang 

echo "Tiến hành clone c3cbot về máy..."
git clone https://github.com/c3cbot/c3c-0x ./c3cbot

cd c3cbot
echo "Tiến hành build c3cbot..."
npm i
npm run firstrun

echo "Đã cài đặt xong c3cbot! Sử dụng lệnh 'cd ~/c3cbot && npm start' để tiến hành chạy bot, thay đổi cấu hình bằng lệnh 'cd ~/c3cbot && npm run firstrun'"
