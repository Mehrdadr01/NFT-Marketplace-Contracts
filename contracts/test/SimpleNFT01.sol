// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SimpleNFT01 is ERC721 {
    string public constant TOKEN_URI =
        "ipfs://QmSqCSaTiSKvp3X8cCSC9sBoM9TwjnnBkWSTNrk8BfR51F";
    uint256 private s_tokenCounter;
    event DogMinted(uint256 indexed tokenId);

    constructor() ERC721("dogie", "DOG") {
        s_tokenCounter = 0;
    }

    function mintNFT() public {
        _safeMint(msg.sender, s_tokenCounter);
        emit DogMinted(s_tokenCounter);
        s_tokenCounter++;
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return TOKEN_URI;
    }

    function get_tokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
