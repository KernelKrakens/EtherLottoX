const LotteryGame = artifacts.require("LotteryGame");

contract("LotteryGame", (accounts) => {
  let lotteryGame;

  // This will run before each test to deploy a fresh contract
  beforeEach(async () => {
    lotteryGame = await LotteryGame.new();
  });

  it("should allow a user to buy a ticket", async () => {
    await lotteryGame.buyTicket({
      from: accounts[1],
      value: web3.utils.toWei("0.01", "ether"),
    });
    const ownerOfTicket = await lotteryGame.ownerOf(1);
    assert.equal(ownerOfTicket, accounts[1], "Ticket owner is not correct");
  });

  // You can add more tests below...
});
