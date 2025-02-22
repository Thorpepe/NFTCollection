const ImageGenerator = require('./imageGenerator');
const MetadataGenerator = require('./metadata');
const RarityAnalyzer = require('./rarityAnalyzer');
const { loadConfig } = require('./config');
const fs = require('fs-extra');
const path = require('path');

class NFTCollectionGenerator {
    constructor(configPath) {
        this.config = loadConfig(configPath);
        this.imageGenerator = new ImageGenerator(this.config);
        this.metadataGenerator = new MetadataGenerator(this.config);
        this.rarityAnalyzer = new RarityAnalyzer();
        this.generatedNFTs = [];
    }

    async initialize() {
        await fs.ensureDir(this.config.outputDir);
        await fs.ensureDir(path.join(this.config.outputDir, 'images'));
        await fs.ensureDir(path.join(this.config.outputDir, 'metadata'));

        console.log(`Initialized NFT Collection Generator`);
        console.log(`Collection: ${this.config.collectionName}`);
        console.log(`Target Size: ${this.config.collectionSize}`);
    }

    async generateSingle(tokenId) {
        try {
            const nft = await this.imageGenerator.generateNFT(tokenId);
            const metadata = this.metadataGenerator.generateMetadata(tokenId, nft.traits);

            await this.metadataGenerator.saveMetadata(tokenId, metadata);

            this.rarityAnalyzer.addNFT(nft.traits);
            this.generatedNFTs.push({
                tokenId,
                traits: nft.traits,
                metadata,
                imagePath: nft.imagePath
            });

            return nft;

        } catch (error) {
            console.error(`Failed to generate NFT ${tokenId}:`, error.message);
            throw error;
        }
    }

    async generateBatch(startId, endId, progressCallback) {
        const total = endId - startId + 1;
        let completed = 0;

        console.log(`Generating ${total} NFTs (${startId} to ${endId})...`);

        for (let tokenId = startId; tokenId <= endId; tokenId++) {
            await this.generateSingle(tokenId);
            completed++;

            if (progressCallback) {
                progressCallback(completed, total, tokenId);
            }

            if (completed % 100 === 0) {
                console.log(`Progress: ${completed}/${total} (${Math.round(completed/total*100)}%)`);
            }
        }

        console.log(`Batch generation complete: ${completed} NFTs generated`);
    }

    async generateFullCollection(progressCallback) {
        await this.initialize();

        const startTime = Date.now();
        await this.generateBatch(1, this.config.collectionSize, progressCallback);

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        console.log(`\nCollection generation completed!`);
        console.log(`Time taken: ${duration.toFixed(2)} seconds`);
        console.log(`Average: ${(duration / this.config.collectionSize).toFixed(3)}s per NFT`);

        await this.generateReport();
    }

    async generateReport() {
        const report = this.rarityAnalyzer.generateReport();
        const reportPath = path.join(this.config.outputDir, 'collection_report.json');

        const enhancedReport = {
            ...report,
            collectionInfo: {
                name: this.config.collectionName,
                description: this.config.description,
                totalGenerated: this.generatedNFTs.length,
                targetSize: this.config.collectionSize,
                generatedAt: new Date().toISOString()
            },
            uniqueCombinations: this.imageGenerator.usedCombinations.size,
            possibleCombinations: this.calculatePossibleCombinations()
        };

        await fs.writeJson(reportPath, enhancedReport, { spaces: 2 });
        console.log(`\nCollection report saved to: ${reportPath}`);

        this.printSummary(enhancedReport);
    }

    calculatePossibleCombinations() {
        let total = 1;

        for (const layer of this.config.layers) {
            const layerOptions = Object.keys(layer.weights).length || 10;
            if (layer.required) {
                total *= layerOptions;
            } else {
                total *= (layerOptions + 1);
            }
        }

        return total;
    }

    printSummary(report) {
        console.log('\n=== COLLECTION SUMMARY ===');
        console.log(`Collection: ${report.collectionInfo.name}`);
        console.log(`Generated: ${report.collectionInfo.totalGenerated} NFTs`);
        console.log(`Unique Combinations: ${report.uniqueCombinations}`);
        console.log(`Possible Combinations: ${report.possibleCombinations}`);

        console.log('\n=== TRAIT DISTRIBUTION ===');
        for (const [traitType, traits] of Object.entries(report.traitDistribution)) {
            console.log(`\n${traitType.toUpperCase()}:`);
            for (const [trait, data] of Object.entries(traits)) {
                console.log(`  ${trait}: ${data.count} (${data.percentage})`);
            }
        }
    }
}

module.exports = NFTCollectionGenerator;