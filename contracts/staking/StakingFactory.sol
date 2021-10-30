// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import './StakingTemplate.sol';
import './calculators/ICalculator.sol';

/**
 * @dev Factory contract to create an StakingTemplate entity
 *
 * This is the entry contract that user start to create their own staking economy.
 */
contract StakingFactory {

    address public immutable registryHub;

    event StakingFeastCreated(address indexed creator, address indexed stakingFeast, bytes32 indexed rewardAsset);

    constructor(address _registryHub) {
        registryHub = _registryHub;
    }

    // only owner of reward token can call this method 
    function createStakingFeast (
        bytes32 _rewardAsset,
        address _rewardCalculator,
        bytes calldata policy
    ) external {
        if (IRegistryHub(registryHub).mintable(_rewardAsset)) {
            require((IRegistryHub(registryHub).getOwner(_rewardAsset) == msg.sender), "FEOWNER");
        }

        address tokenAddress = IRegistryHub(registryHub).getHomeLocation(_rewardAsset);
        require(tokenAddress != address(0), 'RANR'); // reward asset not registerd
        require(_rewardCalculator != address(0), 'Invalid address');

        StakingTemplate feastAddress = new StakingTemplate(registryHub);

        feastAddress.initialize(
            msg.sender,
            _rewardAsset,
            _rewardCalculator
        );

        // set staking feast rewarad distribution policy
        ICalculator(_rewardCalculator).setDistributionEra(address(feastAddress), policy);

        // add feast into whitelist of ERC20AssetHandler
        bytes memory data = abi.encodeWithSignature(
            "setWhitelist(address)",
            address(feastAddress)
        );
        (bool success1,) = IRegistryHub(registryHub).getERC20AssetHandler().call(data);
        require(success1, "FERC20");

        // add feast into whitelist of TrustlessAssetHandler
        (bool success2,) = IRegistryHub(registryHub).getTrustlessAssetHandler().call(data);
        require(success2, "Ftrustless");

        emit StakingFeastCreated(msg.sender, address(feastAddress), _rewardAsset);
    }
}
