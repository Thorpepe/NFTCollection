#!/bin/bash

echo "🚀 Setting up NFT Collection Generator..."

# Create asset directories
echo "📁 Creating asset directories..."
mkdir -p assets/layers/background
mkdir -p assets/layers/body
mkdir -p assets/layers/eyes
mkdir -p assets/layers/mouth
mkdir -p assets/layers/accessory

# Create placeholder images info
echo "📝 Creating asset placeholders..."
cat > assets/layers/README.md << 'EOF'
# Asset Layers

Add your trait images to the corresponding directories:

## Structure
- `background/` - Background images (PNG format)
- `body/` - Body/character images
- `eyes/` - Eye trait images
- `mouth/` - Mouth/expression images
- `accessory/` - Accessory/item images

## Naming Convention
- Use descriptive filenames: `desert.png`, `forest.png`
- Filenames should match the trait names in config.json
- All images should be the same dimensions (512x512 recommended)

## Supported Formats
- PNG (recommended for transparency)
- JPG/JPEG

## Weight System
Trait rarity is controlled in config.json weights object.
Higher numbers = more common, lower numbers = more rare.
EOF

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Make CLI executable
chmod +x src/index.js

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your trait images to assets/layers/ directories"
echo "2. Customize config.json with your collection details"
echo "3. Run: npm start sample 5 (to test with 5 NFTs)"
echo "4. Run: npm start generate (for full collection)"