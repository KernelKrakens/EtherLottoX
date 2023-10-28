const LotteryGame = artifacts.require("LotteryGame");

module.exports = function (deployer) {
  deployer.deploy(LotteryGame);
};
