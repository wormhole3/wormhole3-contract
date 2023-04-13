const ethers = require('ethers');

const data = '0x7998994a00000000000000000000000000000000000000000000000000000000cbd1e3ed00000000000000000000000058637112d07e32ab86208e36b1e81463e9c64e6000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000003f8b10e67a2e66340600000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000004215233f3d1f0000000000000000000000000000000000000000000000000000000000000041e66b8ff162dd92256848eb2099f6ac727be70fdd4a1fd0ca376bb1c9d15e7435097464c01c16e9b9cdc41741c0f8b5cfd088a457a772edb56ceee6a181359c871b00000000000000000000000000000000000000000000000000000000000000';
let result = ethers.utils.defaultAbiCoder.decode(
    ['uint256', 'address', 'uint256[]', 'uint256','bytes'],
    ethers.utils.hexDataSlice(data, 4)
);

console.log(result);
console.log(result[0].toString());

