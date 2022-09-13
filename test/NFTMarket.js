const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Marketplace", function () {
  let NFTMarket;
  let nftMarket;
  let listingPrice;
  let contractOwner;
  let buyerAddress;
  let nftMarketAddress;

  const auctionPrice = ethers.utils.parseUnits("100", "ether");

  beforeEach(async () => {
    NFTMarket = await ethers.getContractFactory("NFTMarketplace");
    nftMarket = await NFTMarket.deploy();
    await nftMarket.deployed();
    nftMarketAddress = nftMarket.address;
    [contractOwner, buyerAddress] = await ethers.getSigners();
    listingPrice = await nftMarket.getListingPrice();
    listingPrice = listingPrice.toString();
  });

  const mintAndListNFT = async (tokenURI, auctionPrice) => {
    const transaction = await nftMarket.createToken(tokenURI, auctionPrice, {
      value: listingPrice,
    });
    const receipt = await transaction.wait();
    const tokenID = receipt.events[0].args.tokenId;
    return tokenID;
  };

  describe("Mint and list a new NFT token", function () {
    const tokenURI = "https://some-token.uri";

    it("Should revert if price is zero", async () => {
      await expect(mintAndListNFT(tokenURI, 0)).to.be.revertedWith(
        "Price must be greater than zero"
      );
    });

    it("Should revert if listing price is not correct", async function () {
      await expect(
        nftMarket.createToken(tokenURI, auctionPrice, { value: 0 })
      ).to.be.revertedWith("Price must be equal to listing price");
    });

    it("Should create an NFT with the correct owner and tokenURI", async function () {
      const tokenID = await mintAndListNFT(tokenURI, auctionPrice);
      const mintedTokenURI = await nftMarket.tokenURI(tokenID);
      const ownerAddress = await nftMarket.ownerOf(tokenID);

      expect(ownerAddress).to.equal(nftMarketAddress);
      expect(mintedTokenURI).to.equal(tokenURI);
    });

    it("Should emit MarketItemCreated after successfully listing of NFT", async function () {
      const transaction = await nftMarket.createToken(tokenURI, auctionPrice, {
        value: listingPrice,
      });
      const receipt = await transaction.wait();
      const tokenID = receipt.events[0].args.tokenId;
      await expect(transaction)
        .to.emit(nftMarket, "MarketItemCreated")
        .withArgs(
          tokenID,
          contractOwner.address,
          nftMarketAddress,
          auctionPrice,
          false
        );
    });
  });

  describe("Execute sale of a marketplace item", function () {
    const tokenURI = "https://some-token.uri";

    it("Should revert if auction price is not correct", async () => {
      const newNftToken = await mintAndListNFT(tokenURI, auctionPrice);
      await expect(
        nftMarket
          .connect(buyerAddress)
          .createMarketSale(newNftToken, { value: 20 })
      ).to.be.revertedWith(
        "Please submit the asking price in order to complete the purchase"
      );
    });

    it("Buy a new token and check token owner address", async () => {
      const newNftToken = await mintAndListNFT(tokenURI, auctionPrice);
      const oldOwnerAddress = await nftMarket.ownerOf(newNftToken);

      // Now the owner is the marketplace address
      expect(oldOwnerAddress).to.equal(nftMarketAddress);
      await nftMarket
        .connect(buyerAddress)
        .createMarketSale(newNftToken, { value: auctionPrice });

      const newOwnerAddress = await nftMarket.ownerOf(newNftToken);
      // Now the new owner is the buyer address
      expect(newOwnerAddress).to.equal(buyerAddress.address);
    });
  });
});
