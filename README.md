# NFT Collection Generator

A comprehensive Node.js tool for generating unique NFT collections with layered traits, metadata, and smart contract deployment.

## 🚀 Features

- **Layer-based Generation**: Combine trait images with configurable weights and rarity
- **Metadata Generation**: OpenSea-compatible JSON metadata with trait attributes
- **Smart Contract**: ERC721 contract with presale, minting limits, and access controls
- **Rarity Analysis**: Automatic trait distribution and rarity scoring
- **Batch Processing**: Generate thousands of NFTs efficiently with progress tracking
- **CLI Interface**: Easy-to-use command line interface
- **Contract Deployment**: Built-in deployment tools with ethers.js

## 📦 Quick Start

```bash
# Clone and setup
git clone <repository>
cd NFTCollection

# Install dependencies and setup directories
./scripts/setup.sh

# Generate sample NFTs
npm start sample 10

# Generate full collection
npm start generate
```

## 🎨 Adding Your Assets

1. Add trait images to `assets/layers/` directories:
   ```
   assets/layers/
   ├── background/    # Background images
   ├── body/         # Character bodies
   ├── eyes/         # Eye variations
   ├── mouth/        # Mouth/expressions
   └── accessory/    # Accessories/items
   ```

2. Update trait weights in `config.json`:
   ```json
   {
     "layers": [
       {
         "name": "background",
         "weights": {
           "common_bg": 50,
           "rare_bg": 5,
           "legendary_bg": 1
         }
       }
     ]
   }
   ```

## 🔧 Configuration

Edit `config.json` to customize your collection:

- **Collection Info**: Name, description, size, URLs
- **Layer Configuration**: Trait directories, weights, requirements
- **Image Settings**: Output dimensions, format
- **Contract Settings**: Name, symbol, mint price

## 📱 CLI Commands

```bash
# Generate sample NFTs for testing
npm start sample [count] [config.json]

# Generate full collection
npm start generate [config.json]

# Deploy smart contract
PRIVATE_KEY=... RPC_URL=... npm start deploy [config.json]

# Show help
npm start help
```

## 🚀 Deployment

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. Add your configuration:
   ```bash
   PRIVATE_KEY=your_wallet_private_key
   RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
   ```

3. Deploy contract:
   ```bash
   npm start deploy
   ```

## 📊 Output Structure

```
output/
├── images/              # Generated NFT images
│   ├── 1.png
│   ├── 2.png
│   └── ...
├── metadata/           # JSON metadata files
│   ├── 1.json
│   ├── 2.json
│   └── ...
└── collection_report.json  # Trait distribution report
```

## 🎯 Example Metadata

```json
{
  "name": "CryptoBeasts #1",
  "description": "A unique digital creature",
  "image": "https://cryptobeasts.io/api/metadata/1.png",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Forest"
    },
    {
      "trait_type": "Body",
      "value": "Dragon"
    }
  ]
}
```

## 🛠 Development

Built with:
- **Canvas API**: For image composition
- **ethers.js**: For blockchain interactions
- **Node.js**: Core runtime
- **Sharp**: Image processing (optional)