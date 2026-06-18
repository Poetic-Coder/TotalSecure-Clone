#!/bin/bash

echo "✅ Checking for global Yarn..."
if ! command -v yarn >/dev/null 2>&1; then
  echo "❌ Yarn is not installed. Exiting."
  exit 1
fi

extractionCommand="tar -xzvf node_modules.tar.gz -C /node_modules"

# Ensure /node_modules exists
mkdir -p /node_modules

echo "📦 Waiting for Prisma CLI in node_modules/.bin..."
while [ ! -f ./node_modules/.bin/prisma ]; do
  if [ -z "$(ls -A /node_modules 2>/dev/null)" ]; then
    echo "📂 node_modules is empty. Extracting from tarball..."
    echo "Running: $extractionCommand"
    eval $extractionCommand
  else
    echo "⏳ node_modules exists but prisma not yet ready..."
  fi
  sleep 2
done

# Check if Prisma client already exists
if [ ! -d "./node_modules/.prisma" ]; then
  echo "⚙️ .prisma folder not found. Running prisma:generate..."
  yarn prisma:generate
else
  echo "✅ .prisma already exists. Skipping generate step."
fi

echo "🚀 Starting app in production mode..."
yarn run start:prod
