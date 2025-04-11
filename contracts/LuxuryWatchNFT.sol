// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./AuthorizedMinters.sol";

contract LuxuryWatchNFT is ERC721 {
    
    mapping(uint256 => address) private _minterOf; // Mapping to store the original minter of each token
    uint256[] private _existingTokens; // Array to store existing tokens

    // Event emitted when a token is minted
    event TokenMinted(address indexed minter, address indexed to, uint256 indexed tokenId);

    // Event emitted when a token is destroyed
    event TokenDestroyed(uint256 indexed tokenId);

    // Instance of the AuthorizedMinters contract
    AuthorizedMinters private authorizedMinters;

    // Instance of ERC721 contract
    ERC721 private erc721Instance;

    // Modifier to restrict access to authorized minters
    modifier isMinter() {
        require(authorizedMinters.isMinter(msg.sender), "Not an authorized minter.");
        _;
    }

    function isExistingToken(uint256 tokenId) public view returns (bool) {
        // Check if the tokenId exists in the _existingTokens array
        bool exists = false;
        for (uint256 i = 0; i < _existingTokens.length; i++) {
            if (_existingTokens[i] == tokenId) {
                exists = true;
                break;
            }
        }
        return exists;
    }

    // Constructor to initialize the AuthorizedMinters contract address
    constructor(address authorizedMintersAddress) ERC721("LuxuryWatchNFT", "LWNFT") {
        authorizedMinters = AuthorizedMinters(authorizedMintersAddress);
        erc721Instance = ERC721(address(this)); // Initialize the ERC721 instance
    }

    // Modified to check if minted NFT belongs to the caller
    modifier onlyMinter(uint256 tokenId) {
        require(_minterOf[tokenId] == msg.sender, "Caller is not the minter of this token.");
        _;
    }

    // Function to mint a new NFT
    function mint(address to, uint256 tokenId) external isMinter() {
        _mint(to, tokenId); // Mint the token
        _minterOf[tokenId] = msg.sender;
        // Add the tokenId to the _existingTokens array
        _existingTokens.push(tokenId);
        emit TokenMinted(msg.sender, to, tokenId); // Emit the TokenMinted event
    }

    // Function to burn (destroy) a token
    function burn(uint256 tokenId) external isMinter() {
        _burn(tokenId);

        emit TokenDestroyed(tokenId); // Emit the TokenDestroyed event
    }

    // Function to get the minter of a token
    function minterOf(uint256 tokenId) external view returns (address) {
        require(isExistingToken(tokenId), "Token does not exist.");
        return _minterOf[tokenId];
    }

    // Function to get the owner of a token
    function ownerOfToken(uint256 tokenId) external view returns (address) {
        require(isExistingToken(tokenId), "Token does not exist.");
        return erc721Instance.ownerOf(tokenId);
    }

    // Function to transfer directly from Authorized Minter to Primary Seller
    function transferFromMinterToPrimarySeller(address from, address to, uint256 tokenId) external isMinter() onlyMinter(tokenId) {
        _transfer(from, to, tokenId); // Transfer the token
    }
}