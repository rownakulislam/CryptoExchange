import { useEffect } from 'react';
import { ethers } from 'ethers';
import config from '../config.json'
import TOKEN_ABI from '../abis/Token.json'
import { useDispatch } from 'react-redux';
import { loadProvider,loadNetwork ,loadAccount,loadToken} from '../store/interactions';

function App() {
  //load accounts of metamask 
  const dispatch=useDispatch()
  const loadBlockChainData=async () =>{
    const account=await loadAccount(dispatch)
    console.log(account)
    //connect ethers to blockchain
    //ethers in client-app is different from testing in hardhat-ethers
    //to connect to etherum metamask we need a provider 
    const provider =loadProvider(dispatch)
    //show the network using destructuring
    const chainId=await loadNetwork(provider,dispatch)
    console.log(chainId)
    //token smart contract
    //2 parameters address of the contract deployed, abi, provider/signer
    await loadToken(provider,config[chainId].Dapp.address,dispatch)

    
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