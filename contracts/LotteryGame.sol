// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract LotteryGame is ERC721Enumerable {
    address public owner;
    uint256 public ticketPrice = 0.01 ether;
    bool public drawn = false;
    uint256 public gameRound = 1;
    mapping(address => uint256) public lastParticipatedRound;
    mapping(uint256 => uint256) public ticketToGameRound;
    mapping(uint256 => uint256[]) public gameRoundToTickets;
    address public lastWinner;
    uint256 public lastWinnerTicket;
    uint256 public lastWinnerPrize;

    constructor() ERC721("LotteryTicket", "LTK") {
        owner = msg.sender;
    }

    function buyTicket() external payable {
        require(!drawn, "Lottery is drawn");
        require(msg.value == ticketPrice, "Incorrect Ether sent");
        require(
            lastParticipatedRound[msg.sender] < gameRound,
            "You can only buy one ticket per round"
        );

        uint256 ticketId = totalSupply() + 1; // Adjusted .add to +
        ticketToGameRound[ticketId] = gameRound;
        gameRoundToTickets[gameRound].push(ticketId);
        _mint(msg.sender, ticketId);

        lastParticipatedRound[msg.sender] = gameRound;
    }

    function drawWinner() external {
        require(msg.sender == owner, "Only owner can draw");
        require(!drawn, "Already drawn");
        uint256[] memory ticketsForCurrentRound = gameRoundToTickets[gameRound];
        require(
            ticketsForCurrentRound.length > 0,
            "No tickets for current round"
        );

        uint256 randomIndex = random() % ticketsForCurrentRound.length;
        uint256 winnerTicket = ticketsForCurrentRound[randomIndex];
        address winner = ownerOf(winnerTicket);
        lastWinner = winner;
        lastWinnerTicket = winnerTicket;

        uint256 prizeForWinner = (address(this).balance * 90) / 100; // 90% for the winner
        uint256 prizeForOwner = address(this).balance - prizeForWinner; // 10% for the owner

        lastWinnerPrize = prizeForWinner;

        payable(winner).transfer(prizeForWinner); // Transfer 90% of the balance to the winner
        payable(owner).transfer(prizeForOwner); // Transfer 10% of the balance to the owner

        drawn = true;
    }

    function reopenLottery() external {
        require(msg.sender == owner, "Only owner can reopen");
        require(drawn == true, "Lottery is not drawn yet");

        gameRound++;
        drawn = false;
    }

    function getCurrentPoolBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getCurrentRoundTicket(address user)
        external
        view
        returns (uint256)
    {
        uint256 tokenCount = balanceOf(user);

        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            if (ticketToGameRound[tokenId] == gameRound) {
                return tokenId;
            }
        }

        revert("No ticket found for this round");
    }

    function random() private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.prevrandao,
                        block.timestamp,
                        msg.sender,
                        totalSupply()
                    )
                )
            );
    }

    function getWinner() external view returns (address) {
        return lastWinner;
    }

    function getWinnerTicket() external view returns (uint256) {
        return lastWinnerTicket;
    }

    function getWinnerPrize() external view returns (uint256) {
        return lastWinnerPrize;
    }
}
