import React from "react";

import { Notification } from "./components/ui/Notifications";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useContractKit } from "@celo-tools/use-contractkit";

import Navigation from "./container/Navigation/Navigation";
import Market from "./container/Market/Market";
import Cover from "./components/Cover";
import { useBalance, useGemContract } from "./hooks";
import coverImg from "./assets/img/gem_img.jpg";
import "./index.css";
import "./App.scss";

const App = function AppWrapper() {
  /*
    address : fetch the connected wallet address
    destroy: terminate connection to user wallet
    connect : connect to the celo blockchain
     */
  const { address, destroy, connect } = useContractKit();

  //  fetch user's celo balance using hook
  const { balance, getBalance } = useBalance();

  // initialize the NFT mint contract
  const gemContract = useGemContract();

  return (
    <div className="app__base">
      <Notification />
      {address ? (
        <>
          <Navigation />
          <Market updateBalance={getBalance} minterContract={gemContract} />
        </>
      ) : (
        //  if user wallet is not connected display cover page
        <Cover name="Gem Collection" coverImg={coverImg} connect={connect} />
      )}
    </div>
  );
};

export default App;
