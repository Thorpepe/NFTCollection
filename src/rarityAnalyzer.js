class RarityAnalyzer {
    constructor() {
        this.traitCounts = {};
        this.totalSupply = 0;
    }

    addNFT(traits) {
        this.totalSupply++;

        for (const [traitType, value] of Object.entries(traits)) {
            if (!this.traitCounts[traitType]) {
                this.traitCounts[traitType] = {};
            }

            if (!this.traitCounts[traitType][value]) {
                this.traitCounts[traitType][value] = 0;
            }

            this.traitCounts[traitType][value]++;
        }
    }

    calculateRarity(traits) {
        let rarityScore = 1;

        for (const [traitType, value] of Object.entries(traits)) {
            const traitCount = this.traitCounts[traitType]?.[value] || 0;
            const frequency = traitCount / this.totalSupply;
            rarityScore *= frequency;
        }

        return {
            score: rarityScore,
            rank: this.getRarityRank(rarityScore),
            percentile: this.getPercentile(rarityScore)
        };
    }

    getRarityRank(score) {
        if (score > 0.5) return "Common";
        if (score > 0.2) return "Uncommon";
        if (score > 0.05) return "Rare";
        if (score > 0.01) return "Epic";
        return "Legendary";
    }

    getPercentile(score) {
        return Math.round((1 - score) * 100 * 100) / 100;
    }

    generateReport() {
        const report = {
            totalSupply: this.totalSupply,
            traitDistribution: {},
            rarityDistribution: {
                "Common": 0,
                "Uncommon": 0,
                "Rare": 0,
                "Epic": 0,
                "Legendary": 0
            }
        };

        for (const [traitType, values] of Object.entries(this.traitCounts)) {
            report.traitDistribution[traitType] = {};

            for (const [value, count] of Object.entries(values)) {
                const percentage = (count / this.totalSupply * 100).toFixed(2);
                report.traitDistribution[traitType][value] = {
                    count,
                    percentage: `${percentage}%`
                };
            }
        }

        return report;
    }
}

module.exports = RarityAnalyzer;