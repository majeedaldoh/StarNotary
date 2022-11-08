// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {
    // Token name
    string internal name_;

    // Token symbol
    string internal symbol_;

    struct Star {
        string name;
    }

    /**
     * @dev Constructor function
     */
    constructor() {
        name_ = "Star Notary Service";
        symbol_ = "SN";
    }

    /**
     * @dev Gets the token name
     * @return string representing the token name
     */
    function name() override public view returns (string memory) {
        return name_;
    }

    /**
     * @dev Gets the token symbol
     * @return string representing the token symbol
     */
    function symbol() public override view returns (string memory) {
        return symbol_;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;
    mapping(uint256 => uint256) public starsForExchange;
    mapping(uint256 => address) public ownerForExchange;

    function createStar(string memory _name, uint256 _tokenId) public {
        Star memory newStar = Star(_name);

        tokenIdToStarInfo[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);
    }

    function lookUptokenIdToStarInfo(uint256 _tokenId) public view returns (string memory) {
        Star memory star = tokenIdToStarInfo[_tokenId];
        return star.name;
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address payable starOwner = payable(ownerOf(_tokenId));
        require(msg.value >= starCost);

        _transfer(starOwner,msg.sender, _tokenId);

        starOwner.transfer(starCost);

        if (msg.value > starCost) {
            payable(msg.sender).transfer(msg.value - starCost);
        }
        starsForSale[_tokenId] = 0;
    }

    function exchangeStars(uint256 _tokenIdSend, uint256 _tokenIdReceive) public {
        require(ownerOf(_tokenIdSend) == msg.sender);

        if (starsForExchange[_tokenIdReceive] == _tokenIdSend) {

            _transfer(msg.sender, ownerForExchange[_tokenIdReceive], _tokenIdSend);

            _transfer(ownerForExchange[_tokenIdReceive],msg.sender, _tokenIdReceive);

            starsForExchange[_tokenIdReceive] = 0;
            ownerForExchange[_tokenIdReceive] = address(0);

        } else {
            starsForExchange[_tokenIdSend] = _tokenIdReceive;
            ownerForExchange[_tokenIdSend] = msg.sender;
        }
    }

    function transferStar(uint256 _tokenId, address _toAddress) public {
        require(ownerOf(_tokenId) == msg.sender);
        _transfer(msg.sender,_toAddress, _tokenId);
    }
}