const { ethers, network } = require("hardhat")
const {
    VERIFICATION_BLOCK_CONFIRMATIONS,
    developmentChains,
} = require("../helper-hardhat.config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const accounts = ethers.getSigners()
    const player = accounts[0]
    // let  chainId
    // const chainId = network.config.chainId
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    //--------------------------------------------------------------------------------------------
    log("-----------------deploying NftMarketplace--------------------")
    const nftMarketplace = await deploy("NftMarketplace", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: 1,
    })
    log("-----------------finished deploying --------------------")
    log("")
}

module.exports.tags = ["all", "nftMarketplace"]
