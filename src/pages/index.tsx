import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useEffect, useState, useRef } from "react";
import React from "react";
import Header from "../components/Header";
import {useEagerConnect, useInactiveListener} from "../web3-config";

const usdc = {
  address: "0x444553cF655D7337b36ab7ED5947fE635c2621A3",
  abi: [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"tokenUri","type":"string"}],"name":"createCollectible","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"}]
};

const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

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
  return window && window.btoa(unescape(encodeURIComponent( str )));
}

function b64_to_utf8( str: string ) {
  return window && decodeURIComponent(escape(window.atob( str )));
}

function Home() {

  const [errorMessage, setErrorMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<any>("");
  const [image, setImage] = useState<any>();
  const [tokenURI, setTokenURI] = useState<any>();
  const [tokenURINEW, setTokenURINEW] = useState<any>();

  const inputFileCover = useRef<any>(null);

  useEagerConnect(setErrorMessage);
  useInactiveListener();

  const {
    connector,
    library,
    account,
    chainId,
    activate,
    deactivate,
    active,
    error
  } = useWeb3React();


  const mintUsdc = async () => {
    setLoading(true);
    const node = document.querySelector("svg");
    if(name && node){
      const s = new XMLSerializer().serializeToString(node);
      const encodedData = window && window.btoa(s);
      console.log("encodedData", encodedData)
      const data = {
        name,
        image: "data:image/svg+xml;base64,"+encodedData
      }
      const dt = utf8_to_b64(JSON.stringify(data));
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      let userAddress = await signer.getAddress();
      const usdcContract = new ethers.Contract(usdc.address, usdc.abi, signer);
      const tx = await usdcContract.createCollectible(dt);
      console.log(`Transaction hash: ${tx.hash}`);
  
      const receipt = await tx.wait();
      console.log("RECEIPT ", receipt.logs[0].topics[3]);
      setTokenURI(parseInt(receipt.logs[0].topics[3], 16));
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);

    }
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

  const handleChangeName = (e: any) => {
    setName(e.target.value);
  }

  const onChangeImage = async (e: any) => {
    if(e?.target && e?.target.files){
      const img = await getBase64(e?.target?.files[0]);
      setImage(img)
    }
  }

  const getURI = async () => {
    if(tokenURI){
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      let userAddress = await signer.getAddress();
      const usdcContract = new ethers.Contract(usdc.address, usdc.abi, signer);
      console.log("contract ", usdcContract)
      const tx = await usdcContract.tokenURI(tokenURI);
      console.log(`Transaction hash: ${tx}`);
      setTokenURINEW(tx);
    }
  }

  const handleChangeTokenURI = (e) => {
    setTokenURI(e.target.value);
  }
  

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

      <div>
          <div>
            <br/>
            <label>Name :</label>
            <input type="text" id="name" name="name" value={name} onChange={(e) => handleChangeName(e)}/>
          </div>
          <br/>
          <div>
            <div style={{width: "300px", height: "300px"}}>
              <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 500 500"><rect x="0" y="0" width="500" height="500" style={{fill:"#dda"}}/><rect width="300" height="120" x="99" y="400" style={{fill:"#110"}}/><circle cx="190" cy="470" r="5" style={{fill:"#fc5"}}/><circle cx="310" cy="470" r="5" style={{fill:"#fc5"}}/><circle cx="100" cy="250" r="50" style={{fill:"#110"}}/><circle cx="100" cy="250" r="20" style={{fill:"#fc5"}}/><circle cx="400" cy="250" r="50" style={{fill:"#110"}}/><circle cx="400" cy="250" r="20" style={{fill:"#fc5"}}/><circle cx="250" cy="250" r="150" style={{fill:"#110"}}/><circle cx="250" cy="250" r="120" style={{fill:"#fc5"}}/><circle cx="200" cy="215" r="35" style={{fill:"#fff"}}/><circle cx="305" cy="222" r="31" style={{fill:"#fff"}}/><circle cx="200" cy="220" r="20" style={{fill:"#abe"}}/><circle cx="300" cy="220" r="20" style={{fill:"#abe"}}/><circle cx="200" cy="220" r="7" style={{fill:"#000"}}/><circle cx="300" cy="220" r="7" style={{fill:"#000"}}/><ellipse cx="250" cy="315" rx="84" ry="34" style={{fill:"#653"}}/><rect x="195" y="330" width="110" height="3" style={{fill:"#000"}}/><circle cx="268" cy="295" r="5" style={{fill:"#000"}}/><circle cx="232" cy="295" r="5" style={{fill:"#000"}}/><rect width="300" height="120" x="99" y="400" style={{fill:"#f00"}}/><rect width="50" height="55" x="280" y="430" style={{fill:"#ddd"}}/></svg>
            </div>
            {/* {
              image
              ?
                <img style={{width: "300px", height: "300px", borderRadius: "10px", objectFit: "contain"}} src={image} onClick={() => inputFileCover && inputFileCover?.current.click()}/>
              :
              <div style={{width: "300px", height: "300px", backgroundColor: "GrayText", borderRadius: "10px"}} onClick={() => inputFileCover && inputFileCover?.current.click()}></div>
            } */}
          <input type="file" ref={inputFileCover} id="image" name="image" accept="image/png, image/jpeg" onChange={(e) => onChangeImage(e)} style={{display: "none"}}/>
          </div>
          <br/>
          <button onClick={mintUsdc}>{loading ? "Pending": "MINT"}</button>
      </div>
      <div>
        <br/>
        <br/>
        CURRENT TOKEN ID: {tokenURI && tokenURI}
            <br/>
            <br/>
            <input type="text" id="tokenURI" name="tokenURI" value={tokenURI} onChange={(e) => handleChangeTokenURI(e)}/>

        <button onClick={getURI}>GET TOKEN URI</button>
            <br/>
            <br />
        TOKEN URI:
        <div style={{maxWidth: "500px"}}>
            {tokenURINEW && tokenURINEW}
        </div>
      </div>
    </div>
  );
}

export default Home;
