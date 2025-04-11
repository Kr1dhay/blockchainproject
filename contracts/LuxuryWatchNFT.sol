// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "AuthorizedMinters.sol";

contract LuxuryWatchNFT is ERC721URIStorage, Ownable {
    
    mapping(uint256 => address) private _minterOf; // Mapping to store the original minter of each token
    mapping(uint256 => address) private _tokenOwners;   // Mapping to store the original owner of each token

    // Event emitted when a token is minted
    event TokenMinted(address indexed minter, address indexed to, uint256 indexed tokenId, string tokenURI);

    // Event emitted when a token is destroyed
    event TokenDestroyed(uint256 indexed tokenId);

    constructor() ERC721("LuxuryWatchNFT", "LWNFT") {}

    // Modifier to restrict access to authorized minters
    modifier isMinter() {
        require(isMinterExists(msg.sender), "Not an authorized minter.");
        _;
    }

    // Modified to check if minted NFT belongs to the caller
    modifier onlyMinter(uint256 tokenId) {
        require(_minterOf[tokenId] == msg.sender, "Caller is not the minter of this token.");
        _;
    }

    // Function to mint a new NFT
    function mint(address to, uint256 tokenId, string memory tokenURI) external isMinter() {
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _minterOf[tokenId] = msg.sender;
        _tokenOwners[tokenId] = to; // Store the original owner of the token

        emit TokenMinted(msg.sender, to, tokenId, tokenURI); // Emit the TokenMinted event
    }

    // Function to burn (destroy) a token
    function burn(uint256 tokenId) external isMinter() {
        require(_exists(tokenId), "Token does not exist");
        _burn(tokenId);

        emit TokenDestroyed(tokenId); // Emit the TokenDestroyed event
    }

    // Function to get the minter of a token
    function minterOf(uint256 tokenId) external view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return _minterOf[tokenId];
    }

    // Function to get the owner of a token
    function ownerOf(uint256 tokenId) external view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenOwners[tokenId];
    }

    // Override tokenURI function to ensure metadata retrieval
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return super.tokenURI(tokenId);
    }
}