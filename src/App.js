import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import NFTContract from './utils/NFTContract.json';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x925Bf916Bb018dBaf6beD4e15eF63c5650ecc842";

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async() => {
    /*
    Checks to see if Metamask wallet is connected.
    If we're logged in to Metamask, it will automatically inject a special
    object named ethereum into our window.
    */
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }


    /*
    Access user's wallet
    */
    const accounts = await ethereum.request({ method: "eth_accounts" });

    /*
    * User can have multiple authorized accounts, we grab the first one if its there!
    */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)

      // set up listener when user already was on website and already have wallet connected + authorized.
      setupEventListener()
    } else {
      console.log("No authorized account found")
    }

  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please connect using MetaMask!");
        return;
      }


      /* Request access to account */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // set up listener when user comes to the site and connects for the first time. 
      setupEventListener()
    } catch(err) {
      console.log(`Error with connecting to wallet: ${err}`);
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        // connect to contract
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, NFTContract.abi, signer);

        // use webhook event to capture status of NFT minting.
        connectedContract.on("NewNFTMinted", (from, tokenId) => {
          console.log(`From: ${from}, tokenId: ${tokenId.toNumber()}`);
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        })

        console.log("Finished with setting up event listener");

      } else {
        console.log("Ethereum object does not exist. Please connect wallet");
      }
    } catch (err) {
      console.log(`Unable to set up event listener: ${err}`);
    }
  }

  const askContractToMintNft = async () => {
    /*
    Connect to existing contract and ask to mint NFT
    */

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        // connect to contract
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, NFTContract.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (err) {
      console.log(`Unable to mint NFT: ${err}`);
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => {
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Mint your first NFTs!</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;