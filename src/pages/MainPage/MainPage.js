// import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useSelector } from "react-redux";

import "../../App.css";
import "./MainPage.css";
import PropertyCards from "./PropertyCards/PropertyCards";

// import { useMoralis, useWeb3Contract } from "react-moralis";
import console from "console-browserify";
import ConnectWallet from "../ConnectWallet/ConnectWallet";
// import { useNotification } from "web3uikit";

//----------------------------Contract Imports---------------------------------------//
import {
  adminABI,
  adminContractAddress,
} from "../../constants/Admin/adminConstants";
//----------------------------------------------------------------------------------//

function MainPage({ userTokenId }) {
  const properties = useSelector((state) => state.properties);

  // const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis();
  // const chainId = parseInt(chainIdHex);
  // const dispatch = useNotification();
  // const adminAddress =
  // chainId in adminContractAddress ? adminContractAddress[chainId][0] : null;

  //=============================Contract Functions==================================//
  //=================================================================================//

  //-------------------------------------UseEffects-------------------------------//

  // useEffect(() => {
  //   if (isWeb3Enabled) {
  //     updateUI();
  //   }
  // }, [isWeb3Enabled]);

  //--------------------------------------------------------------------------------//

  //************************************Functions**************************************//
  //**********************************************************************************//

  // console.log(userTokenId);
  // console.log(properties);

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
      {/* Property cards  */}
      <div className="listedProperties">
        {properties.map((propertyDetails) => {
          return (
            //Don't show property if already on rent
            propertyDetails.onRent === false ? (
              <PropertyCards
                property={propertyDetails}
                key={propertyDetails._id}
              />
            ) : (
              <></>
            )
          );
        })}
      </div>
    </div>
  );
}

export default MainPage;
