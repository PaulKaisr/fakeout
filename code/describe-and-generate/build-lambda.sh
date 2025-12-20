#!/bin/bash

# Build Lambda deployment package for Python function
# This script creates a lambda.zip file with all dependencies using uv

set -e

echo "Building Lambda deployment package..."

# Clean up any previous build
rm -rf package lambda.zip

# Create package directory
mkdir -p package

# Export dependencies using uv and install to package directory
echo "Installing dependencies with uv for Lambda (linux/x86_64)..."
uv export --no-hashes --no-dev -o package/requirements.txt

# Install dependencies targeting Linux platform (Lambda environment)
# Use --python-platform to ensure compatibility with Lambda's Amazon Linux 2023
uv pip install \
  --python-preference only-system \
  --system \
  --python-platform linux \
  --target package/ \
  -r package/requirements.txt \
  --quiet

# Remove the temporary requirements.txt
rm package/requirements.txt

# Copy application code into package
echo "Copying application code..."
cp -r main.py clients package/

# Create the deployment package
echo "Creating lambda.zip..."
cd package
zip -r ../lambda.zip . -q
cd ..

# Clean up package directory
rm -rf package

echo "✓ Lambda deployment package created: lambda.zip"
echo "  Size: $(du -h lambda.zip | cut -f1)"
