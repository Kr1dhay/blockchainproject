// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;


// import "./AuthorizedMinters.sol";       // Optional: only if needed for extra checks
// import "./LuxuryWatchNFT.sol";
// import "./StolenWatchesRegistry.sol";

// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// contract ResellWatch is ReentrancyGuard { 
//     // Instance references for the deployed contracts.
//     LuxuryWatchNFT public luxurywatchNFT;
//     StolenWatchesRegistry public stolenWatchRegistry;
//     AuthorizedMinters public authorizedMinters;
//     address public contractOwner
//     uint256 private sellerCounter;


//     event WatchListed(string serialID, address indexed seller, address indexed buyer, uint256 price);
//     event WatchDelisted(string serialID, address indexed seller);
//     event WatchTransferred(string serialID, address indexed seller, address indexed buyer);

//     struct Listing {
//         address seller;
//         address buyer;
//         uint256 price; // In WEI
//         uint256 royaltyAmount; // Amount to be paid to the authorized minter in WEI
//         address minter;
//     }
//     mapping(uint256 => Listing) public listings;


//     constructor(
//         address _watchNFT,
//         address _stolenRegistry,
//         address _authorizedMinters // Optional: include if you plan to use authorized checks
//     ) {
//         watchNFT = LuxuryWatchNFT(_watchNFT);
//         stolenRegistry = StolenWatchesRegistry(_stolenRegistry);
//         authorizedMinters = AuthorizedMinters(_authorizedMinters);
//         contractOwner = msg.sender;
//         sellerCounter = 0;
//     }

//     modifier onlyOwner(string memory serialID) {
//         require(luxuryWatchNFT.ownerOfToken(serialID) == msg.sender, "Only the owner of the token can call this function");
//         _;
//     }


//     // We allow for a 0 price, which means that the monetary transaction of the watch and NFT will happen off platform
//     // The watch store will take a fixed fee if this is the case
//     function listWatch(string memory serialID, uint256 _priceWEI, address _buyer) external onlyOwner(serialID) {
//         uint256 tokenId = watchNFT.getTokenFromSerialID(serialID);
//         require(!stolenRegistry.isStolen(tokenId), "Watch is registered as stolen");
//         require(listings[tokenId].seller == address(0), "Watch already listed");
//         require(luxurywatchNFT.getApproved(tokenId) == address(this), "Contract is not approved to transfer this token");

//         uint256 royaltyPercentage = authorizedMinters.getRoyaltyPercentage(serialID)
//         uint256 _royaltyAmountWEI = 0;


//         if (_priceWEI <= (10**16)) {
//             _royaltyAmountWEI = (10**16) * royaltyPercentage / 10000
//         } else {
//             _royaltyAmountWEI = _priceWEI * royaltyPercentage / 10000;
//         }

//         listings[tokenId] = Listing({
//             seller: msg.sender,
//             buyer: _buyer,
//             price: _priceWEI,
//             royaltyAmount: _royaltyAmountWEI
//         });

//         emit WatchListed(serialID, msg.sender, _buyer, _priceWEI, _royaltyAmountWEI);
//     }


//     function cancelListing(string memory serialID) external onlyOwner(serialID) {
//         uint256 tokenId = watchNFT.getTokenFromSerialID(serialID);
//         require(listings[tokenId].seller == msg.sender, "Not listing owner");

//         delete listings[tokenId];
//         emit WatchDelisted(serialID, msg.sender);
//     }


//     function buyWatch(string memory serialID) external payable nonReentrant {
//         uint256 tokenId = watchNFT.getTokenFromSerialID(serialID);
//         require(!stolenRegistry.isStolen(tokenId), "Watch is registered as stolen");

//         require(listings[tokenId].seller != address(0), "Watch not listed");
//         require(listings[tokenId].buyer == msg.sender, "Not Designated Buyer");
//         require(msg.value >= listings[tokenId].price + listings[tokenId].royaltyAmount, "Insufficient funds");

//         delete listings[tokenId];

//         (bool sent, ) = payable(listings[tokenId].seller).call{value: listings[tokenId].price}("");
//         require(sent, "Transfer failed");

//         (bool sent, ) = payable(listings[tokenId].minter).call{value: listings[tokenId].royaltyAmount}("");
//         require(sent, "Transfer failed");

//         watchNFT.safeTransferFrom(listings[tokenId].seller, msg.sender, tokenId);

//         emit WatchResold(tokenId, msg.sender, listing.price);
//     }

// }
// NOTE: COULD BE AN AREA FOR IMPROVEMENT, ALLOW END USERS TO SEE WHOS SELLING SO WE ARE MORE LIKE A MARKETPLACE AND NOT JUST AN ANTITHEFT
//     function markSellingInterest(string memory serialID, string memory telegram) onlyOwner(serialID) external {
//         sellerCounter++;
//         sellingDetails[sellerCounter] = SellerDetails({
//             serialID: serialID,
//             telegram: telegram
//         });
//     }

//     function getSellerDetails() onlyOwner(serialID) external view returns (string memory) {
//         for i in range (1, sellerCounter) {
//             if bytes(sellingDetails[i].serialID) > 0 {
//                 return sellingDetails[i].telegram;
//             }
//     }
// }

//   struct SellerDetails {
//     string serialID;
//     string telegram;
// }
// mapping(uint256 => SellerDetails) public sellingDetails;
