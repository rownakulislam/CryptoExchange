const { ethers } = require("hardhat");

async function main() {
    //do stuff ....
    //fetch contract
    const Token =await ethers.getContractFactory("Token")
    //deploy
    const token= await Token.deploy()
    await token.deployed()
    console.log(`Token deployed to: ${token.address}`)
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
