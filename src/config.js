const defaultConfig = {
    collectionName: "My NFT Collection",
    description: "A unique NFT collection generated with custom traits",
    collectionSize: 1000,
    baseURI: "https://ipfs.io/ipfs/YOUR_HASH_HERE",
    externalUrl: "https://yourwebsite.com",

    layers: [
        {
            name: "background",
            directory: "./assets/layers/background",
            required: true,
            weights: {}
        },
        {
            name: "body",
            directory: "./assets/layers/body",
            required: true,
            weights: {}
        },
        {
            name: "eyes",
            directory: "./assets/layers/eyes",
            required: true,
            weights: {}
        },
        {
            name: "mouth",
            directory: "./assets/layers/mouth",
            required: false,
            weights: {}
        },
        {
            name: "accessory",
            directory: "./assets/layers/accessory",
            required: false,
            weights: {}
        }
    ],

    outputDir: "./output",
    imageSize: { width: 500, height: 500 },

    rarityWeights: {
        "Common": 60,
        "Uncommon": 25,
        "Rare": 10,
        "Epic": 4,
        "Legendary": 1
    }
};

function loadConfig(configPath = './config.json') {
    try {
        const userConfig = require(configPath);
        return { ...defaultConfig, ...userConfig };
    } catch (error) {
        console.log('Using default config');
        return defaultConfig;
    }
}

module.exports = { defaultConfig, loadConfig };