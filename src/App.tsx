import React from "react";
import logo from "./logo.svg";
import "@rainbow-me/rainbowkit/styles.css";
import "./App.css";
import { WalletConfig } from "./wallet";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  WithdrawParams,
  MultisigClient,
  ProposalCreationSteps,
  CreateMultisigProposalParams,
  Client,
} from "@aragon/sdk-client";
import { Context } from "@aragon/sdk-client-common";
import { useNetwork, useWalletClient } from "wagmi";
import { providers, utils } from "ethers";
import { TokenType } from "@aragon/sdk-client-common";

const createTestProposal = async (signer: any, provider: any) => {
  // const data =
  //   "0xfbd56e4100000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006574a2b00000000000000000000000000000000000000000000000000000000000000035697066733a2f2f516d64546e5a475a734431796e48774a74476333626669594259797237424b674e395473643745586d724a4e53340000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa84174000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb0000000000000000000000004bab3904c07933f190eb9d8ffd17214ad703147f000000000000000000000000000000000000000000000000000000000000271000000000000000000000000000000000000000000000000000000000";

  // const object = utils.defaultAbiCoder.decode(
  //   ["uint256", "address[]", "address", "uint256"],
  //   utils.hexDataSlice(data, 4)
  // );

  // console.log(object[0].toNumber());
  // console.log(object[1].toString());
  // console.log(object[2]);
  // console.log(object[3].toString());

  const minimalContext = new Context({
    signer: signer,
  });

  const client = new Client(minimalContext);
  const multisigClient = new MultisigClient(minimalContext);

  // aragonClient, multisigAragonClient;
  const metadataUri = await multisigClient.methods.pinMetadata({
    title: "Illia",
    summary: "Illia",
    description: "Illia",
    resources: [],
  });

  const withdrawParams: WithdrawParams = {
    type: TokenType.ERC20,
    amount: BigInt(1000000), // amount in wei
    tokenAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC Contract
    recipientAddressOrEns: "0x4baB3904C07933F190Eb9d8ffd17214aD703147f", // My Metamask Wallet
  };
  //
  const withdrawAction = await client.encoding.withdrawAction(withdrawParams);

  const proposalParams: CreateMultisigProposalParams = {
    pluginAddress: "0x641a0ac16dc258bf25826602271d24a284c22825", // Our Aragon Multisig plugin contract
    metadataUri,
    actions: [withdrawAction],
  };

  const steps = multisigClient.methods.createProposal(proposalParams);

  for await (const step of steps) {
    try {
      switch (step.key) {
        case ProposalCreationSteps.CREATING:
          console.log({ txHash: step.txHash });
          break;
        case ProposalCreationSteps.DONE:
          console.log({ proposalId: step.proposalId });
          break;
      }
    } catch (err) {
      console.error(err);
    }
  }
};

const AppInner = () => {
  const { chain } = useNetwork();
  const { data: walletClient } = useWalletClient({ chainId: chain?.id });
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <button
          className="App-link"
          onClick={() => {
            // @ts-ignore
            const { account, chain, transport } = walletClient;
            const network = {
              chainId: chain.id,
              name: chain.name,
              ensAddress: chain.contracts?.ensRegistry?.address,
            };
            const provider = new providers.Web3Provider(transport, network);
            const signer = provider.getSigner(account.address);
            createTestProposal(signer, provider).catch((err) => {
              console.log(err);
            });
          }}
          rel="noopener noreferrer"
        >
          Learn React
        </button>
        <ConnectButton />
      </header>
    </div>
  );
};

function App() {
  return (
    <WalletConfig>
      <AppInner />
    </WalletConfig>
  );
}

export default App;
