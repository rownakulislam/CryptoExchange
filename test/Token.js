//import ethers lib from hardhat lib
const { ethers } = require("hardhat");
const { expect } = require("chai");
const { result, mapKeys } = require("lodash");
//container to put te test
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};
describe("Token", () => {
  //tests go inside here
  //each perticular things to test of token use it
  let token, accounts, deployer, receiver, exchange;
  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token");

    token = await Token.deploy("Rownak", "Islam", 1000000);
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    receiver = accounts[1];
    exchange = accounts[2];
  });

  describe("Deployment", () => {
    const name = "Rownak";
    const symbol = "Islam";
    const totalSupply = 1000000;

    it("Has correct name", async () => {
      //fetch token from blochain with ethers

      //read the token

      //check the name is correct
      expect(await token.name()).to.equal(name);
    });
    it("Has correct symbol", async () => {
      //fetch token from blochain with ethers

      //read the token

      //check the name is correct
      expect(await token.symbol()).to.equal(symbol);
    });
    it("Has correct decimals", async () => {
      expect(await token.decimals()).to.equal(18);
    });
    it("Has correct totalSupply", async () => {
      expect(await token.totalSupply()).to.equal(tokens(totalSupply));
    });
    it("assigns total supply to the deployer", async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(
        tokens(totalSupply)
      );
    });
  });

  describe("Sending Tokens", () => {
    let amount, transaction, result;

    describe("Success", () => {
      beforeEach(async () => {
        amount = tokens(100);
        transaction = await token
          .connect(deployer)
          .transfer(receiver.address, amount);
        result = await transaction.wait();
      });
      it("Transfer token balances", async () => {
        //log balance before transfer

        //transfer tokens

        expect(await token.balanceOf(deployer.address)).to.equal(
          tokens(999900)
        );
        expect(await token.balanceOf(receiver.address)).to.equal(amount);
        //log balance after transfer

        //ensure that balance change
      });

      it("Emits a Transfer Event", async () => {
        const event = result.events[0];
        expect(event.event).to.equal("Transfer");

        const args = event.args;
        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(receiver.address);
        expect(args.value).to.equal(amount);
      });
    });

    describe("Failure", () => {
      it("Rejects insufficient balances", async () => {
        //transfer more tokens for the deployer
        const invalidAmount = tokens(100000000);
        await expect(
          token.connect(deployer).transfer(receiver.address, invalidAmount)
        ).to.be.reverted;
      });
      it("Rejects invalid recipient", async () => {
        const amount = tokens(100000000);
        await expect(
          token
            .connect(deployer)
            .transfer("0x0000000000000000000000000000000000000000", amount)
        ).to.be.reverted;
      });
    });
  });
  describe("Approving Tokens", () => {
    let amount, transaction, result;
    beforeEach(async () => {
      amount = tokens(100);
      transaction = await token
        .connect(deployer)
        .approve(exchange.address, amount);
      result = await transaction.wait();
    });
    describe("Success", () => {
      it("allocates allowance for delegated token spending", async () => {
        expect(
          await token.allowance(deployer.address, exchange.address)
        ).to.equal(amount);
      });

      it("Emits a approval event", async () => {
        const event = result.events[0];
        expect(event.event).to.equal("Approval");

        const args = event.args;
        expect(args.owner).to.equal(deployer.address);
        expect(args.spender).to.equal(exchange.address);
        expect(args.value).to.equal(amount);
      });
    });
    describe("Failure", () => {
      it("Reject invalid spenders", async () => {
        await expect(
          token
            .connect(deployer)
            .approve("0x0000000000000000000000000000000000000000", amount)
        ).to.be.reverted;
      });
    });
  });

  describe("Delegated token transfers", () => {
    let amount, transaction, result;
    beforeEach(async () => {
      amount = tokens(100);
      transaction = await token
        .connect(deployer)
        .approve(exchange.address, amount);
      result = await transaction.wait();
    });
    describe("Success", () => {
      beforeEach(async () => {
        transaction = await token
          .connect(exchange)
          .transferFrom(deployer.address, receiver.address, amount);
        result = await transaction.wait();
      });
      it("Transfer token balances", async () => {
        expect(await token.balanceOf(deployer.address)).to.be.equal(
          tokens(999900)
        );
        expect(await token.balanceOf(receiver.address)).to.be.equal(amount);
      });
      it("Resets the allowance", async () => {
        expect(
          await token.allowance(deployer.address, exchange.address)
        ).to.be.equal(0);
      });
      it("Emits a Transfer Event", async () => {
        const event = result.events[0];
        expect(event.event).to.equal("Transfer");

        const args = event.args;
        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(receiver.address);
        expect(args.value).to.equal(amount);
      });
    });
    describe("Failure", () => {
      //attempts to transfer too many tokens
      it("Reject invalid amount", async () => {
        const invalidAmount = tokens(100000000);
        await expect(
          token
            .connect(exchange)
            .transferFrom(deployer.address, receiver.address, invalidAmount)
        ).to.be.reverted;
      });
    });
  });

  //dofferent containers for describe, balance check, trasactions etc
});
//for testing not any hardhat node needs to be running
