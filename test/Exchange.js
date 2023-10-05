//import ethers lib from hardhat lib
const { ethers } = require("hardhat");
const { expect } = require("chai");
const { result, mapKeys } = require("lodash");
//container to put te test
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};
describe("Exchange", () => {
  let deployer, feeAccount, exchange;
  const feePercent=10;
  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory("Exchange");
    const Token = await ethers.getContractFactory("Token");
    token1=await Token.deploy("Rownak","Islam",'1000000')
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    feeAccount = accounts[1];
    user1=accounts[2]

    let transaction=await token1.connect(deployer).transfer(user1.address,tokens(100))
    await transaction.wait()
    exchange = await Exchange.deploy(feeAccount.address,feePercent);
  });

  describe("Deployment", () => {
    it("tracks the fee account", async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address);
    });
    it("tracks the fee percent", async () => {
        expect(await exchange.feePercent()).to.equal(feePercent);
    });
  });

  describe("Depositing tokens",()=>{
    let transaction,result
    let amount=tokens(100)
    
    describe("Success",()=>{
      beforeEach(async()=>{
        //aprove tokens
        
        transaction=await token1.connect(user1).approve(exchange.address,amount)
        result=await transaction.wait()
        //deposite tokens
        transaction=await exchange.connect(user1).depositeTokens(token1.address,amount)
        result=await transaction.wait()
      })
      it("tracks token deposite",async()=>{

        expect(await token1.balanceOf(exchange.address)).to.equal(amount)
        expect(await exchange.tokens(token1.address,user1.address)).to.equal(amount)
        expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(amount)
      })

      it("emits a Deposit Event", async () => {
        const event = result.events[1];
        expect(event.event).to.equal("Deposit");

        const args = event.args;
        expect(args.token).to.equal(token1.address);
        expect(args.user).to.equal(user1.address);
        expect(args.amount).to.equal(amount);
        expect(args.balance).to.equal(amount);
      });
      
    })
    describe("Failure",()=>{
      it("fails when no tokens are approved",async ()=>{
        expect(exchange.connect(user1).depositeTokens(token1.address,amount)).to.be.reverted

      })
    })
  })

  describe("Withdrawing tokens",()=>{
    let transaction,result
    let amount=tokens(100)
    
    describe("Success",()=>{
      beforeEach(async()=>{
        //deposit token before withdrawing
        //aprove tokens
        
        transaction=await token1.connect(user1).approve(exchange.address,amount)
        result=await transaction.wait()
        //deposite tokens
        transaction=await exchange.connect(user1).depositeTokens(token1.address,amount)
        result=await transaction.wait()
        //withdraw
        transaction=await exchange.connect(user1).withdrawToken(token1.address,amount)
        result=await transaction.wait()
      })
      it("withdraws token funds",async()=>{

        expect(await token1.balanceOf(exchange.address)).to.equal(0)
        expect(await exchange.tokens(token1.address,user1.address)).to.equal(0)
        expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(0)
      })

      it("emits a Withdraw Event", async () => {
        const event = result.events[1];
        expect(event.event).to.equal("Withdraw");

        const args = event.args;
        expect(args.token).to.equal(token1.address);
        expect(args.user).to.equal(user1.address);
        expect(args.amount).to.equal(amount);
        expect(args.balance).to.equal(0);
      });
      
    })
    describe("Failure",()=>{
      it("fails for insufficient balance",async ()=>{
        //attempt to withdraw tokens without depositing 
        expect(exchange.connect(user1).withdrawToken(token1.address,amount)).to.be.reverted

      })
  })
  
  })
  describe("Checking",()=>{
    let transaction,result
    let amount=tokens(100)
    beforeEach(async()=>{
      //aprove tokens
      
      transaction=await token1.connect(user1).approve(exchange.address,amount)
      result=await transaction.wait()
      //deposite tokens
      transaction=await exchange.connect(user1).depositeTokens(token1.address,amount)
      result=await transaction.wait()
    })
    
    it("returns user balance",async()=>{
      expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(amount)
    })
  })
});
