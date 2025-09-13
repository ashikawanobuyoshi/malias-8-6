#!/bin/bash

# 3000番ポートを占有しているプロセスを強制終了
echo "=== 3000番ポートを使用中のプロセスを終了中 ==="
sudo kill -9 $(sudo lsof -t -i :3000) 2>/dev/null

# PM2 デーモン停止
echo "=== PM2 デーモン停止 ==="
pm2 kill 2>/dev/null

# PM2 設定・ログを完全削除
echo "=== PM2 設定・ログを削除 ==="
rm -rf ~/.pm2

# PM2 グローバルアンインストール
echo "=== PM2 をアンインストール中 ==="
sudo npm uninstall -g pm2

# PM2 グローバル再インストール
echo "=== PM2 を再インストール中 ==="
sudo npm install -g pm2

# PM2 バージョン確認
echo "=== PM2 バージョン ==="
pm2 -v

# アプリのパス
APP_PATH="/mnt/c/Users/nashi/malias-8-6/.output/server/index.mjs"

# アプリを PM2 に登録して起動
echo "=== アプリを PM2 で起動 ==="
pm2 start $APP_PATH --name malias-app

# PM2 自動起動設定
echo "=== PM2 自動起動設定 ==="
pm2 save
pm2 startup

echo "=== 完了！ ==="
echo "pm2 list でプロセスを確認してください"


