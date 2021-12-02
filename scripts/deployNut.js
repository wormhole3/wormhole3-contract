require('dotenv').config();
const ethers = require('ethers');

const NUTTokenJson = require('../build/contracts/NUTToken.json');
const NUTAddress = '0x926E99b548e5D48Ca4C6215878b954ABd0f5D1f6'

async function deployNutContract(env) {
    let factory = new ethers.ContractFactory(NUTTokenJson.abi, NUTTokenJson.bytecode, env.wallet);
    let contract = await factory.deploy(
        'Nutbox',
        'NUT',
        ethers.utils.parseUnits("20000000.0", 18),
        env.wallet.address,
        { gasPrice: env.gasPrice, gasLimit: env.gasLimit}
    );
    await contract.deployed();
    console.log("✓ NUTToken contract deployed", contract.address);
    return contract.address;
}
async function main() {
    let env = {};
    env.url = process.env.TESTENDPOINT || 'http://localhost:8545';
    env.privateKey = process.env.TESTKEY;
    env.provider = new ethers.providers.JsonRpcProvider(env.url);
    console.log(`private: ${env.privateKey}, url: ${env.url}`);
    env.wallet = new ethers.Wallet(env.privateKey, env.provider);
    env.gasLimit = ethers.utils.hexlify(Number(process.env.GASLIMIT));
    env.gasPrice = await env.provider.getGasPrice();

    const tx = await deployNutContract(env);
   

}

main()
  .catch(console.error)
  .finally(() => process.exit());