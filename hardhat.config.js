require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
const secrets = require('./secrets.json')

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
      mining: {
        mempool: {
          order: "fifo"
        }
      }
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${secrets.alchemyApiKey}`,
      accounts: [secrets.privateKey]
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${secrets.projectId}`,
      accounts: [secrets.privateKey]
    },
    rinkeby: {
      url: `  https://rinkeby.infura.io/v3/${secrets.projectId}`,
      accounts: [secrets.privateKey]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${secrets.projectId}`,
      accounts: [secrets.privateKey]
    }
  },
  etherscan: {
    apiKey: {
      mainnet: secrets.etherscanApiKey,
      polygonMumbai: secrets.polygonMumbaiApiKey,
      rinkeby: secrets.etherscanApiKey,
    }
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
};