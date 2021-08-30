// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import '../../common/Types.sol';

/**
 * @dev Interface of the reward calculator.
 */
interface ICalculator {
        function calculateReward(
            address staking,
            uint256 from,
            uint256 to
        ) external view returns(uint256);
}