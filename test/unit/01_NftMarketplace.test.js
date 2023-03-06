const { assert, expect } = require("chai")
const { ethers, network, deployments, getNamedAccounts } = require("hardhat")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat.config")
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NftMarketplace", async () => {
          let NftMarketplace,
              NftMarketplaceContract,
              SimpleNFT01,
              SimpleNFT01Contract,
              deployer,
              accounts,
              user
          const TOKEN_ID = 0
          const PRICE = ethers.utils.parseEther("0.01")
          const chainId = network.config.chainId
          beforeEach(async () => {
              //   deployer = (await getNamedAccounts()).
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              user = accounts[1]
              await deployments.fixture(["all"])
              NftMarketplaceContract = await ethers.getContract(
                  "NftMarketplace"
              )
              NftMarketplace = NftMarketplaceContract.connect(deployer)
              SimpleNFT01Contract = await ethers.getContract("SimpleNFT01")
              SimpleNFT01 = SimpleNFT01Contract.connect(deployer)
              await SimpleNFT01.mintNFT()
              await SimpleNFT01.approve(
                  NftMarketplaceContract.address,
                  TOKEN_ID
              )
          })
          describe("--listedNftItems", () => {
              it("1.doesn't allow for duplicate item", async () => {
                  await NftMarketplace.listNftItems(
                      SimpleNFT01.address,
                      TOKEN_ID,
                      PRICE
                  )
                  await expect(
                      NftMarketplace.listNftItems(
                          SimpleNFT01.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.be.reverted
              })
              it("2.only owner can list their nft", async () => {
                  NftMarketplace = NftMarketplaceContract.connect(user)
                  await SimpleNFT01.approve(user.address, TOKEN_ID)
                  await expect(
                      NftMarketplace.listNftItems(SimpleNFT01.address, TOKEN_ID)
                  ).to.be.reverted
              })
              it("3.need approval ro list nft", async () => {
                  const SimpleNFT02Contract = await ethers.getContract(
                      "SimpleNFT02"
                  )
                  const SimpleNFT02 = SimpleNFT02Contract.connect(deployer)
                  await SimpleNFT02.mintNFT()
                  await expect(
                      NftMarketplace.listNftItems(
                          SimpleNFT02.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.be.reverted
              })
              it("4.check to see if listing mapping update after list an item", async () => {
                  await NftMarketplace.listNftItems(
                      SimpleNFT01.address,
                      TOKEN_ID,
                      PRICE
                  )
                  const listing = await NftMarketplace.get_listing(
                      SimpleNFT01.address,
                      TOKEN_ID
                  )
                  assert.equal(listing.price.toString(), PRICE.toString())
                  assert.equal(listing.seller, deployer.address)
              })
              it("5.emit an event after listing NFT ", async () => {
                  expect(
                      await NftMarketplace.listNftItems(
                          SimpleNFT01.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.emit("NftListed")
              })
          })
          describe("--buyItem", () => {
              it("1.check to see if item listed or not ", async () => {
                  //   const SimpleNFTContract = await ethers.getContract(
                  //       "SimpleNFT02"
                  //   )
                  //   const simpleNFT = SimpleNFTContract.connect(deployer)
                  //   simpleNFT.approve(NftMarketplace.address, TOKEN_ID)
                  await expect(
                      NftMarketplace.buyItem(SimpleNFT01.address, TOKEN_ID)
                  ).to.be.reverted
              })
              it("2.emit an event after buying a NFT", async () => {
                  await NftMarketplace.listNftItems(
                      SimpleNFT01.address,
                      TOKEN_ID,
                      PRICE
                  )
                  expect(
                      await NftMarketplace.buyItem(
                          SimpleNFT01.address,
                          TOKEN_ID,
                          {
                              value: PRICE,
                          }
                      )
                  ).to.emit("NftBought")
              })
              it("3.change the owner after buying NFT", async () => {
                  await NftMarketplace.listNftItems(
                      SimpleNFT01.address,
                      TOKEN_ID,
                      PRICE
                  )
                  // if we don't change it to user account still owner can buy his/her nft
                  // it should be fix || owner can buy ???????

                  NftMarketplace = NftMarketplaceContract.connect(user)
                  expect(
                      await NftMarketplace.buyItem(
                          SimpleNFT01.address,
                          TOKEN_ID,
                          {
                              value: PRICE,
                          }
                      )
                  ).to.emit("NftBought")
                  //////////////////////////////////////////////////////////
                  const newOwner = await SimpleNFT01.ownerOf(TOKEN_ID)
                  // const sellerProceed = await NftMarketplace.get_proceeds(
                  //     deployer.address
                  // )
                  assert.equal(newOwner, user.address)
              })
              it("4.change the seller proceeds by NFT price amount ", async () => {
                  await NftMarketplace.listNftItems(
                      SimpleNFT01.address,
                      TOKEN_ID,
                      PRICE
                  )
                  // if we don't change it to user account still owner can buy his/her nft
                  // it should be fix || owner can buy ???????

                  NftMarketplace = NftMarketplaceContract.connect(user)
                  expect(
                      await NftMarketplace.buyItem(
                          SimpleNFT01.address,
                          TOKEN_ID,
                          {
                              value: PRICE,
                          }
                      )
                  ).to.emit("NftBought")
                  //////////////////////////////////////////////////////////
                  //   const newOwner = await SimpleNFT01.ownerOf(TOKEN_ID)
                  const sellerProceed = await NftMarketplace.get_proceeds(
                      deployer.address
                  )
                  //   assert.equal(newOwner, user.address)
                  assert.equal(sellerProceed.toString(), PRICE.toString())
              })
          })
          describe("--cancelItem", () => {
              it("1.check to see if item is deleted from itemList", async () => {
                  await NftMarketplace.listNftItems(
                      SimpleNFT01.address,
                      TOKEN_ID,
                      PRICE
                  )
                  await NftMarketplace.cancelItem(SimpleNFT01.address, TOKEN_ID)
                  const listing = await NftMarketplace.get_listing(
                      SimpleNFT01.address,
                      TOKEN_ID
                  )
                  assert.equal(listing.price.toString(), "0")
              })
              it("2.emit an event after canceling nft on the list ", async () => {
                  await NftMarketplace.listNftItems(
                      SimpleNFT01.address,
                      TOKEN_ID,
                      PRICE
                  )
                  expect(
                      await NftMarketplace.cancelItem(
                          SimpleNFT01.address,
                          TOKEN_ID
                      )
                  ).to.emit("CanceledItem")
              })
          })
          describe("--updateListing", () => {
              it("1.check to see if item price updated", async () => {
                  await NftMarketplace.listNftItems(
                      SimpleNFT01.address,
                      TOKEN_ID,
                      PRICE
                  )
                  const NewPrice = ethers.utils.parseEther("0.5")
                  await NftMarketplace.updateListing(
                      SimpleNFT01.address,
                      TOKEN_ID,
                      NewPrice
                  )
                  const listing = await NftMarketplace.get_listing(
                      SimpleNFT01.address,
                      TOKEN_ID
                  )
                  assert.equal(listing.price.toString(), NewPrice.toString())
              })
              it("2.must be listed to update", async () => {
                  await expect(
                      NftMarketplace.updateListing(
                          SimpleNFT01.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.be.reverted
              })
              it("3.must be owner to update ", async () => {
                  await NftMarketplace.listNftItems(
                      SimpleNFT01.address,
                      TOKEN_ID,
                      PRICE
                  )
                  NftMarketplace = NftMarketplaceContract.connect(user)
                  await expect(
                      NftMarketplace.updateListing(
                          SimpleNFT01.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.be.reverted
              })
              it("4.emit an event after updating the listing", async () => {
                  await NftMarketplace.listNftItems(
                      SimpleNFT01.address,
                      TOKEN_ID,
                      PRICE
                  )
                  expect(
                      await NftMarketplace.updateListing(
                          SimpleNFT01.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.emit("NftListed")
              })
          })
          describe("--withdrawProceeds", () => {
              it("1.no zero amount withdraw allowed", async () => {
                  await expect(NftMarketplace.withdrawProceeds()).to.be.reverted
              })
          })
      })
