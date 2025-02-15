const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

class ImageGenerator {
    constructor(config) {
        this.config = config;
        this.layerCache = new Map();
        this.usedCombinations = new Set();
    }

    async loadLayerImages(layerConfig) {
        const cacheKey = layerConfig.directory;

        if (this.layerCache.has(cacheKey)) {
            return this.layerCache.get(cacheKey);
        }

        const layerImages = [];

        try {
            const files = await fs.readdir(layerConfig.directory);
            const imageFiles = files.filter(file =>
                /\.(png|jpg|jpeg)$/i.test(file)
            );

            for (const file of imageFiles) {
                const imagePath = path.join(layerConfig.directory, file);
                const image = await loadImage(imagePath);
                const name = path.parse(file).name;

                layerImages.push({
                    name,
                    image,
                    weight: layerConfig.weights[name] || 1
                });
            }
        } catch (error) {
            console.warn(`Warning: Could not load layer ${layerConfig.name}:`, error.message);
        }

        this.layerCache.set(cacheKey, layerImages);
        return layerImages;
    }

    selectRandomTrait(layerImages) {
        if (layerImages.length === 0) return null;

        const totalWeight = layerImages.reduce((sum, img) => sum + img.weight, 0);
        let random = Math.random() * totalWeight;

        for (const image of layerImages) {
            random -= image.weight;
            if (random <= 0) {
                return image;
            }
        }

        return layerImages[layerImages.length - 1];
    }

    async generateTraits() {
        const traits = {};
        const selectedImages = [];

        for (const layerConfig of this.config.layers) {
            const layerImages = await this.loadLayerImages(layerConfig);

            if (layerConfig.required || Math.random() > 0.3) {
                const selectedImage = this.selectRandomTrait(layerImages);
                if (selectedImage) {
                    traits[layerConfig.name] = selectedImage.name;
                    selectedImages.push({
                        image: selectedImage.image,
                        layer: layerConfig.name
                    });
                }
            } else {
                traits[layerConfig.name] = "None";
            }
        }

        return { traits, selectedImages };
    }

    async generateUniqueTraits(maxAttempts = 1000) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const result = await this.generateTraits();
            const combinationKey = JSON.stringify(result.traits);

            if (!this.usedCombinations.has(combinationKey)) {
                this.usedCombinations.add(combinationKey);
                return result;
            }
        }

        throw new Error('Could not generate unique combination after maximum attempts');
    }

    async generateImage(selectedImages, tokenId) {
        const { width, height } = this.config.imageSize;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        for (const { image } of selectedImages) {
            ctx.drawImage(image, 0, 0, width, height);
        }

        const buffer = canvas.toBuffer('image/png');
        const imagePath = path.join(this.config.outputDir, 'images', `${tokenId}.png`);

        await fs.ensureDir(path.dirname(imagePath));
        await fs.writeFile(imagePath, buffer);

        return imagePath;
    }

    async generateNFT(tokenId) {
        const { traits, selectedImages } = await this.generateUniqueTraits();
        const imagePath = await this.generateImage(selectedImages, tokenId);

        return {
            tokenId,
            traits,
            imagePath
        };
    }
}

module.exports = ImageGenerator;