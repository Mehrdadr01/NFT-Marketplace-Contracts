const { assert, expect } = require("chai")
const { ethers, network, deployments, getNamedAccounts } = require("hardhat")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat.config")
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NftMarketplace", async () => {
          let NftMarketplace, deployer
          const chainId = network.config.chainId
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["nftMarketplace"])
              NftMarketplace = await ethers.getContract("NftMarketplace")
          })
          describe("--listedNftItems", () => {
              it("1. check to see if price is below zero or not ", async () => {
                  await expect(
                      NftMarketplace.listNftItems({ _price: -1 })
                  ).to.be.revertedWith("NftMarketplace__priceMustBeAboveZero()")
              })
          })
      })
