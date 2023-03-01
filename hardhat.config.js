require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */

const { GOERLI_RPC_URL_ALCHEMY } = process.env || "https://eth-goerli"
const { COIN_MARKET_API_KEY } = process.env || "key"
const { GOERLI_PRIVATE_KEY_01_FF } = process.env || "key"
const { ETHERSCAN_API_KEY } = process.env || "key"

module.exports = {
    solidity: {
        compilers: [
            { version: "0.6.6" },
            { version: "0.8.0" },
            { version: "0.8.17" },
        ],
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    defaultNetwork: "hardhat",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
        goerli: {
            url: `https://eth-goerli.g.alchemy.com/v2/${GOERLI_RPC_URL_ALCHEMY}`,
            chainId: 5,
            accounts: [GOERLI_PRIVATE_KEY_01_FF],
            blockConformations: 6,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-reporter.txt",
        noColors: true,
        currency: "USD",
        // coinmarketcap: COIN_MARKET_API_KEY,
        // token: "MATIC",
    },
}
