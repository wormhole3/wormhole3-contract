
/** 
 * Walnut contract deploy script
 * run node deploy
 * 
 */
require('dotenv').config();
const ethers = require('ethers');
const fs = require("fs");
const { waitForTx } = require('./utils')

const CommitteeJson = require('../build/contracts/Committee.json')
const CommunityFactoryJson = require('../build/contracts/CommunityFactory.json')
const SPStakingFactoryJson = require('../build/contracts/SPStakingFactory.json')
const ERC20StakingFactoryJson = require('../build/contracts/ERC20StakingFactory.json')
const ERC1155StakingFactoryJson = require('../build/contracts/ERC1155StakingFactory.json')
const CosmosStakingFactoryJson = require('../build/contracts/CosmosStakingFactory.json')
const LinearCalculatorJson = require('../build/contracts/LinearCalculator.json')
const MintableERC20FactoryJson = require('../build/contracts/MintableERC20Factory.json')
const NutPowerJson = require('../build/contracts/NutPower.json')
const GaugeJson = require('../build/contracts/Gauge.json');
const TreasuryFactoryJson = require('../build/contracts/TreasuryFactory.json')
const { log } = require('console');
const { env } = require('process');

// const NutAddress = '0x3a51Ac476B2505F386546450822F1bF9d881bEa4'  // local host
const NutAddress = '0xc821eC39fd35E6c8414A6C7B32674D51aD0c2468'  // goerli
// const NutAddress = '0x871AD5aAA75C297EB22A6349871ce4588E3c0306' // bsc test  mbase
// const NutAddress = '0x4429FcdD4eC4EA4756B493e9c0525cBe747c2745' // bsc

async function deployCommitteeContract(env) {
    let factory = new ethers.ContractFactory(CommitteeJson.abi, CommitteeJson.bytecode, env.wallet);
    let contract = await factory.deploy(env.wallet.address, NutAddress, {
        gasPrice: env.gasPrice
    });
    await contract.deployed();
    console.log("✓ Committee contract deployed", contract.address);
    env.Committee = contract.address;
}

async function deployMintableERC20FactoryContract(env) {
    let factory = new ethers.ContractFactory(MintableERC20FactoryJson.abi, MintableERC20FactoryJson.bytecode, env.wallet);
    let contract = await factory.deploy({ gasPrice: env.gasPrice })
    await contract.deployed();
    console.log("✓ Mintable ERC20 contract deployed", contract.address);
    env.MintableERC20Factory = contract.address;
}

async function deployNutPowerContract(env) {
    let factory = new ethers.ContractFactory(NutPowerJson.abi, NutPowerJson.bytecode, env.wallet);
    let contract = await factory.deploy(NutAddress, { gasPrice: env.gasPrice });
    await contract.deployed();
    console.log("✓ Nut power contract deployed", contract.address);
    env.NutPower = contract.address;
}

async function deploySPStakingFactoryContract(env) {
    let factory = new ethers.ContractFactory(SPStakingFactoryJson.abi, SPStakingFactoryJson.bytecode, env.wallet);
    let contract = await factory.deploy(env.CommunityFactory, {
        gasPrice: env.gasPrice
    });
    await contract.deployed();
    console.log("✓ SPStakingFactory contract deployed", contract.address);
    env.SPStakingFactory = contract.address
}

async function deployERC20StakingFactoryContract(env) {
    let factory = new ethers.ContractFactory(ERC20StakingFactoryJson.abi, ERC20StakingFactoryJson.bytecode, env.wallet);
    let contract = await factory.deploy(env.CommunityFactory, {
        gasPrice: env.gasPrice
    });
    await contract.deployed();
    console.log("✓ ERC20StakingFactory contract deployed", contract.address);
    env.ERC20StakingFactory = contract.address
}

