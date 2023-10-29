import React, { useState, useEffect, useCallback } from "react";
import lottery from "./lottery";
import web3 from "./web3";

function App() {
  const [ticketPrice, setTicketPrice] = useState("");
  const [networkCorrect, setNetworkCorrect] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function checkNetwork() {
    const networkIdBigInt = await web3.eth.getChainId();
    const networkId = Number(networkIdBigInt);
    const expectedNetworkId = 1337; // Ganache default
    if (networkId !== expectedNetworkId) {
      setNetworkCorrect(false);
      return false;
    } else {
      setNetworkCorrect(true);
      return true;
    }
  }

  const fetchTicketPrice = useCallback(async () => {
    try {
      const price = await lottery.methods.ticketPrice().call();
      const totalSupply = await lottery.methods.totalSupply().call();
      const totalPoolBalance = await lottery.methods
        .getCurrentPoolBalance()
        .call();
      console.log("totalPoolBalance", totalPoolBalance);
      console.log("totalSupply", totalSupply);
      setTicketPrice(web3.utils.fromWei(price, "ether"));
    } catch (error) {
      console.error(error);
      checkNetwork();
    }
  }, []);

  async function buyTicket1() {
    // Clear any previous messages
    setMessage("");
    setError("");

    try {
      const price = await lottery.methods.ticketPrice().call();
      const accounts = await web3.eth.getAccounts();
      console.log(accounts)
      const res = await lottery.methods.buyTicket().send({
        from: accounts[0],
        value: price,
      });
      console.log(res, "res");

      setMessage("Successfully purchased a ticket!");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  useEffect(() => {
    checkNetwork();
    fetchTicketPrice();
  }, [fetchTicketPrice]);

  return (
    <div>
      <h2>Lottery Game</h2>
      {networkCorrect ? (
        <p>Price of a ticket: {ticketPrice} ETH</p>
      ) : (
        <p>Please connect to the correct network!</p>
      )}
      <button onClick={buyTicket1}>Buy Ticket</button>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;
