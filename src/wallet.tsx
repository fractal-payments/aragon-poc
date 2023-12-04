import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import {
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { Buffer } from "buffer";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { mainnet, polygon } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";

window.global = window.global ?? window;
window.Buffer = window.Buffer ?? Buffer;
window.process = window.process ?? { env: {} }; // Minimal process polyfill

const { chains, publicClient } = configureChains(
  [mainnet, polygon],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: `https://polygon-rpc.com`,
      }),
    }),
  ]
);

const projectId = "57b80f6e777de0e0e7c3151f48c1a318";

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      // @ts-ignore
      walletConnectWallet({ projectId, chains }),
      // @ts-ignore
      metaMaskWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

// @ts-ignore
export const WalletConfig = ({ children }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={darkTheme({
          accentColor: "#4f46e5",
          accentColorForeground: "#ffffff",
        })}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