async function deployERC1155StakingFactoryContract(env) {
    let factory = new ethers.ContractFactory(ERC1155StakingFactoryJson.abi, ERC1155StakingFactoryJson.bytecode, env.wallet);
    let contract = await factory.deploy(env.CommunityFactory, {
        gasPrice: env.gasPrice
    });
    await contract.deployed();
    console.log("✓ ERC1155StakingFactory contract deployed", contract.address);
    env.ERC1155StakingFactory = contract.address
}

async function deployCosmosStakingFactoryContract(env) {
    let factory = new ethers.ContractFactory(CosmosStakingFactoryJson.abi, CosmosStakingFactoryJson.bytecode, env.wallet);
    let contract = await factory.deploy(env.CommunityFactory, {
        gasPrice: env.gasPrice
    });
    await contract.deployed();
    console.log("✓ CosmosStakingFactory contract deployed", contract.address);
    env.CosmosStakingFactory = contract.address
}

async function deployCommunityFactoryContract(env) {
    let factory = new ethers.ContractFactory(CommunityFactoryJson.abi, CommunityFactoryJson.bytecode, env.wallet);
    let contract = await factory.deploy(env.Committee, {
        gasPrice: env.gasPrice
    });
    await contract.deployed();
    env.CommunityFactory = contract.address;
    console.log("✓ CommunityFactory contract deployed", contract.address);
}

async function deployGaugeContract(env) {
    let factory = new ethers.ContractFactory(GaugeJson.abi, GaugeJson.bytecode, env.wallet);
    let contract = await factory.deploy(env.CommunityFactory, 1000, {
        community: 2000,
        poolFactory: 0,
        user: 8000
    }, env.NutPower, NutAddress, {gasPrice: env.gasPrice})
    await contract.deployed();
    env.Gauge = contract.address;
    console.log("✓ Gauge contract deployed", contract.address);
}

async function deployLinearCalculatorContract(env) {
    let factory = new ethers.ContractFactory(LinearCalculatorJson.abi, LinearCalculatorJson.bytecode, env.wallet);
    let contract = await factory.deploy(env.CommunityFactory, {
        gasPrice: env.gasPrice
    });
    await contract.deployed();
    env.LinearCalculator = contract.address;
    console.log("✓ LinearCalculator contract deployed", contract.address);
}

async function deployTreasuryFactoryContract(env) {
    let factory = new ethers.ContractFactory(TreasuryFactoryJson.abi, TreasuryFactoryJson.bytecode, env.wallet)
    let contract = await factory.deploy(env.CommunityFactory, {
        gasPrice: env.gasPrice
    });
    await contract.deployed();
    env.TreasuryFactory = contract.address;
    console.log("✓ TreasureFactory contract deployed", contract.address);
}

