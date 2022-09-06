// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds; // total number of items ever created
    Counters.Counter private _itemsSold; // total number of item sold

    uint256 listingPrice = 0.001 ether; // people have to pay to list their nft
    address payable owner; // Owner of the smart contract

    constructor() ERC721("Metaverse Tokens", "META") {
        owner = payable(msg.sender);
    }

    mapping (uint256 => MarketItem) private idToMarketItem;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    event MarketItemCreated (
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    // Returns the listing price of the contract
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    // Update the listing price
    function updateListingPrice(uint _listingPrice) public payable {
        require(owner == msg.sender, "Only marketplace owner can update listing price");
        listingPrice = _listingPrice;
    }

    function createMarketItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price must be greater than zero");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
        emit MarketItemCreated(tokenId, msg.sender, address(this), price, false);
    } 
}