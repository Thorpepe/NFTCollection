const { ethers } = require('ethers');
const fs = require('fs-extra');

class ContractDeployer {
    constructor(config) {
        this.config = config;
        this.provider = null;
        this.wallet = null;
    }

    async initialize(privateKey, rpcUrl) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);

        console.log(`Connected to network: ${(await this.provider.getNetwork()).name}`);
        console.log(`Deployer address: ${this.wallet.address}`);

        const balance = await this.provider.getBalance(this.wallet.address);
        console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    }

    async deployContract(contractSource, constructorArgs = []) {
        try {
            const contractFactory = new ethers.ContractFactory(
                contractSource.abi,
                contractSource.bytecode,
                this.wallet
            );

            console.log('Deploying contract...');
            const contract = await contractFactory.deploy(...constructorArgs);

            console.log(`Contract deployed to: ${contract.target}`);
            console.log(`Transaction hash: ${contract.deploymentTransaction().hash}`);

            await contract.waitForDeployment();
            console.log('Contract deployment confirmed');

            return {
                address: contract.target,
                txHash: contract.deploymentTransaction().hash,
                contract: contract
            };

        } catch (error) {
            console.error('Deployment failed:', error.message);
            throw error;
        }
    }

    async saveDeploymentInfo(deploymentInfo, filename = 'deployment.json') {
        const deploymentData = {
            timestamp: new Date().toISOString(),
            network: (await this.provider.getNetwork()).name,
            contractAddress: deploymentInfo.address,
            transactionHash: deploymentInfo.txHash,
            deployer: this.wallet.address,
            constructorArgs: deploymentInfo.constructorArgs || []
        };

        await fs.writeJson(filename, deploymentData, { spaces: 2 });
        console.log(`Deployment info saved to ${filename}`);
    }

    async verifyContract(contractAddress, constructorArgs = []) {
        console.log('Note: Automatic verification not implemented');
        console.log('To verify on Etherscan, use the following details:');
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`Constructor Arguments: ${JSON.stringify(constructorArgs)}`);
    }

    generateDeployScript(contractName, constructorArgs) {
        return `
const { ethers } = require('ethers');
const ContractDeployer = require('./src/deploy');

async function main() {
    const deployer = new ContractDeployer();

    await deployer.initialize(
        process.env.PRIVATE_KEY,
        process.env.RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID'
    );

    const contractSource = {
        abi: require('./artifacts/${contractName}.json').abi,
        bytecode: require('./artifacts/${contractName}.json').bytecode
    };

    const constructorArgs = ${JSON.stringify(constructorArgs, null, 4)};

    const deploymentInfo = await deployer.deployContract(contractSource, constructorArgs);
    await deployer.saveDeploymentInfo(deploymentInfo);

    console.log('Deployment complete!');
}

main().catch(console.error);
        `.trim();
    }
}

module.exports = ContractDeployer;