// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./AuthorizedMinters.sol";



contract LuxuryWatchNFT is ERC721URIStorage {
    
    address public contractOwner; 
    AuthorizedMinters public authorizedMinters;

    uint256 private tokenCounter;
    mapping(string => uint256) private serialIDtoTokenID;
    mapping(uint256 => address) private tokenIDtoMinter;

    event TokenMinted(address indexed minter, address indexed to, string serialID);
    event TokenDestroyed(string serialID);

    constructor(address authorizedMintersAddress) ERC721("LuxuryWatchNFT", "LWNFT") {
        authorizedMinters = AuthorizedMinters(authorizedMintersAddress);
        contractOwner = msg.sender;
        tokenCounter = 0;
    }

    // Modifier to restrict access to authorized minters
    modifier isMinter() {
        require(authorizedMinters.isMinter(msg.sender), "Not an authorized minter.");
        _;
    }

    // Mints a new token and assigns metadata URI
    function mint(address to, string memory serialID, string memory uri) external isMinter {
        require(serialIDtoTokenID[serialID] == 0, "Token already minted");

        tokenCounter++;
        uint256 tokenId = tokenCounter;
        serialIDtoTokenID[serialID] = tokenId;
        tokenIDtoMinter[tokenId] = msg.sender;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit TokenMinted(msg.sender, to, serialID);
    }

    function getTokenFromSerialID(string memory serialID) public view returns (uint256) {
        uint256 tokenId = serialIDtoTokenID[serialID];
        require(tokenId != 0, "Token does not exist.");
        return tokenId;
    }
    

    function minterOfToken(string memory serialID) external view returns (address) {
        uint256 tokenId = getTokenFromSerialID(serialID);
        return tokenIDtoMinter[tokenId];
    }

    function ownerOfToken(string memory serialID) external view returns (address) {
        uint256 tokenId = getTokenFromSerialID(serialID);

        return ownerOf(tokenId); // ERC721's built in function
    }

    function burn(string memory serialID) external {
        uint256 tokenId = getTokenFromSerialID(serialID);
        require(ownerOf(tokenId) == msg.sender, "Caller is not the owner of this token.");


        _burn(tokenId); // ERC721's built in function
        delete tokenIDtoMinter[tokenId];
        delete serialIDtoTokenID[serialID];
        emit TokenDestroyed(serialID);
    }


}