// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/////////////////////// Errors //////////////////////////

error NftMarketplace__priceMustBeAboveZero();
error NftMarketplace__notApprovedForMarketplace();
error NftMarketplace__alreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__notOwner();
error NftMarketplace__notListed(address nftAddress, uint256 tokenId);

error NftMarketplace__priceNotmet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
error NftMarketplace__noProceeds();

contract NftMarketplace is ReentrancyGuard {
    /////////////////////// Variables //////////////////////////
    struct Listing {
        uint256 price;
        address seller;
    }
    // nft contract add -> tokenId -> Listing (price and seller )
    mapping(address => mapping(uint256 => Listing)) private s_listing;
    mapping(address => uint256) private s_proceeds;
    /////////////////////// Modifiers //////////////////////////
    modifier notListed(
        address _nftAddress,
        uint256 _tokenId,
        address _owner
    ) {
        Listing memory listing = s_listing[_nftAddress][_tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__alreadyListed(_nftAddress, _tokenId);
        }
        _;
    }
    modifier isListed(address _nftAddress, uint256 _tokenId) {
        Listing memory listing = s_listing[_nftAddress][_tokenId];
        if (listing.price <= 0) {
            revert NftMarketplace__notListed(_nftAddress, _tokenId);
        }
        _;
    }
    modifier isOwner(
        address _nftAddress,
        uint256 _tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(_nftAddress);
        address owner = nft.ownerOf(_tokenId);
        if (owner != spender) {
            revert NftMarketplace__notOwner();
        }
        _;
    }
    /////////////////////// Events //////////////////////////
    event NftListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    event NftBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    event CanceledItem(
        address indexed seller,
        address indexed nftAddress,
        uint256 tokenId
    );

    ////////////////////////////////////////////////////////////
    /////////////////////// Functions //////////////////////////
    /**
     * @notice listing your items(NFTs) on the marketplace
     * @param _nftAddress : address of the NFT
     */
    function listNftItems(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price
    )
        external
        notListed(_nftAddress, _tokenId, msg.sender)
        isOwner(_nftAddress, _tokenId, msg.sender)
    {
        if (_price <= 0) {
            revert NftMarketplace__priceMustBeAboveZero();
        }
        IERC721 nft = IERC721(_nftAddress);
        if (nft.getApproved(_tokenId) != address(this)) {
            revert NftMarketplace__notApprovedForMarketplace();
        }
        s_listing[_nftAddress][_tokenId] = Listing(_price, msg.sender);
        emit NftListed(msg.sender, _nftAddress, _tokenId, _price);
    }

    function buyItem(
        address _nftAddress,
        uint256 _tokenId
    ) external payable isListed(_nftAddress, _tokenId) nonReentrant {
        Listing memory listedItems = s_listing[_nftAddress][_tokenId];

        if (msg.value < listedItems.price) {
            revert NftMarketplace__priceNotmet(
                _nftAddress,
                _tokenId,
                listedItems.price
            );
        }
        //
        //  require(msg.value > listedItems.price, "gi de selay");

        // we dont sent the money directly to user
        // we let them to withdraw for themselfs
        s_proceeds[listedItems.seller] += msg.value;

        delete (s_listing[_nftAddress][_tokenId]);
        IERC721(_nftAddress).safeTransferFrom(
            listedItems.seller,
            msg.sender,
            _tokenId
        );
        emit NftBought(msg.sender, _nftAddress, _tokenId, listedItems.price);
    }

    function cancelItem(
        address _nftAddress,
        uint256 _tokenId
    )
        external
        isListed(_nftAddress, _tokenId)
        isOwner(_nftAddress, _tokenId, msg.sender)
    {
        delete (s_listing[_nftAddress][_tokenId]);
        emit CanceledItem(msg.sender, _nftAddress, _tokenId);
    }

    function updateListing(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _newPrice
    )
        external
        isListed(_nftAddress, _tokenId)
        isOwner(_nftAddress, _tokenId, msg.sender)
    {
        // Listing memory listing = s_listing[_nftAddress][_tokenId];
        // listing.price = _newPrice;
        if (_newPrice < 0) {
            revert NftMarketplace__priceMustBeAboveZero();
        }
        s_listing[_nftAddress][_tokenId].price = _newPrice;
        emit NftListed(msg.sender, _nftAddress, _tokenId, _newPrice);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NftMarketplace__noProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        require(success, "transfer failed");
    }

    /////////////////////// Getter functions //////////////////////////
    function get_listing(
        address _nftadd,
        uint256 _tokenId
    ) external view returns (Listing memory) {
        return s_listing[_nftadd][_tokenId];
    }

    function get_proceeds(address owner) external view returns (uint256) {
        return s_proceeds[owner];
    }
}
