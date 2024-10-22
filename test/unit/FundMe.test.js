const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const hre = require("hardhat");

describe("FundMe", async function () {
  let fundMe;
  let fundMe1;
  let deployer;
  let mockV3Aggregator;
  let mockV3Aggregator1;

  const sendValue = "1000000000000000000"; //1 ETH

  //先部署合约
  beforeEach(async function () {
    // const [owner] = await ethers.getSigners();

    // const mockV3Aggregator1 = await ethers.deployContract("MockV3Aggregator");

    // const { deployer } = await getNamedAccounts();
    // hre.ethers.deployContract();
    await deployments.fixture(["all"]);
    const { tokenOwner } = await getNamedAccounts();
    deployer = (await getNamedAccounts()).deployer;

    //用hardhat-deploy部署合约
    //fixture可以直接使用deploy文件夹内的js文件，将合约部署到对应的网络
    // const accounts = await ethers.getSigners();
    // mockV3Aggregator1 = await ethers.getContract("MockV3Aggregator", deployer);
    mockV3Aggregator1 = await ethers.getContract("MockV3Aggregator", tokenOwner);

    // mockV3Aggregator1 = ethers.getContractFactory("MockV3Aggregator", deployer);
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await deployments.get("MockV3Aggregator");
    console.log("mockV3Aggregator1 " + mockV3Aggregator1.target);
    console.log("mockV3Aggregator " + mockV3Aggregator.address);

    // fundMe1 = await deployments.get("FundMe");
    fundMe1 = await ethers.getContract("FundMe", tokenOwner);

    console.log("typeof mockV3Aggregator is " + mockV3Aggregator.constructor);
    console.log("typeof mockV3Aggregator1 is " + mockV3Aggregator1.constructor);
  });

  //test constructor
  describe("constructor", async function () {
    it("sets aggegator address correctly", async function () {
      const response = await fundMe.getPriceFeed();
      console.log("response address is " + response);
      console.log("fundMe is " + fundMe.address);

      console.log("fundMe1 is " + fundMe1._priceFeedAddress);
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  //test fund
  describe("fund", async function () {
    it("You need to spend more ETH!", async function () {
      //直接调用fund测试时，会直接抛出异常，但这个是正常需要测试的场景，这个时候需要借助waffle
      //chai框架已经内嵌waffle
      await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
    });
    // const sendValue = ethers.utils.parseEther("1"); //1 ETH

    it("updated the amount funded data structure", async function () {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.getAddressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });

    it("Adds funder to array of funders", async function () {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.getFunder(0);
      assert.equal(funder, deployer);
    });
  });

  //test withdraw
  describe("withdraw", async function () {
    //先向地址发送val
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue });
    });

    it("Withdraw ETH from a single founder", async function () {
      // const bal = ethers.provider.getBalance(fundMe.target);
      //现有的balance
      const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target);
      const startingDeployerBalance = await ethers.provider.getBalance(deployer);

      //deployer提现
      const tranReponse = await fundMe.withdraw();
      const receipt = await tranReponse.wait(1);

      const { gasUsed, gasPrice } = receipt;
      const gasCost = BigInt(gasUsed) * BigInt(gasPrice);

      const endingFundMeBalance = await ethers.provider.getBalance(fundMe.target);
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);

      //fundMe全部提现 所以为0
      assert.equal(endingFundMeBalance, 0);
      //deployer后面的钱 + gas = deployer前面的钱+fundMe的钱
      assert.equal((BigInt(startingFundMeBalance) + BigInt(startingDeployerBalance)).toString(), (BigInt(gasCost) + BigInt(endingDeployerBalance)).toString());
    });
  });

  //test cheaperWithDraw
  describe("cheaperWithDraw", async function () {
    //先向地址发送val
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue });
    });

    it("CheaperWithDraw ETH from a single founder", async function () {
      // const bal = ethers.provider.getBalance(fundMe.target);
      //现有的balance
      const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target);
      const startingDeployerBalance = await ethers.provider.getBalance(deployer);

      //deployer提现
      const tranReponse = await fundMe.cheaperWithDraw();
      const receipt = await tranReponse.wait(1);

      const { gasUsed, gasPrice } = receipt;
      const gasCost = BigInt(gasUsed) * BigInt(gasPrice);

      const endingFundMeBalance = await ethers.provider.getBalance(fundMe.target);
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);

      //fundMe全部提现 所以为0
      assert.equal(endingFundMeBalance, 0);
      //deployer后面的钱 + gas = deployer前面的钱+fundMe的钱
      assert.equal((BigInt(startingFundMeBalance) + BigInt(startingDeployerBalance)).toString(), (BigInt(gasCost) + BigInt(endingDeployerBalance)).toString());
    });
  });
});
