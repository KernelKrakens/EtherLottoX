const LotteryGame = artifacts.require("LotteryGame");

contract("LotteryGame", (accounts) => {
  let lotteryGame;
  const owner = accounts[0];
  const player1 = accounts[1];
  const ticketPrice = web3.utils.toWei("0.01", "ether");

  beforeEach(async () => {
    lotteryGame = await LotteryGame.new();
  });

  it("should deploy the contract and set the owner", async () => {
    const contractOwner = await lotteryGame.owner();
    assert.equal(contractOwner, owner, "Owner is not set correctly");
  });

  it("should allow players to buy a ticket", async () => {
    await lotteryGame.buyTicket({ from: player1, value: ticketPrice });
    const player1TicketCount = await lotteryGame.balanceOf(player1);
    assert.equal(
      player1TicketCount.toString(),
      "1",
      "Player1 should have 1 ticket",
    );
  });

  it("doesn't allow a user to buy more than one ticket per round", async () => {
    await lotteryGame.buyTicket({
      from: player1,
      value: web3.utils.toWei("0.01", "ether"),
    });
    try {
      await lotteryGame.buyTicket({
        from: player1,
        value: web3.utils.toWei("0.01", "ether"),
      });
      assert.fail("Expected revert not received");
    } catch (error) {
      const revertFound = error.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${error.message} instead`);
    }
  });

  it("allows a user to buy a ticket in the next round after draw", async () => {
    await lotteryGame.buyTicket({
      from: player1,
      value: web3.utils.toWei("0.01", "ether"),
    });
    // Drawing the winner
    await lotteryGame.drawWinner({ from: owner });
    await lotteryGame.reopenLottery({ from: owner });

    // Trying to buy a ticket for the next round
    await lotteryGame.buyTicket({
      from: player1,
      value: web3.utils.toWei("0.01", "ether"),
    });
    const player1TicketCount = await lotteryGame.balanceOf(player1);
    assert.equal(
      player1TicketCount.toString(),
      "2",
      "Player1 should have 1 ticket for the new round",
    );
  });

  it("test ccurrent pool amount", async () => {
    await lotteryGame.buyTicket({
      from: player1,
      value: web3.utils.toWei("0.01", "ether"),
    });
    const poolAmount = await lotteryGame.getCurrentPoolBalance();
    assert.equal(
      poolAmount.toString(),
      web3.utils.toWei("0.01", "ether"),
      "Pool amount is not correct",
    );
  });

  it("test draw winner", async () => {
    await lotteryGame.buyTicket({
      from: player1,
      value: web3.utils.toWei("0.01", "ether"),
    });
    const poolAmount = await lotteryGame.getCurrentPoolBalance();
    const player1Ticket = await lotteryGame.getCurrentRoundTicket(player1);

    await lotteryGame.drawWinner({ from: owner });

    const winner = await lotteryGame.getWinner();
    const winnerTicket = await lotteryGame.getWinnerTicket();
    const winnerPrize = await lotteryGame.getWinnerPrize();
    assert.equal(winner, player1, "Winner is not correct");
    assert.equal(
      player1Ticket.toString(),
      winnerTicket.toString(),
      "Winner ticket is not correct",
    );
    assert.equal(
      ((poolAmount * 90) / 100).toString(),
      winnerPrize.toString(),
      "Winner prize is not correct",
    );
  });
});
