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
echo "Installing dependencies with uv..."
uv export --no-hashes --no-dev -o package/requirements.txt
pip install -r package/requirements.txt -t package/ --quiet

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
