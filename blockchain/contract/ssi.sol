// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ssi_contract is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("IdentityToken", "ITKN") {}

    struct TokenDetails {
        string tokenURI;
        address owner;
    }

    mapping(uint256 => TokenDetails) private tokenDetails;
    mapping(address => uint256[]) private tokensByOwner;

    function mint(address useraddress, string memory tokenURI)
        public
        returns (uint256)
    {
        uint256 newItemId = _tokenIds.current();
        _mint(useraddress, newItemId);
        _setTokenURI(newItemId, tokenURI);

        tokenDetails[newItemId] = TokenDetails({
            tokenURI: tokenURI,
            owner: useraddress
        });

        tokensByOwner[useraddress].push(newItemId);

        _tokenIds.increment();
        return newItemId;
    }

    // Override the safeTransferFrom function to also make it revert
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) onlyOwner {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "Not approved or not owner"
        );
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == from, "Owner does not match");

        // Transfer the NFT to the specified address
        _transfer(from, to, tokenId);

        // Update the token owner in tokenDetails mapping
        tokenDetails[tokenId].owner = to;
    }

    // Override the transferFrom function and add onlyOwner modifier
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) onlyOwner {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "Not approved or not owner"
        );
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == from, "Owner does not match");

        _transfer(from, to, tokenId);

        // Update the token owner in tokenDetails mapping
        tokenDetails[tokenId].owner = to;
    }

    function getTokenDetails(address owner, uint256 tokenId)
        public
        view
        returns (string memory tokenURI, address tokenOwner)
    {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == owner, "Owner does not match");

        TokenDetails storage details = tokenDetails[tokenId];
        return (details.tokenURI, details.owner);
    }

    function getTokensByOwner(address owner)
        public
        view
        returns (TokenDetails[] memory)
    {
        uint256[] storage tokenIds = tokensByOwner[owner];
        TokenDetails[] memory result = new TokenDetails[](tokenIds.length);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            result[i] = tokenDetails[tokenId];
        }

        return result;
    }
}
