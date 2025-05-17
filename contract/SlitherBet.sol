// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SlitherBet is Ownable {
    struct Player {
        address playerAddress;
        string nickname;
        uint256 score;
        bool hasSubmittedScore;
    }

    struct Event {
        uint256 id;
        uint256 startTime;
        uint256 duration;
        uint256 prizePool;
        address creator;
        bool isActive;
        bool isPrizeClaimed;
        address winner;
        uint256 highestScore;
    }

    uint256 public eventCount;
    uint256 public constant ENTRY_FEE = 0.001 ether;
    
    mapping(uint256 => Event) public events;
    mapping(uint256 => mapping(address => Player)) public eventPlayers;
    mapping(uint256 => address[]) public eventPlayerAddresses;

    event EventCreated(uint256 eventId, address creator);
    event PlayerJoined(uint256 eventId, address player, string nickname);
    event ScoreSubmitted(uint256 eventId, address player, uint256 score);
    event EventClosed(uint256 eventId, address winner);

    constructor() Ownable(msg.sender) {}

    function createEvent(uint256 _duration) external {
        eventCount++;
        events[eventCount] = Event({
            id: eventCount,
            startTime: block.timestamp,
            duration: _duration,
            prizePool: 0,
            creator: msg.sender,
            isActive: true,
            isPrizeClaimed: false,
            winner: address(0),
            highestScore: 0
        });

        emit EventCreated(eventCount, msg.sender);
    }

    function joinEvent(uint256 _eventId, string memory _nickname) external payable {
        require(events[_eventId].isActive, "Event is not active");
        require(block.timestamp < events[_eventId].startTime + events[_eventId].duration, "Event has ended");
        require(msg.value == ENTRY_FEE, "Entry fee is 0.001 ETH");
        require(eventPlayers[_eventId][msg.sender].playerAddress == address(0), "Player already joined");

        eventPlayers[_eventId][msg.sender] = Player({
            playerAddress: msg.sender,
            nickname: _nickname,
            score: 0,
            hasSubmittedScore: false
        });

        eventPlayerAddresses[_eventId].push(msg.sender);
        events[_eventId].prizePool += msg.value;

        emit PlayerJoined(_eventId, msg.sender, _nickname);
    }

    function submitScore(uint256 _eventId, uint256 _score) external {
        require(events[_eventId].isActive, "Event is not active");
        require(eventPlayers[_eventId][msg.sender].playerAddress != address(0), "Player not registered");
        require(!eventPlayers[_eventId][msg.sender].hasSubmittedScore, "Score already submitted");

        eventPlayers[_eventId][msg.sender].score = _score;
        eventPlayers[_eventId][msg.sender].hasSubmittedScore = true;

        if (_score > events[_eventId].highestScore) {
            events[_eventId].highestScore = _score;
            events[_eventId].winner = msg.sender;
        }

        emit ScoreSubmitted(_eventId, msg.sender, _score);
    }

    function closeEvent(uint256 _eventId) external {
        require(events[_eventId].isActive, "Event is not active");
        require(
            msg.sender == events[_eventId].creator || msg.sender == owner(),
            "Only creator or owner can close the event"
        );
        require(
            block.timestamp >= events[_eventId].startTime + events[_eventId].duration,
            "Event duration not finished"
        );

        events[_eventId].isActive = false;

        if (events[_eventId].winner != address(0) && !events[_eventId].isPrizeClaimed) {
            events[_eventId].isPrizeClaimed = true;
            payable(events[_eventId].winner).transfer(events[_eventId].prizePool);
        }

        emit EventClosed(_eventId, events[_eventId].winner);
    }

    function getEventDetails(uint256 _eventId) external view returns (
        uint256 id,
        uint256 startTime,
        uint256 duration,
        uint256 prizePool,
        address creator,
        bool isActive,
        bool isPrizeClaimed,
        address winner,
        uint256 highestScore
    ) {
        Event storage e = events[_eventId];
        return (
            e.id,
            e.startTime,
            e.duration,
            e.prizePool,
            e.creator,
            e.isActive,
            e.isPrizeClaimed,
            e.winner,
            e.highestScore
        );
    }

    function getPlayerCount(uint256 _eventId) external view returns (uint256) {
        return eventPlayerAddresses[_eventId].length;
    }

    function getPlayerDetails(uint256 _eventId, address _player) external view returns (
        address playerAddress,
        string memory nickname,
        uint256 score,
        bool hasSubmittedScore
    ) {
        Player storage p = eventPlayers[_eventId][_player];
        return (
            p.playerAddress,
            p.nickname,
            p.score,
            p.hasSubmittedScore
        );
    }

    function getEventPlayers(uint256 _eventId) external view returns (address[] memory) {
        return eventPlayerAddresses[_eventId];
    }

    function getTimeRemaining(uint256 _eventId) external view returns (uint256) {
        Event storage e = events[_eventId];
        if (!e.isActive) return 0;
        
        uint256 endTime = e.startTime + e.duration;
        if (block.timestamp >= endTime) return 0;
        
        return endTime - block.timestamp;
    }
}