const fs = require('fs-extra');
const path = require('path');

class MetadataGenerator {
    constructor(config) {
        this.config = config;
        this.outputDir = config.outputDir || './output';
    }

    generateMetadata(tokenId, traits) {
        const metadata = {
            name: `${this.config.collectionName} #${tokenId}`,
            description: this.config.description || "A unique NFT from the collection",
            image: `${this.config.baseURI}/${tokenId}.png`,
            external_url: this.config.externalUrl || "",
            attributes: this.formatTraits(traits)
        };

        return metadata;
    }

    formatTraits(traits) {
        return Object.entries(traits).map(([trait_type, value]) => ({
            trait_type: trait_type.charAt(0).toUpperCase() + trait_type.slice(1),
            value: value
        }));
    }

    async saveMetadata(tokenId, metadata) {
        const metadataPath = path.join(this.outputDir, 'metadata', `${tokenId}.json`);
        await fs.ensureDir(path.dirname(metadataPath));
        await fs.writeJson(metadataPath, metadata, { spaces: 2 });
    }

    async generateBatch(startId, endId, traitsArray) {
        const results = [];

        for (let i = startId; i <= endId; i++) {
            const traits = traitsArray[i - startId];
            const metadata = this.generateMetadata(i, traits);
            await this.saveMetadata(i, metadata);
            results.push({ tokenId: i, metadata });
        }

        return results;
    }
}

module.exports = MetadataGenerator;