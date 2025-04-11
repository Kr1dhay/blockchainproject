// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "LuxuryWatchNFT.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract AuthorizedMintersToPrimarySeller is LuxuryWatchNFT {
    event TransferredOwnershipfromAuthorisedSellerToPrimarySeller(uint256 indexed tokenId, address indexed newOwner);

    constructor() {}

    function transferOwnershipfromAuthorisedSellerToPrimarySeller(uint256 tokenId, address primarySeller) external onlyMinter(tokenId) {
        require(_exists(tokenId), "Token does not exist");
        _primarySellers[tokenId] = primarySeller;
        emit TransferredOwnershipfromAuthroisedSellerToPrimarySeller(tokenId, newOwner);
    }

    function getPrimarySeller(uint256 tokenId) external view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return _primarySellers[tokenId];
    }
}