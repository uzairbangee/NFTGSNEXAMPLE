import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useEffect, useState, useRef } from "react";
import React from "react";
import Header from "../components/Header";
import {useEagerConnect, useInactiveListener} from "../web3-config";
import { RelayProvider } from "@opengsn/provider";

declare global {
  interface Window {
      ethereum: any;
      web3: any;
  }
}

const conf = {
	ourContract: '0xD290EE36F05A984a41f7ACc72BD57461D33bfC6d',
	paymaster:   '0xfc408628f5559da33fc7a0927521b9c4a41f2d8c',
	gasPrice:  20000000000   // 20 Gwei
}


const usdc = {
  address: "0xD290EE36F05A984a41f7ACc72BD57461D33bfC6d",
  abi: [ { "inputs": [ { "internalType": "address[]", "name": "customers", "type": "address[]" }, { "internalType": "uint32[]", "name": "tokenCounts", "type": "uint32[]" } ], "name": "addToWhitelist", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "baseurl", "type": "string" }, { "internalType": "uint32", "name": "cap", "type": "uint32" }, { "internalType": "string", "name": "placeHolder", "type": "string" }, { "internalType": "address", "name": "_trustedForwarder", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "approved", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" } ], "name": "ApprovalForAll", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint32", "name": "count", "type": "uint32" } ], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "reveal", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [], "name": "Revealed", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "bytes", "name": "_data", "type": "bytes" } ], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" } ], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "baseURI_", "type": "string" } ], "name": "setBaseURI", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_placeholder", "type": "string" } ], "name": "setPlaceholder", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "customer", "type": "address" }, { "indexed": false, "internalType": "uint32", "name": "tokenCount", "type": "uint32" } ], "name": "Whitelisted", "type": "event" }, { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "getApproved", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_owner", "type": "address" }, { "internalType": "address", "name": "_operator", "type": "address" } ], "name": "isApprovedForAll", "outputs": [ { "internalType": "bool", "name": "isOperator", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "isRevealed", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "forwarder", "type": "address" } ], "name": "isTrustedForwarder", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "customer", "type": "address" } ], "name": "isWhitelisted", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "ownerOf", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "startingIndex", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "supplyCap", "outputs": [ { "internalType": "uint32", "name": "", "type": "uint32" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" } ], "name": "supportsInterface", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "tokenURI", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "trustedForwarder", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "versionRecipient", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" } ]
};

const init = async () => {
  const relayProvider: any = await RelayProvider.newProvider(
    {
      provider: window?.web3.currentProvider,
      config: {
              paymasterAddress: "0xfA13b5fA7185b00286D638091883B49EA3736Ea8",
              relayLookupWindowBlocks: 600000,
              // relayHubAddress:  "0x6646cD15d33cE3a6933e36de38990121e8ba2806",
              // chainId: '80001',
              // verbose: true
              }
    }
    ).init()

    const provider: any = new ethers.providers.Web3Provider(relayProvider, "any");
    return provider;
}

export const getBase64 = (file: any) =>
  new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          resolve(reader.result);
      };
      reader.onerror = (error) => reject(error);
});

function utf8_to_b64( str: any ) {
  return typeof window !== 'undefined' && window.btoa(unescape(encodeURIComponent( str )));
}

function b64_to_utf8( str: string ) {
  return typeof window !== 'undefined' && decodeURIComponent(escape(window.atob( str )));
}

function Home() {

  const [errorMessage, setErrorMessage] = useState();
  const [loading, setLoading] = useState(false);

  useEagerConnect(setErrorMessage);
  useInactiveListener();

  const {
    account,
    chainId,
    library
  } = useWeb3React();


  const mintUsdc = async () => {
    setLoading(true);
      const provider = await init();
      console.log("provider ", provider)
      // await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      // let userAddress = await signer.getAddress();
      // console.log("signer ", signer)
      const usdcContract = new ethers.Contract(usdc.address, usdc.abi, signer);
      const tx = await usdcContract.mint(1);
      console.log(`Transaction hash: ${tx.hash}`);
  
      const receipt = await tx.wait();
      console.log("RECEIPT ", receipt);
      // setTokenURI(parseInt(receipt.logs[0].topics[3], 16));
      // console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
      // console.log(`Gas used: ${receipt.gasUsed.toString()}`);

    // }
    setLoading(false);
  }

  const [balance, setBalance] = useState<any>();

  useEffect(()=>{
    (async ()=>{
      if(library && account){
        try {
          const _balance = await library.getBalance(account);
          setBalance(ethers.utils.formatEther(_balance));
        }
        catch(error: any){
          console.log("Error ",error.message);
          setBalance("0");
        }
        return () => {
          setBalance(undefined);
        };
      }
    })();
  }, [library, account, chainId]);

  return (
    <div>
      {
        errorMessage? <div style={{color:"red"}}>{errorMessage}</div>: null
      }
      <Header />
      <div>NFT MARKETPLACE</div><br/>
      <div>Chain Id: {chainId}</div><br/>
      <div>Account: {account}</div><br/>
      <div>Balance: {balance}</div>
          <br/>
          <button onClick={mintUsdc}>{loading ? "Pending": "MINT"}</button>
    </div>
  );
}

export default Home;
