import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../App.css";
import "./MainPage.css";
import { useMoralis, useWeb3Contract } from "react-moralis";
import console from "console-browserify";
import ConnectWallet from "../ConnectWallet/ConnectWallet";
import { useNotification } from "web3uikit";

import {
  adminABI,
  adminContractAddress,
} from "../../constants/Admin/adminConstants";

function MainPage({ userTokenId }) {
  const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const dispatch = useNotification();
  const adminAddress =
    chainId in adminContractAddress ? adminContractAddress[chainId][0] : null;

  //Contract Functions

  //UseEffects

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  //Functions

  const updateUI = async () => {};

  console.log(userTokenId);

  return (
    <div className="fullbox">
      <nav>
        <div>
          <ConnectWallet />
          <Link to="/profile">Profile</Link>
          <Link to="/profile">Properties Owned</Link>
        </div>
      </nav>
      <div className="mainContainer">
        <section className="mainSection">
          <h1>hi you are ready to sign in</h1>
          <button>
            <Link to="/addProperty">Add Property</Link>
          </button>
        </section>
      </div>
    </div>
  );
}

export default MainPage;
