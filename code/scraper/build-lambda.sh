#!/bin/bash

# Lambda packaging script for pnpm-based project
# This ensures all dependencies are properly included in the Lambda deployment package

set -e

echo "Starting Lambda packaging process..."

# Clean up any existing build artifacts
echo "Cleaning up old build artifacts..."
rm -rf lambda-package lambda.zip

# Create a fresh directory for the Lambda package
echo "Creating Lambda package directory..."
mkdir -p lambda-package

# Copy source files
echo "Copying source files..."
cp -r clients lambda-package/
cp index.js lambda-package/

# Download and include FFmpeg static binary
echo "Downloading FFmpeg static binary..."
curl -O https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
mkdir -p ffmpeg-temp
tar -xf ffmpeg-release-amd64-static.tar.xz -C ffmpeg-temp --strip-components=1
cp ffmpeg-temp/ffmpeg lambda-package/
rm -rf ffmpeg-temp ffmpeg-release-amd64-static.tar.xz

# Install production dependencies in the Lambda package directory
echo "Installing production dependencies..."
cd lambda-package

# Create a temporary package.json for production dependencies
cat > package.json << 'EOF'
{
  "type": "module",
  "name": "scraper",
  "version": "1.0.0",
  "dependencies": {
    "@aws-sdk/client-s3": "^3.943.0",
    "dotenv": "^17.2.3",
    "isomorphic-fetch": "^3.0.0",
    "pexels": "^1.4.0",
    "fluent-ffmpeg": "^2.1.3",
    "@supabase/supabase-js": "^2.39.0"
  }
}
EOF

# Install dependencies using npm (which Lambda can resolve properly)
# pnpm creates symlinks that don't work well in zip files
npm install --production --no-package-lock

# Keep package.json with type: module so Lambda recognizes ES modules
# (don't remove it!)

cd ..

# Create the zip file
echo "Creating lambda.zip..."
cd lambda-package
zip -r ../lambda.zip . -x "*.git*" -x "*node_modules/.cache/*"
cd ..

# Clean up temporary directory
echo "Cleaning up..."
rm -rf lambda-package

echo "✓ Lambda package created successfully: lambda.zip"
echo "Package size: $(du -h lambda.zip | cut -f1)"
