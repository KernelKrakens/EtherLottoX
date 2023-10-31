import React, { useState, useEffect, useCallback } from "react";
import lottery from "./lottery";
import web3 from "./web3";

function App() {
  const [ticketPrice, setTicketPrice] = useState("");
  const [totalPoolBalance, setTotalPoolBalance] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [account, setAccount] = useState(null);
  const [owner, setOwner] = useState(); // [0, 1, 2, 3, 4
  const [round, setRound] = useState(1); // [0, 1, 2, 3, 4
  const [currentRoundTicketId, setCurrentRoundTicketId] = useState(null); // [0, 1, 2, 3, 4
  const [lastWinner, setLastWinner] = useState(null); // [0, 1, 2, 3, 4
  const [lastWinnerTicketId, setLastWinnerTicketId] = useState(null); // [0, 1, 2, 3, 4
  const [lastWinnerPrize, setLastWinnerPrize] = useState(null); // [0, 1, 2, 3, 4
  const [drawn, setDrawn] = useState(false); // [0, 1, 2, 3, 4
  const [networkCorrect, setNetworkCorrect] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function checkNetwork() {
    const networkIdBigInt = await web3.eth.getChainId();
    const networkId = Number(networkIdBigInt);
    console.log(networkId)
    const expectedNetworkId = 5; // Ganache default
    if (networkId !== expectedNetworkId) {
      setNetworkCorrect(false);
      return false;
    } else {
      setNetworkCorrect(true);
      return true;
    }
  }

  const fetchInfo = useCallback(async () => {
    try {
      const price = await lottery.methods.ticketPrice().call();
      const totalSupply = await lottery.methods.totalSupply().call();
      const totalPoolBalance = await lottery.methods
        .getCurrentPoolBalance()
        .call();
      const accounts = await web3.eth.getAccounts();
      const owner = await lottery.methods.owner().call();
      const round = await lottery.methods.gameRound().call();
      const lastWinner = await lottery.methods.getWinner().call();
      const lastWinnerTicketId = await lottery.methods.getWinnerTicket().call();
      const drawn = await lottery.methods.drawn().call();
      const lastWinnerPrize = await lottery.methods.getWinnerPrize().call();
      setLastWinnerPrize(web3.utils.fromWei(lastWinnerPrize, "ether"));
      setDrawn(drawn);
      setLastWinner(
        lastWinner === "0x0000000000000000000000000000000000000000"
          ? null
          : lastWinner,
      );
      setLastWinnerTicketId(
        lastWinnerTicketId === "0" ? null : lastWinnerTicketId,
      );
      setRound(round);
      setOwner(owner);
      setAccount(accounts[0]);
      setTotalPoolBalance(web3.utils.fromWei(totalPoolBalance, "ether"));
      setTotalSupply(totalSupply);
      setTicketPrice(web3.utils.fromWei(price, "ether"));
    } catch (error) {
      console.error(error);
      checkNetwork();
    }
  }, []);

  const fetchTicket = useCallback(async () => {
    if (!account) return;
    try {
      const currentRoundTicketId = await lottery.methods
        .getCurrentRoundTicket(account)
        .call();
      setCurrentRoundTicketId(currentRoundTicketId);
    } catch (error) {
      console.error(error);
    }
  }, [account]);

  async function buyTicket1() {
    // Clear any previous messages
    setMessage("");
    setError("");

    try {
      const price = await lottery.methods.ticketPrice().call();
      const accounts = await web3.eth.getAccounts();
      await lottery.methods.buyTicket().send({
        from: accounts[0],
        value: price,
      });
      fetchInfo();
      setMessage("Successfully purchased a ticket!");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  const drawWinner = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      await lottery.methods.drawWinner().send({
        from: accounts[0],
      });
      await fetchInfo();
      await fetchTicket();
    } catch (err) {
      console.error(err);
    }
  };

  const reopenGame = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      await lottery.methods.reopenLottery().send({
        from: accounts[0],
      });
      await fetchInfo();
      await fetchTicket();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkNetwork();
    fetchInfo();
  }, [fetchInfo]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return (
    <div
      style={{
        padding: 30,
        display: "flex",
        flexDirection: "column",
        alignItem: "center",
      }}
    >
      <h2>Lottery Game</h2>
      {networkCorrect ? (
        <>
          <p>Connected Account: {account}</p>
          <p>Contract Owner: {owner}</p>
          <br />
          <p>Current Round: {round}</p>
          <p>Drawn?: {String(drawn)}</p>
          <p>Price of a ticket: {ticketPrice} ETH</p>
          <p>Total Pool Balance: {totalPoolBalance} ETH</p>
          <p>Total Supply: {totalSupply}</p>
          <br />
          <p>Last Winner: {lastWinner || "none"}</p>
          <p>Last Winner Ticket ID: {lastWinnerTicketId || "none"}</p>
          <p>Last Winner Prize: {lastWinnerPrize} ETH</p>
          <br />
          <p>Your Current Round Ticket ID: {currentRoundTicketId || "none"}</p>
        </>
      ) : (
        <p>Please connect to the correct network!</p>
      )}
      <button
        style={{ width: 200, marginBottom: 20 }}
        disabled={currentRoundTicketId !== null}
        onClick={buyTicket1}
      >
        Buy Ticket
      </button>
      {owner === account && (
        <>
          <button
            disabled={drawn}
            onClick={drawWinner}
            style={{ width: 200, marginBottom: 20 }}
          >
            Draw Winner
          </button>
          <button
            disabled={!drawn}
            onClick={reopenGame}
            style={{ width: 200, marginBottom: 20 }}
          >
            Reopen Game{" "}
          </button>
        </>
      )}
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;