async function main() {
    let env = {}
    env.url = process.env.TESTENDPOINT;
    env.privateKey = process.env.TESTKEY;
    env.provider = new ethers.providers.JsonRpcProvider(env.url);
    env.wallet = new ethers.Wallet(env.privateKey, env.provider);
    env.gasPrice = await env.provider.getGasPrice();
    // env.gasPrice = env.gasPrice * 1.5
    console.log(`private: ${env.privateKey}, url: ${env.url}`);

    let startBalance = await env.provider.getBalance(env.wallet.address);

    env.Committee = '0x524d1C459DE80820D8EeeDdbeB891799c5523C85';
    env.MintableERC20Factory = '0x42A2D3D7cf116c56f1D47643B3524E78b867aBb7';
    env.NutPower = '0x5CD907265f54590c4e035Af3D1Dd731AeED82603'
    env.CommunityFactory = '0x113866ac496Bd85A8A8a687d04139bA441d09276'
    env.SPStakingFactory = '0x9Df9D7412E4462AA863A35B54142d1D35F07b214'
    env.CosmosStakingFactory = '0xbe1709B3D175aaecA132BEA8630063E99f090D68'
    env.ERC20StakingFactory = '0x1AC355145e523C1295D5AB8cC6f37087E286B94E'
    env.LinearCalculator = '0x604a7CADDFf6Cc87cf3cB74Adb0580c53E91B6d8'
    env.Gauge = '0x56c44B51eaCcd283024523dF1268A8E01887C218'

    // await deployCommitteeContract(env);
    // await deployMintableERC20FactoryContract(env);
    // await deployNutPowerContract(env);
    // await deployCommunityFactoryContract(env);
    // await deploySPStakingFactoryContract(env);
    // await deployCosmosStakingFactoryContract(env);
    // await deployERC20StakingFactoryContract(env);
    // await deployERC1155StakingFactoryContract(env);
    // await deployLinearCalculatorContract(env);
    // await deployGaugeContract(env);
    await deployTreasuryFactoryContract(env);
    return;
    let tx;

    const committeeContract = new ethers.Contract(env.Committee, CommitteeJson.abi, env.wallet)
    tx = await committeeContract.adminAddWhitelistManager(env.CommunityFactory);
    console.log('Admin set factory to committee whitelist');

    // committee set contracts whitelist
    tx = await committeeContract.adminAddContract(env.MintableERC20Factory);
    console.log(`Admin register MintableERC20Factory`);
    tx = await committeeContract.adminAddContract(env.LinearCalculator);
    console.log(`Admin register linear calculator`);
    tx = await committeeContract.adminAddContract(env.SPStakingFactory);
    console.log(`Admin register SPStakingFactory`);
    tx = await committeeContract.adminAddContract(env.ERC20StakingFactory);
    console.log(`Admin register ERC20StakingFactory`);
    tx = await committeeContract.adminAddContract(env.ERC1155StakingFactory);
    console.log(`Admin register ERC1155StakingFactory`);
    tx = await committeeContract.adminAddContract(env.CosmosStakingFactory);
    console.log(`Admin register CosmosStakingFactory`);

    // set Gauge to committee
    tx = await committeeContract.adminSetGauge(env.Gauge);
    console.log(`Admin register Gauge`);

    // committee set fee free list
    tx = await committeeContract.adminAddFeeFreeAddress(env.SPStakingFactory);
    console.log(`Admin set address:${env.SPStakingFactory} to fee free list`);
    tx = await committeeContract.adminAddFeeFreeAddress(env.CosmosStakingFactory);
    console.log(`Admin set address:${env.CosmosStakingFactory} to fee free list`);

    // staking factory set bridge
    // const sPStakingFactoryContract = new ethers.Contract(env.SPStakingFactory, SPStakingFactoryJson.abi, env.wallet);
    // tx = await sPStakingFactoryContract.adminSetBridge(env.wallet.address);
    // console.log(`Admin set sp staking bridge`);
    // const cosmosStakingFactoryContract = new ethers.Contract(env.CosmosStakingFactory, CosmosStakingFactoryJson.abi, env.wallet);
    // tx = await cosmosStakingFactoryContract.adminAddBridge(1, env.wallet.address);  // steem
    // tx = await cosmosStakingFactoryContract.adminAddBridge(2, env.wallet.address);  // hive
    // tx = await cosmosStakingFactoryContract.adminAddBridge(3, '0xAF35c6452B3DD42dCc2AF8BF9689484bF27Aa143');  // Tien's address
    // tx = await cosmosStakingFactoryContract.adminAddBridge(1, '0xD9f4985a73349dea9aCB7c424E35056714bA2B35');  // Boy's address
    // tx = await cosmosStakingFactoryContract.adminAddBridge(3, "0x8c4C0Ec6d30A7B3f81E4F70a46b3c8B44B99470D");  // atom
    // tx = await cosmosStakingFactoryContract.adminAddBridge(4, "0xFa41CfdaAf9ae7f3a72d86229FBE428bb186A305");  // osmo
    // tx = await cosmosStakingFactoryContract.adminAddBridge(5, "0x6587FD7f5Dd9D0EbC13bf5C9CEfCf675a11d351f");  // juno
    // console.log(`Admin set cosmos staking bridge`);

    // set gauge to np
    const nutPowerContract = new ethers.Contract(env.NutPower, NutPowerJson.abi, env.wallet);
    tx = await nutPowerContract.adminSetWhitelist(env.Gauge, true);
    console.log('Admin set gauge to nut power');

    // set gauge param
    const gauge = new ethers.Contract(env.Gauge, GaugeJson.abi, env.wallet)
    tx = await gauge.adminSetRewardNUTPerBlock(ethers.utils.parseUnits('1.0', 18))
    console.log('Admin set gauge distribution to 1 nut per block');

    // set transaction fee
    // tx = await committeeContract.adminSetFee(
    //     'COMMUNITY', 
    //     ethers.utils.parseUnits('0.1', 18));
    // tx = await committeeContract.adminSetFee(
    //     'USER', 
    //     ethers.utils.parseUnits('0.01', 18));

    // console.log(`Admin set fees`);

    let deployCost = startBalance.sub((await env.provider.getBalance(env.wallet.address)))

    const blockNum = await env.provider.getBlockNumber();

    const output = {
        Committee: env.Committee ?? "Not Deployed",
        MintableERC20Factory: env.MintableERC20Factory ?? 'Not Deployed',
        NutPower: env.NutPower ?? 'Not Depoloyed',
        CommunityFactory: env.CommunityFactory ?? "Not Deployed",
        LinearCalculator: env.LinearCalculator ?? "Not Deployed",
        SPStakingFactory: env.SPStakingFactory ?? 'Not Deployed',
        ERC20StakingFactory: env.ERC20StakingFactory ?? "Not Deployed",
        ERC1155StakingFacory: env.ERC1155StakingFactory ?? "Not Depolyed",
        CosmosStakingFactory: env.CosmosStakingFactory ?? "Not Deployed",
        Gauge:  env.Gauge ?? 'Not deployed',
        TreasuryFactory: env.TreasuryFactory ?? "Not deployed"
    }

    const outfile = "./scripts/contracts.json";
    const jsonStr = JSON.stringify(output, undefined, 2);
    fs.writeFileSync(outfile, jsonStr, { encoding: "utf-8" });
    
    console.log(`
        ===============================================================
        Url:            ${env.url}
        Deployer:       ${env.wallet.address}
        Depoly Cost:    ${ethers.utils.formatEther(deployCost)}
        Depoly block number: ${blockNum}

        Contract Addresses:
        ===============================================================
        Committee:              ${env.Committee ?? "Not Deployed"}
        ---------------------------------------------------------------
        MintableERC20Factory: ${env.MintableERC20Factory ?? "Not Deployed"}
        ---------------------------------------------------------------
        NutPower: ${env.NutPower ?? "Not Deployed"}
        ---------------------------------------------------------------
        CommunityFactory:       ${env.CommunityFactory ?? "Not Deployed"}
        ---------------------------------------------------------------
        LinearCalculator:       ${env.LinearCalculator ?? "Not Deployed"}
        ---------------------------------------------------------------
        SPStakingFactory:       ${env.SPStakingFactory ?? "Not Deployed"}
        ---------------------------------------------------------------
        ERC20StakingFactory:     ${env.ERC20StakingFactory ?? "Not Deployed"}
        ---------------------------------------------------------------
        ERC1155StakingFactory:    ${env.ERC1155StakingFactory ?? "Not Deployed"}
        ---------------------------------------------------------------
        CosmosStakingFactory:     ${env.CosmosStakingFactory ?? "Not Deployed"}
        ---------------------------------------------------------------
        Gauge: ${env.Gauge ?? "Not Deployed"}
        ---------------------------------------------------------------
        TreasuryFactory:        ${env.TreasuryFactory ?? "Not Deployed"}
        ===============================================================
    `);
}

main()
    .catch(console.error)
    .finally(() => process.exit());