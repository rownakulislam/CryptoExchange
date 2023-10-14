// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const config=require('../src/config.json')
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};
//wait for certain amount of seconds
const wait =(seconds)=>{
  const milliseconds=seconds*1000
  return new Promise(resolve => setTimeout(resolve,milliseconds))
}
async function main() {
   //setup users
    //give tokens to acocunt[1]
    accounts=await ethers.getSigners()
    const sender=accounts[0]
    const receiver=accounts[1]
    let amount =tokens(10000)
    await wait(1)
    console.log(`sender : ${sender.address}, receiver : ${receiver.address}`)

    const { chainId } =await hre.ethers.provider.getNetwork()
    console.log("using chainId:", chainId) 


    //fetch tokens
    const Dapp=await hre.ethers.getContractAt("Token",config[chainId].Dapp.address)
    console.log(`Token fetched : ${Dapp.address}`)

    const mETH=await hre.ethers.getContractAt("Token",config[chainId].mETH.address)
    console.log(`mETH fetched : ${mETH.address}\n`)

    const mDAI=await hre.ethers.getContractAt("Token",config[chainId].mDAI.address)
    console.log(`mDAI fetched : ${mDAI.address}\n`)

    const exchange=await hre.ethers.getContractAt("Exchange",config[chainId].exchange.address)
    console.log(`exchange fetched : ${exchange.address}\n`)
    
    
    //user1 transfers 10000 meth
    let transaction,result
    transaction=await mETH.connect(sender).transfer(receiver.address,amount)
    await wait(1)
    console.log(`Transfered ${amount} from ${sender.address} to ${receiver.address} \n`)

    //set exchange users
    const user1=accounts[0]
    const user2=accounts[1]
    amount=tokens(10000)
    

    //user1 approves 10000 Dapp..
    transaction=await Dapp.connect(user1).approve(exchange.address,amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user1.address} \n`)

    //user1 deposits 10000 dapp..
    transaction=await exchange.connect(user1).depositeTokens(Dapp.address,amount)
    await transaction.wait()
    console.log(`Deposited ${amount} tokens from ${user1.address} \n`)
    
    //user2 approves mETH
    transaction=await mETH.connect(user2).approve(exchange.address,amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user2.address} \n`)
    
    //user2 deposits mETH
    transaction=await exchange.connect(user2).depositeTokens(mETH.address,amount)
    await transaction.wait()
    console.log(`Deposited ${amount} tokens from ${user2.address} \n`)
    
    //cancel orders
    //user1 makes order to get tokens
    let orderID
    transaction=await exchange.connect(user1).makeOrder(mETH.address,tokens(100),Dapp.address,tokens(5))
    result=await transaction.wait()
    console.log(`Make order from ${user1.address}`)

    //user1 cancel order
    orderID=result.events[0].args.id
    transaction=await exchange.connect(user1).cancelOrder(orderID)
    result=await transaction.wait()
    console.log(`Cancelled order from ${user1.address}`)
    
    await wait(1)
    
    //fill orders

    //user1 makes order to get tokens
    transaction=await exchange.connect(user1).makeOrder(mETH.address,tokens(100),Dapp.address,tokens(10))
    result=await transaction.wait()
    console.log(`Make order from ${user1.address}`)
    
    //user2 fills order
    orderID=result.events[0].args.id
    transaction=await exchange.connect(user2).fillOrders(orderID)
    result=await transaction.wait()
    console.log(`Filled order from ${user1.address}`)

    await wait(1)

    //user1 makes anoher order to get tokens
    transaction=await exchange.connect(user1).makeOrder(mETH.address,tokens(50),Dapp.address,tokens(15))
    result=await transaction.wait()
    console.log(`Make order from ${user1.address}`)

    //user2 fills order
    orderID=result.events[0].args.id
    transaction=await exchange.connect(user2).fillOrders(orderID)
    result=await transaction.wait()
    console.log(`Filled order from ${user1.address}`)

    await wait(1)

    //user1 makes final order to get tokens
    transaction=await exchange.connect(user1).makeOrder(mETH.address,tokens(200),Dapp.address,tokens(20))
    result=await transaction.wait()
    console.log(`Make order from ${user1.address}`)

    //user2 fills order
    orderID=result.events[0].args.id
    transaction=await exchange.connect(user2).fillOrders(orderID)
    result=await transaction.wait()
    console.log(`Filled order from ${user1.address}`)

    await wait(1)

    //seed open orders
    //user1  makes 10 orders

    for (let i=1;i<=10;i++){
      transaction=await exchange.connect(user1).makeOrder(mETH.address,tokens(10*i),Dapp.address,tokens(10))
      result=await transaction.wait()
      console.log(`make order from  address : ${user1.address}`)
      await wait(1)
    }


    //user2  makes 10 orders

    for (let i=1;i<=10;i++){
      transaction=await exchange.connect(user2).makeOrder(Dapp.address,tokens(10),mETH.address,tokens(10*i))
      result=await transaction.wait()
      console.log(`make order from  address : ${user2.address}`)
      await wait(1)
    }


    
    








}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
 