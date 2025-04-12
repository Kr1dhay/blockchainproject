// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./AuthorizedMinters.sol";       // Optional: only if needed for extra checks
import "./LuxuryWatchNFT.sol";
import "./StolenWatchesRegistry.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract ResellWatch is ReentrancyGuard { 
    // Instance references for the deployed contracts.
    LuxuryWatchNFT public luxurywatchNFT;
    StolenWatchesRegistry public stolenWatchRegistry;
    AuthorizedMinters public authorizedMinters;
    address public contractOwner

    event WatchListed(string serialID, address indexed seller, address indexed buyer, uint256 price);
    event WatchDelisted(string serialID, address indexed seller);
    event WatchTransferred(uint256 indexed tokenId, address indexed buyer, uint256 price);

    struct Listing {
        address seller;
        address buyer;
        uint256 price; // In ETH
        uint256 royaltyAmount; // Amount to be paid to the authorized minter in ETH
    }

    mapping(uint256 => Listing) public listings;

    constructor(
        address _watchNFT,
        address _stolenRegistry,
        address _authorizedMinters // Optional: include if you plan to use authorized checks
    ) {
        watchNFT = LuxuryWatchNFT(_watchNFT);
        stolenRegistry = StolenWatchesRegistry(_stolenRegistry);
        authorizedMinters = AuthorizedMinters(_authorizedMinters);
        contractOwner = msg.sender;
    }

    modifier onlyOwner(string memory serialID) {
        require(luxuryWatchNFT.ownerOfToken(serialID) == msg.sender, "Only the owner of the token can call this function");
        _;
    }

    function bidForWatch(){

    }

    // We allow for a 0 price, which means that the monetary transaction of the watch and NFT will happen off platform
    // The watch store will take a fixed fee if this is the case
    function listWatch(string memory serialID, uint256 _priceWEI, address _buyer) external onlyOwner(serialID) {
        uint256 tokenId = watchNFT.getTokenFromSerialID(serialID);
        require(!stolenRegistry.isStolen(tokenId), "Watch is registered as stolen");
        require(listings[tokenId].seller == address(0), "Watch already listed");

        // Optionally: You may want to require that the NFT has been approved for transfer by this contract.


        uint256 royaltyPercentage = authorizedMinters.getRoyaltyPercentage(serialID)
        uint256 _royaltyAmountWEI = 0;


        if (_priceWEI <= (10**16)) {
            _royaltyAmountWEI = (10**16) * royaltyPercentage / 10000
        } else {
            _royaltyAmountWEI = _priceWEI * royaltyPercentage / 10000;
        }

        listings[tokenId] = Listing({
            seller: msg.sender,
            buyer: _buyer,
            price: _priceWEI,
            royaltyAmount: _royaltyAmountWEI
        });

        emit WatchListed(serialID, msg.sender, _buyer, _priceWEI, _royaltyAmountWEI);
    }

    /// @notice Cancels a listed watch.
    /// @param tokenId The NFT identifier.
    function cancelListing(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.seller == msg.sender, "Not listing owner");

        // Remove the listing.
        delete listings[tokenId];
        emit WatchDelisted(tokenId, msg.sender);
    }

    /// @notice Purchases a listed watch.
    /// @param tokenId The NFT identifier.
    /// The nonReentrant modifier from ReentrancyGuard ensures no re-entrant call can be made during this execution.
    function buyWatch(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.price != 0, "Watch not listed");
        require(msg.value >= listing.price, "Insufficient funds");

        // Remove the listing first to prevent reentrancy attacks.
        delete listings[tokenId];

        // Transfer NFT ownership from seller to buyer.
        // Use safeTransferFrom to ensure compatibility with ERC-721 standards.
        watchNFT.safeTransferFrom(listing.seller, msg.sender, tokenId);

        // Transfer funds to the seller.
        (bool sent, ) = payable(listing.seller).call{value: msg.value}("");
        require(sent, "Transfer failed");

        // Log the successful resale.
        emit WatchResold(tokenId, msg.sender, listing.price);
    }
}
