// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

import { Base64 } from "./libraries/Base64.sol";

/// @author Mark Torres
/// @title A simple first NFT Contract
contract NFTContract is ERC721URIStorage {
    
    /// store IDs
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    ///@dev generate random SVGs
    string baseSVG = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

    string[] firstWords = ["quadrigenarious", "alecost", "moya", "versicular", "articulate", "carnivorous", "deciduous", "tertiary", "elememntary", "quantum"];
    string[] secondWords = ["sorcerer", "scholar", "academic", "monk", "architect","dwarf", "marksmen", "assailant", "marquis", "swordsmith", "viscount"];
    string[] thirdWords = ["supreme", "overlord", "mage", "defender", "mercenary", "marksmen", "braveheart", "protector"];

    constructor() ERC721 ("SquareNFT", "SQUARE") {
        console.log("This is an NFT contract.");
    }

    function pickRandomWordFromList(uint tokenId, string[] memory wordArray) public pure returns (string memory) {
        uint256 rand = uint(keccak256(abi.encodePacked("WORD", Strings.toString(tokenId))));
        rand = rand % wordArray.length;
        return wordArray[rand];
    }


    /// @dev lets user get their NFT
    function makeNFT() public {
        uint256 newItemId = _tokenIds.current();
        
        // grab a word from each array above
        string memory firstWord = pickRandomWordFromList(newItemId, firstWords);
        string memory secondWord = pickRandomWordFromList(newItemId, secondWords);
        string memory thirdWord = pickRandomWordFromList(newItemId, thirdWords);

        string memory combinedWord = string(abi.encodePacked(firstWord, secondWord, thirdWord));

        // join with base SVG
        string memory fullSVG = string(abi.encodePacked(baseSVG, combinedWord, "</text></svg>"));

        console.log("\n--------------------");
        console.log(fullSVG);
        console.log("--------------------\n");

        // Get all the JSON metadata in place and base64 encode it.
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        // We set the title of our NFT as the generated word.
                        combinedWord,
                        '", "description": "A highly acclaimed collection of squares.", "image": "data:image/svg+xml;base64,',
                        // We add data:image/svg+xml;base64 and then append our base64 encode our svg.
                        Base64.encode(bytes(fullSVG)),
                        '"}'
                    )
                )
            )
        );

        string memory finalTokenURI = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        /// @dev actually mint the NFT to the sender.
        _safeMint(msg.sender, newItemId);

        /// @dev set the NFTs data.
        _setTokenURI(newItemId, finalTokenURI);

        console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);

        /// @dev increment counter for when the next NFT is minted.
        _tokenIds.increment();
    }
}