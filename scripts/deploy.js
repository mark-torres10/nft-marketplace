const createAndDeployContract = async() => {
    /**
     * Load contract from contracts and deploy.
    */
    const nftContractFactory = await hre.ethers.getContractFactory("NFTContract");
    const nftContract = await nftContractFactory.deploy();
    await nftContract.deployed();
    console.log(`Contract deployed to: ${nftContract.address}`);
    return nftContract;
}

const mintNFT = async(contract) => {
    /**
     * Mints an NFT based on the deployed contract passed in.
     * @param {contract} contract - deployed NFT contract to mint.
     */

    let txn = await contract.makeNFT();
    await txn.wait();
}

const main = async() => {
    const nftContract = await createAndDeployContract();
    await mintNFT(nftContract);
    console.log(`NFT minted at ${nftContract.address}`);
}

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

runMain();