const CollectBless = artifacts.require("CollectBless");
const Random = artifacts.require("Random");
const Utils = artifacts.require("Utils");
const ERC20PresetMinterPauser = artifacts.require("ERC20PresetMinterPauser");
const ERC1155PresetMinterPauser = artifacts.require("ERC1155PresetMinterPauser");

module.exports = async function (deployer, network) {
    try {
        await Random.at(Random.address);
    } catch (e) {
        await deployer.deploy(Random);
    }

    try {
        await Utils.at(Utils.address);
    } catch (e) {
        await deployer.deploy(Utils);
    }

    await deployer.link(Utils, CollectBless);
    await deployer.deploy(CollectBless);

    if (network == "development") {
        try {
            await ERC20PresetMinterPauser.at(ERC20PresetMinterPauser.address);
        } catch (e) {
            await deployer.deploy(ERC20PresetMinterPauser, "Test USDT", "USDT");
        }
    }
}