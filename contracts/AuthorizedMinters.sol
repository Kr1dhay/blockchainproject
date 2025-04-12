// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract AuthorizedMinters {
    struct minterDetails {
        string brand;
        string location;
        uint256 royaltyPercentage; // in basis points (e.g., 500 = 5%)
    }

    mapping(address => minterDetails) private minters;
    address public contractOwner;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    constructor () {
        contractOwner = msg.sender;
    }

    modifier onlyContractOwner() {
        require(msg.sender == contractOwner, "Caller is not the contractOwner");
        _;
    }

    /**
     * @dev Check if minter exists.
     * @param minter The address of the minter to check.
     * @return True if the minted exists, false otherwise.
     */
    function isMinter(address minter) external view returns (bool) {
        return bytes(minters[minter].brand).length > 0;
    }

    /**
     * @dev Adds a new minter with a specified royalty percentage.
     * Can only be called by the contract contractOwner.
     */
    function addMinter(address minter, string memory _brand, string memory _location, uint256 _royaltyPercentage) external onlyContractOwner {
        require(bytes(_brand).length > 0, "Brand name cannot be empty");
        require(bytes(_location).length > 0, "Location cannot be empty");
        require(bytes(minters[minter].brand).length == 0, "Minter already exists");
        require(_royaltyPercentage <= 10000, "Royalty percentage exceeds 100%");

        minters[minter] = minterDetails(_brand, _location, _royaltyPercentage);
        emit MinterAdded(minter);
    }

    /**
     * @dev Removes an authorized minter.
     */
    function removeMinter(address minter) external onlyContractOwner {
        delete minters[minter];
        emit MinterRemoved(minter);
    }

    function getBrand(address minter) external view returns (string memory) {
        require(bytes(minters[minter].brand).length != 0, "Minter does not exist");
        return minters[minter].brand;
    }

    function getLocation(address minter) external view returns (string memory) {
        require(bytes(minters[minter].brand).length != 0, "Minter does not exist");
        return minters[minter].location;
    }

    function getRoyaltyPercentage(address minter) external view returns (uint256) {
        require(bytes(minters[minter].brand).length != 0, "Minter does not exist");
        return minters[minter].royaltyPercentage;
    }
}
