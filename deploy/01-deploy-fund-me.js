const { networks } = require("../hardhat.config");
const { networkConfig } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments, getChainId, getUnnamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const networkName = hre.network.name;
  log("current networkName is " + networkName);
  log("current chainId is " + chainId);
  log("current deployer is " + deployer);

  let ethUsdPriceFeedAddress;
  if (chainId == 31337) {
    //这里可以通过部署的network寻找priceFeedAddress，但是如果部署在hardhat上怎么办呢？有先用test文件夹里的mock地址
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    //这里填写priceFeed 的地址，但是不能写死。地址应该和对应的chainid有关系，这里要用到aave。
    //aave里使用了helper-hardhat-config的组件，这个组建涵盖了所有的chain配置，配置了对应chain的所有相关数据。
    //在该项目中使用helper-hardhat-config文件作为读取配置的源头。
    log: true
  });
};
module.exports.tags = ["all", "fundMe"];
