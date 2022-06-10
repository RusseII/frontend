import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { RainbowKitProvider, Theme, darkTheme, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { merge } from 'lodash'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { WagmiConfig, chain, configureChains, createClient, etherscanBlockExplorers } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import { MobileBlocker } from './components/MobileBlocker'
import { isRinkeby } from './connectors'
import App from './pages/App'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import ThemeProvider from './theme'
import { GlobalStyle } from './theme/globalStyle'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'

const { chains, provider } = configureChains(
  [!isRinkeby ? chain.mainnet : chain.rinkeby, chain.hardhat],
  [alchemyProvider({ alchemyId: 'rD-tnwLLzbfOaFOBAv2ckazyJTmCRLhu' }), publicProvider()],
)

const { connectors } = getDefaultWallets({
  appName: 'Porter Finance',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [
    {
      chainId: chain.hardhat.id,
      chainName: chain.hardhat.name,
      nativeCurrency: {
        name: chain.rinkeby.nativeCurrency?.name,
        symbol: chain.rinkeby.nativeCurrency?.symbol,
        decimals: chain.rinkeby.nativeCurrency?.decimals,
      },
      rpcUrls: [chain.hardhat.rpcUrls.default],
      blockExplorerUrls: [etherscanBlockExplorers.rinkeby.url],
    },
  ],
})

const Updaters = () => {
  return (
    <>
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
    </>
  )
}

const container = document.getElementById('root')
const root = createRoot(container)

const apolloClient = new ApolloClient({
  uri: isRinkeby
    ? process.env.REACT_APP_SUBGRAPH_URL_RINKEBY
    : process.env.REACT_APP_SUBGRAPH_URL_MAINNET,
  connectToDevTools: true,
  cache: new InMemoryCache(),
})

const myTheme = merge(darkTheme(), {
  fonts: {
    body: 'Neue Haas Grotesk Display',
  },
  colors: {
    accentColor: '#e0e0e0',
    accentColorForeground: '#1e1e1e',
    connectButtonBackground: '#e0e0e0',
    connectButtonText: '#1e1e1e',
  },
} as Theme)

root.render(
  <>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} showRecentTransactions theme={myTheme}>
        <Provider store={store}>
          <ApolloProvider client={apolloClient}>
            <Updaters />
            <ThemeProvider>
              <GlobalStyle />
              <BrowserRouter>
                <div className="hidden sm:block">
                  <App />
                </div>
                <MobileBlocker />
              </BrowserRouter>
            </ThemeProvider>
          </ApolloProvider>
        </Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  </>,
)
