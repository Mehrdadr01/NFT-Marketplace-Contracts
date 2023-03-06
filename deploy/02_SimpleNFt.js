const { ethers, network } = require("hardhat")
const {
    VERIFICATION_BLOCK_CONFIRMATIONS,
    developmentChains,
} = require("../helper-hardhat.config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const accounts = ethers.getSigners()
    // const deployer = accounts[0]
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("-----------------deploying simpleNFt--------------------")
    const simpleNFT01 = await deploy("SimpleNFT01", {
        from: deployer,
        arg: [],
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    const simpleNFT02 = await deploy("SimpleNFT02", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    log("---------------finished deploying------------------------")
    log("")
}

module.exports.tags = ["all", "simpleNFT"]
