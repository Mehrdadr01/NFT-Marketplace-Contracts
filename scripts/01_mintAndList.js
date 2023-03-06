const { ethers, network } = require("hardhat")

const mintAndList = async () => {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const simpleNft = await ethers.getContract("SimpleNFT01")
    console.log("Minting NFT...")
    const mintTx = await simpleNft.mintNFT()
    const mintReceipt = await mintTx.wait(1)
    const tokenId = mintReceipt.events[0].args.tokenId
    console.log("Approving NFT... ")
    const approvalTx = await simpleNft.approve(nftMarketplace.address, tokenId)
    await approvalTx.wait(1)
    console.log("Listing NFT...")
    const price = ethers.utils.parseEther("0.2")
    const listingTx = await nftMarketplace.listNftItems(
        simpleNft.address,
        tokenId,
        price
    )
    await listingTx.wait(1)
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
