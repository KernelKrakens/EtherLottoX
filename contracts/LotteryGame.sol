// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract LotteryGame is ERC721Enumerable {
    address public owner;
    uint256 public ticketPrice = 0.01 ether;
    uint256 public drawTime;
    bool public drawn = false;

    constructor() ERC721("LotteryTicket", "LTK") {
        owner = msg.sender;
        drawTime = block.timestamp + 1 days; // Adjusted .add to +
    }

    function buyTicket() external payable {
        require(msg.value == ticketPrice, "Incorrect Ether sent");
        require(block.timestamp < drawTime, "Draw time passed");

        uint256 ticketId = totalSupply() + 1; // Adjusted .add to +
        _mint(msg.sender, ticketId);
    }

    function drawWinner() external {
        require(msg.sender == owner, "Only owner can draw");
        require(block.timestamp >= drawTime, "Too early to draw");
        require(!drawn, "Already drawn");

        uint256 winnerTicket = random() % totalSupply();
        address winner = ownerOf(winnerTicket);
        payable(winner).transfer(address(this).balance);

        drawn = true;
    }

    function random() private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        blockhash(block.number - 1),
                        block.timestamp,
                        totalSupply()
                    )
                )
            );
    }
}
