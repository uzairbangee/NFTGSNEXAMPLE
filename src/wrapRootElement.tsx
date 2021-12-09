import React from "react";
import { Provider } from 'react-redux';
import { Web3ReactProvider } from '@web3-react/core';
import { getLibrary } from './web3-config';

export default ({ element }: any) => {

    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            {element}
        </Web3ReactProvider>
    );
}