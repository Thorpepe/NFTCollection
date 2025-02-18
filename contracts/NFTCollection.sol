// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTCollection is ERC721, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_PRICE = 0.05 ether;
    uint256 public constant MAX_MINT_PER_TX = 10;

    string private _baseTokenURI;
    bool public saleActive = false;
    bool public presaleActive = false;

    mapping(address => bool) public presaleList;
    mapping(address => uint256) public presaleMinted;

    event MintSuccessful(address indexed to, uint256 indexed tokenId);
    event SaleStateChanged(bool isActive);
    event PresaleStateChanged(bool isActive);

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;
    }

    function mint(uint256 quantity) external payable {
        require(saleActive, "Sale not active");
        require(quantity > 0 && quantity <= MAX_MINT_PER_TX, "Invalid quantity");
        require(totalSupply() + quantity <= MAX_SUPPLY, "Exceeds max supply");
        require(msg.value >= MINT_PRICE * quantity, "Insufficient payment");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(msg.sender, tokenId);
            emit MintSuccessful(msg.sender, tokenId);
        }
    }

    function presaleMint(uint256 quantity) external payable {
        require(presaleActive, "Presale not active");
        require(presaleList[msg.sender], "Not on presale list");
        require(quantity > 0 && quantity <= MAX_MINT_PER_TX, "Invalid quantity");
        require(presaleMinted[msg.sender] + quantity <= MAX_MINT_PER_TX, "Exceeds presale limit");
        require(totalSupply() + quantity <= MAX_SUPPLY, "Exceeds max supply");
        require(msg.value >= MINT_PRICE * quantity, "Insufficient payment");

        presaleMinted[msg.sender] += quantity;

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(msg.sender, tokenId);
            emit MintSuccessful(msg.sender, tokenId);
        }
    }

    function ownerMint(address to, uint256 quantity) external onlyOwner {
        require(totalSupply() + quantity <= MAX_SUPPLY, "Exceeds max supply");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(to, tokenId);
            emit MintSuccessful(to, tokenId);
        }
    }

    function addToPresaleList(address[] calldata addresses) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            presaleList[addresses[i]] = true;
        }
    }

    function removeFromPresaleList(address[] calldata addresses) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            presaleList[addresses[i]] = false;
        }
    }

    function setSaleActive(bool _saleActive) external onlyOwner {
        saleActive = _saleActive;
        emit SaleStateChanged(_saleActive);
    }

    function setPresaleActive(bool _presaleActive) external onlyOwner {
        presaleActive = _presaleActive;
        emit PresaleStateChanged(_presaleActive);
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}