// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./AuthorizedMinters.sol";       // Optional: only if needed for extra checks
import "./LuxuryWatchNFT.sol";
import "./StolenWatchesRegistry.sol";

contract ResellWatch { 
    // Instance references for the deployed contracts.
    LuxuryWatchNFT public luxuryWatchNFT;
    StolenWatchesRegistry public stolenWatchesRegistry;
    AuthorizedMinters public authorizedMinters;
    address public contractOwner;
    uint256 private sellerCounter;


    event WatchListed(string serialID, address indexed seller, address indexed buyer, uint256 price, uint256 royaltyAmount);
    event WatchDelisted(string serialID, address indexed seller);
    event WatchTransferred(string serialID, address indexed seller, address indexed buyer);

    struct Listing {
        address seller;
        address buyer;
        uint256 price; // In WEI
        uint256 royaltyAmount; // Amount to be paid to the authorized minter in WEI
        address minter;
    }
    mapping(uint256 => Listing) public listings;


    constructor(
        address _authorizedMinters,
        address _watchNFT,
        address _stolenRegistry
    ) {
        luxuryWatchNFT = LuxuryWatchNFT(_watchNFT);
        stolenWatchesRegistry = StolenWatchesRegistry(_stolenRegistry);
        authorizedMinters = AuthorizedMinters(_authorizedMinters);
        contractOwner = msg.sender;
        sellerCounter = 0;
    }


    // We allow for a 0 price, which means that the monetary transaction of the watch and NFT will happen off platform
    // The watch store will take a fixed fee if this is the case
    function listWatch(string memory serialID, uint256 _priceWEI, address _buyer) external  {
        require(luxuryWatchNFT.ownerOfToken(serialID) == msg.sender, "Only the owner of the token can call this function");
        uint256 tokenId = luxuryWatchNFT.getTokenFromSerialID(serialID);
        require(!stolenWatchesRegistry.isStolen(serialID), "Watch is registered as stolen");
        require(listings[tokenId].seller == address(0), "Watch already listed");
        require(luxuryWatchNFT.getApproved(tokenId) == address(this), "Contract is not approved to transfer this token");

        address _minter = luxuryWatchNFT.minterOfToken(serialID);
        uint256 royaltyPercentage = authorizedMinters.getRoyaltyPercentage(_minter);

        uint256 _royaltyAmountWEI = 0;


        if (_priceWEI <= (10**16)) {
            _royaltyAmountWEI = (10**16) * royaltyPercentage / 10000;
        } else {
            _royaltyAmountWEI = _priceWEI * royaltyPercentage / 10000;
        }

        listings[tokenId] = Listing({
            seller: msg.sender,
            buyer: _buyer,
            price: _priceWEI,
            royaltyAmount: _royaltyAmountWEI,
            minter: _minter
        });


        emit WatchListed(serialID, msg.sender, _buyer, _priceWEI, _royaltyAmountWEI);
    }


    function cancelListing(string memory serialID) external {
        require(luxuryWatchNFT.ownerOfToken(serialID) == msg.sender, "Only the owner of the token can call this function");
        uint256 tokenId = luxuryWatchNFT.getTokenFromSerialID(serialID);
        require(listings[tokenId].seller == msg.sender, "Not listing owner");

        delete listings[tokenId];
        emit WatchDelisted(serialID, msg.sender);
    }

    function getListingPriceandComission(string memory serialID) external view returns (uint256) {
        uint256 tokenId = luxuryWatchNFT.getTokenFromSerialID(serialID);
        require(listings[tokenId].seller != address(0), "Watch not listed");
        return listings[tokenId].price + listings[tokenId].royaltyAmount;
    }


    function buyWatch(string memory serialID) external payable {
        uint256 tokenId = luxuryWatchNFT.getTokenFromSerialID(serialID);
        require(!stolenWatchesRegistry.isStolen(serialID), "Watch is registered as stolen");

        require(listings[tokenId].seller != address(0), "Watch not listed");
        require(listings[tokenId].buyer == msg.sender, "Not Designated Buyer");
        require(msg.value >= listings[tokenId].price + listings[tokenId].royaltyAmount, "Insufficient funds");


        (bool sentToSeller, ) = payable(listings[tokenId].seller).call{value: listings[tokenId].price}("");
        require(sentToSeller, "Transfer failed");

        (bool sentToMinter, ) = payable(listings[tokenId].minter).call{value: listings[tokenId].royaltyAmount}("");
        require(sentToMinter, "Transfer failed");

        luxuryWatchNFT.safeTransferFrom(listings[tokenId].seller, msg.sender, tokenId);
        address seller = listings[tokenId].seller;
        delete listings[tokenId];

        emit WatchTransferred(serialID, seller, msg.sender);
    }

}
