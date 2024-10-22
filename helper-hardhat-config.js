const networkConfig = {
  31337: {
    name: "localhost"
  },
  11155111: {
    name: "sepoila",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
  }
};

const developmentChain = ["hardhat", "localhost"];
module.exports = {
  networkConfig,
  developmentChain
};
