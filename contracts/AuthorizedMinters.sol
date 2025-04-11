// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AuthorizedMinters is Ownable {
    struct Minter {
        uint256 royaltyPercentage; // in basis points (e.g., 500 = 5%)
    }

    mapping(address => Minter) private minters;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    /**
     * @dev Check if minter exists.
     * @param minter The address of the minter to check.
     * @return True if the minter is authorized, false otherwise.
     */
    function isMinterExists(address minter) external view returns (bool) {
        return minters[minter].royaltyPercentage > 0;
    }
    
    /**
     * @dev Adds a new minter with a specified royalty percentage.
     * Can only be called by the contract owner.
     * @param minter The address of the minter to add.
     * @param royaltyPercentage The royalty percentage in basis points.
     */
    function addMinter(address minter, uint256 royaltyPercentage) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        require(royaltyPercentage <= 10000, "Royalty percentage exceeds 100%");

        minters[minter] = Minter(royaltyPercentage);
        emit MinterAdded(minter);
    }

    /**
     * @dev Removes an authorized minter.
     * Can only be called by the contract owner.
     * @param minter The address of the minter to remove.
     */
    function removeMinter(address minter) external onlyOwner {
        delete minters[minter];
        emit MinterRemoved(minter);
    }

    /**
     * @dev Gets the royalty percentage for a specific minter.
     * @param minter The address of the minter.
     * @return The royalty percentage in basis points.
     */
    function getRoyaltyPercentage(address minter) external view returns (uint256) {
        require(minters[minter].isAuthorized, "Minter not authorized");
        return minters[minter].royaltyPercentage;
    }
}
