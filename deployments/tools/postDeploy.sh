#!/bin/bash

echo "🟢 postDeploy.sh: Extracting prisma_bin_only.tar.gz"

NODE_MODULES_DIR="/node_modules"
TAR_FILE="prisma_bin_only.tar.gz"


if [ ! -d "$NODE_MODULES_DIR/.prisma" ] || [ ! -d "$NODE_MODULES_DIR/.bin" ]; then
  if [ -f "$TAR_FILE" ]; then
    echo "📦 Extracting $TAR_FILE to $NODE_MODULES_DIR"
    tar -xzvf "$TAR_FILE" -C "$NODE_MODULES_DIR"
  else
    echo "⚠️ $TAR_FILE not found."
  fi
else
  echo "✅ .prisma and .bin already exist. Skipping extraction."
fi

echo "🚀 Starting app in production mode..."
yarn run start:prod