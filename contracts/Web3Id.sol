// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

/**
 * This contract is only as a db for wormhole project
 * We store twitter steem and eth address bind info to this contract
 * Now we deploy this contract to aurora network
 * Contract: 0xd500368843318aD3c144a844276D867856799c3b
 */
contract Web3Id is Ownable {
    struct AccountInfo {
        uint256 twitterId;
        address ethAddress;
        string steemAccount;
    }

    mapping(uint256 => AccountInfo) public twitterMap;
    mapping(string => uint256) private steemMap;
    mapping(address => uint256) private ethMap;

    event AdminUpdateAccountBindInfo(uint256 indexed twitterId, address indexed etAddress, string indexed steemAccount);

    function adminSetAccount(uint256 twitterId, address ethAddress, string memory steem) public onlyOwner {
        AccountInfo memory info = AccountInfo(twitterId, ethAddress, steem);
        twitterMap[twitterId] = info;
        steemMap[steem] = twitterId;
        ethMap[ethAddress] = twitterId;

        emit AdminUpdateAccountBindInfo(twitterId, ethAddress, steem);
    }

    function adminSetAccounts(uint256[] calldata twitterIds, address[] calldata ethAddresses, string[] calldata steemAccounts) external onlyOwner {
        require(twitterIds.length > 0 && twitterIds.length == ethAddresses.length && twitterIds.length == steemAccounts.length, "Param invalid");

        uint256 count = twitterIds.length;
        for (uint256 i = 0; i < count; i++) {
            adminSetAccount(twitterIds[i], ethAddresses[i], steemAccounts[i]);
        }
    }

    function getSteemMap(string calldata steem) public view returns (AccountInfo memory) {
        return twitterMap[steemMap[steem]];
    }

    function getEthMap(address addr) public view returns (AccountInfo memory) {
        return twitterMap[ethMap[addr]];
    }
}
