#!/usr/bin/env node

const NFTCollectionGenerator = require('./generator');
const ContractDeployer = require('./deploy');
const path = require('path');
const fs = require('fs-extra');

const args = process.argv.slice(2);
const command = args[0];

async function generateCollection() {
    const configPath = args[1] || './config.json';

    if (!await fs.pathExists(configPath)) {
        console.error(`Config file not found: ${configPath}`);
        process.exit(1);
    }

    const generator = new NFTCollectionGenerator(configPath);

    const progressBar = (completed, total, currentId) => {
        const percent = Math.round((completed / total) * 100);
        const filled = Math.round(percent / 2);
        const empty = 50 - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);

        process.stdout.write(`\r[${bar}] ${percent}% (${completed}/${total}) - NFT #${currentId}`);
    };

    try {
        await generator.generateFullCollection(progressBar);
        console.log('\n✅ Collection generation completed successfully!');
    } catch (error) {
        console.error('\n❌ Generation failed:', error.message);
        process.exit(1);
    }
}

async function generateSample() {
    const count = parseInt(args[1]) || 10;
    const configPath = args[2] || './config.json';

    console.log(`Generating ${count} sample NFTs...`);

    const generator = new NFTCollectionGenerator(configPath);
    await generator.initialize();

    for (let i = 1; i <= count; i++) {
        await generator.generateSingle(i);
        console.log(`Generated sample NFT #${i}`);
    }

    await generator.generateReport();
    console.log('✅ Sample generation completed!');
}

async function deployContract() {
    const configPath = args[1] || './config.json';
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;

    if (!privateKey || !rpcUrl) {
        console.error('Error: PRIVATE_KEY and RPC_URL environment variables required');
        console.log('Usage: PRIVATE_KEY=... RPC_URL=... npm run deploy');
        process.exit(1);
    }

    const config = require(path.resolve(configPath));
    const deployer = new ContractDeployer(config);

    try {
        await deployer.initialize(privateKey, rpcUrl);

        const constructorArgs = [
            config.contract.name,
            config.contract.symbol,
            config.baseURI
        ];

        console.log('Deploying NFT contract...');
        const deploymentInfo = await deployer.deployContract({
            abi: [], // Would need compiled contract ABI
            bytecode: '0x' // Would need compiled contract bytecode
        }, constructorArgs);

        await deployer.saveDeploymentInfo({
            ...deploymentInfo,
            constructorArgs
        });

        console.log('✅ Contract deployed successfully!');

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

function showHelp() {
    console.log(`
NFT Collection Generator CLI

Commands:
  generate [config.json]     Generate full collection
  sample [count] [config]    Generate sample NFTs (default: 10)
  deploy [config.json]       Deploy smart contract
  help                       Show this help

Environment Variables (for deploy):
  PRIVATE_KEY               Wallet private key
  RPC_URL                   Ethereum RPC endpoint

Examples:
  npm start generate
  npm start sample 20
  PRIVATE_KEY=... RPC_URL=... npm start deploy
    `);
}

async function main() {
    switch (command) {
        case 'generate':
            await generateCollection();
            break;
        case 'sample':
            await generateSample();
            break;
        case 'deploy':
            await deployContract();
            break;
        case 'help':
        case undefined:
            showHelp();
            break;
        default:
            console.error(`Unknown command: ${command}`);
            showHelp();
            process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { NFTCollectionGenerator, ContractDeployer };