const { ethers } = require("hardhat");

async function main() {
  console.log(`Preparing deployment....\n`)
    //do stuff ....
    //fetch contract
    const Token =await ethers.getContractFactory("Token")
    const Exchange=await ethers.getContractFactory("Exchange")

    //fetch accounts
    const accounts=await ethers.getSigners()

    console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n}`)
    //deploy
    const dapp= await Token.deploy("Dapp University","DAPP","1000000")
    await dapp.deployed()
    console.log(`DAPP deployed to: ${dapp.address}`)

    const mETH= await Token.deploy('mETH','mETH',"1000000")
    await dapp.deployed()
    console.log(`mETH deployed to: ${mETH.address}`)

    const mDAI= await Token.deploy('mDAI','mDAI',"1000000")
    await mDAI.deployed()
    console.log(`mDAI deployed to: ${mDAI.address}`)

    const exchange=await Exchange.deploy(accounts[1].address,10)
    await exchange.deployed()
    console.log(`Exchange Deployed to: ${exchange.address}`)
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
