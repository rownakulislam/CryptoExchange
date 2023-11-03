import { useEffect } from 'react';
import { ethers } from 'ethers';
import config from '../config.json'
import TOKEN_ABI from '../abis/Token.json'
import '../App.css';

function App() {
  //load accounts of metamask 
  const loadBlockChainData=async () =>{
    const accounts=await window.ethereum.request({method:'eth_requestAccounts'})
    console.log(accounts[0])
    //connect ethers to blockchain
    //ethers in client-app is different from testing in hardhat-ethers
    //to connect to etherum metamask we need a provider 
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    //show the network using destructuring
    const {chainId}=await provider.getNetwork()
    console.log(chainId)
    //token smart contract
    //2 parameters address of the contract deployed, abi, provider/signer
    const token =new ethers.Contract(config[chainId].Dapp.address,TOKEN_ABI,provider)
    console.log(token.address) 
    const symbol=await token.symbol()
    console.log(symbol)
  } 
  //hook effect to fetch and display the data whenever the data is updated
  useEffect(()=>{
    loadBlockChainData()
  })
  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;