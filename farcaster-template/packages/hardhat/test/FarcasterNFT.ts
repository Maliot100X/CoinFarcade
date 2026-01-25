import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("FarcasterNFT", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFarcasterNFTFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const FarcasterNFT = await ethers.getContractFactory("FarcasterNFT");
    const farcasterNFT = await FarcasterNFT.deploy(owner.address);

    return { farcasterNFT, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { farcasterNFT, owner } = await loadFixture(
        deployFarcasterNFTFixture
      );

      expect(await farcasterNFT.owner()).to.equal(owner.address);
    });

    it("Should have the correct name and symbol", async function () {
      const { farcasterNFT } = await loadFixture(deployFarcasterNFTFixture);

      expect(await farcasterNFT.name()).to.equal("FarcasterNFT");
      expect(await farcasterNFT.symbol()).to.equal("FCAST");
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint NFTs", async function () {
      const { farcasterNFT, owner, otherAccount } = await loadFixture(
        deployFarcasterNFTFixture
      );

      const tokenURI = "https://example.com/token/1";
      await farcasterNFT.safeMint(otherAccount.address, tokenURI);

      expect(await farcasterNFT.ownerOf(0)).to.equal(otherAccount.address);
      expect(await farcasterNFT.tokenURI(0)).to.equal(tokenURI);
    });

    it("Should not allow non-owner to mint NFTs", async function () {
      const { farcasterNFT, otherAccount } = await loadFixture(
        deployFarcasterNFTFixture
      );

      await expect(
        farcasterNFT
          .connect(otherAccount)
          .safeMint(otherAccount.address, "test")
      ).to.be.revertedWithCustomError(
        farcasterNFT,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("NFT Enumeration", function () {
    it("Should return correct NFTs by address", async function () {
      const { farcasterNFT, owner, otherAccount } = await loadFixture(
        deployFarcasterNFTFixture
      );

      // Mint multiple NFTs
      await farcasterNFT.safeMint(otherAccount.address, "token1");
      await farcasterNFT.safeMint(otherAccount.address, "token2");
      await farcasterNFT.safeMint(owner.address, "token3");

      const otherAccountNFTs = await farcasterNFT.getNFTsByAddress(
        otherAccount.address
      );
      const ownerNFTs = await farcasterNFT.getNFTsByAddress(owner.address);

      expect(otherAccountNFTs.length).to.equal(2);
      expect(ownerNFTs.length).to.equal(1);
    });
  });
});
