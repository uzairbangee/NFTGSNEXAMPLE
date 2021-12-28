import { Web3Provider } from '@ethersproject/providers';
import { InjectedConnector } from "@web3-react/injected-connector";
import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';

declare global {
    interface Window {
        ethereum: any;
    }
}

//this will give instance of library we want ether.js or web3.js i prefer use ether.js
export const getLibrary = (provider: any) => {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

export const metaMask = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 80001]
});

export const connectWallet = async(activate,errorMessageCallback)=>{
    
  await activate(metaMask, async (error) => {
      console.log({ error });
      errorMessageCallback(error.message);
  });
}



export const useEagerConnect = (setErrorMessageFun)=>{
    const {activate} = useWeb3React();
    
    useEffect(()=>{
        (async ()=>{
            const isAuthorized = await metaMask.isAuthorized();
            console.log("isAuthorized= ",isAuthorized);
            if(isAuthorized) {
                await activate(metaMask, async (error) => {
                    console.log({ error });
                    setErrorMessageFun(error.message);
                });
            }
        })();
    },[activate,setErrorMessageFun])
}

export const useInactiveListener = (suppress = false) =>{
    const { active, error, activate } = useWeb3React();

    useEffect(() => {
        const { ethereum } = window;
        if (ethereum && ethereum.on && !active && !error && !suppress) {
            const handleChainChanged = (chainId) => {
                console.log('chainChanged', chainId);
                activate(metaMask);
            };

            const handleAccountsChanged = (accounts) => {
                console.log('accountsChanged', accounts);
                if (accounts.length > 0) {
                    activate(metaMask);
                }
            };

            const handleNetworkChanged = (networkId) => {
                console.log('networkChanged', networkId);
                activate(metaMask);
            };

            ethereum.on('chainChanged', handleChainChanged);
            ethereum.on('accountsChanged', handleAccountsChanged);
            ethereum.on('networkChanged', handleNetworkChanged);

            return () => {
                if (ethereum.removeListener) {
                ethereum.removeListener('chainChanged', handleChainChanged);
                ethereum.removeListener('accountsChanged', handleAccountsChanged);
                ethereum.removeListener('networkChanged', handleNetworkChanged);
                }
            };
        }
        return () => {};
    }, [active, error, suppress, activate]);
}