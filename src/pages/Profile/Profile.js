import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../App.css";
import "./Profile.css";
import { useMoralis, useWeb3Contract } from "react-moralis";
import console from "console-browserify";
import ConnectWallet from "../ConnectWallet/ConnectWallet";
import { useNotification } from "web3uikit";

import { useDispatch, useSelector } from "react-redux";
import { checkStatus } from "../../api";

//----------------------------Contract Imports---------------------------------------//
import {
  adminABI,
  adminContractAddress,
} from "../../constants/Admin/adminConstants";
import axios from "axios";
import PropertyDetail from "../PropertyDetail/PropertyDetail";
import { getProperty } from "../../actions/property";
import { getDealingUsingURI } from "../../actions/activedealing";
import MainPage from "../MainPage/MainPage";
import Dealings from "../Dealings/Dealings";
import OwnerManagement from "../OwnerManagement/OwnerManagement";

//----------------------------------------------------------------------------------//

//to reuse this component. setting userAccount parameter default to null. then check if 'account' is transfered to it as parameter( in case of landlorad checking user profile, then show tenant profile ) else if no parameter given (in case of checking own profile, use account from web3 as userAccount)
function Profile() {
  const location = useLocation();

  const dispatchToServer = useDispatch();

  const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const dispatch = useNotification();
  const adminAddress =
    chainId in adminContractAddress ? adminContractAddress[chainId][0] : null;

  const [entryTokenId, setEntryTokenId] = useState("0");
  const [profileURI, setProfileURI] = useState("");
  const [profileData, setProfileData] = useState("");
  const [profileAccount, setProfileAccount] = useState("");

  //=====================================Contract Functions=================================//

  const { runContractFunction: getTokenId } = useWeb3Contract({
    abi: adminABI,
    contractAddress: adminAddress,
    functionName: "getTokenId",
    params: {
      _userAddress: profileAccount,
    },
  });

  const { runContractFunction: tokenURI } = useWeb3Contract({
    abi: adminABI,
    contractAddress: adminAddress,
    functionName: "tokenURI",
    params: {
      tokenId: entryTokenId,
    },
  });

  //===================================================================================//

  //----------------------------------------UseEffects---------------------------------//

  useEffect(() => {
    if (isWeb3Enabled) {
      if (location.state != null) {
        const { userAccount } = location.state;
        setProfileAccount(userAccount);
      } else {
        setProfileAccount(account);
      }
      // updateTokenID();
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    if (profileAccount !== "") {
      updateTokenID();
    }
  }, [profileAccount]);

  useEffect(() => {
    if (entryTokenId !== "0") {
      updateUI();
    }
  }, [entryTokenId]);

  //-------------------------------------------------------------------------------//

  //***********************************Functions********************************//

  const handleCheckStatus = async (propertyIPFS) => {
    //check if on rent -> if on rent, find in active proeprty(go to dealings) , if not, send not on rent message
    const propertyHash = propertyIPFS.split("ipfs/").pop();
    const property = await checkStatus(propertyHash);
    const rentStatus = property.data.onRent;
    if (rentStatus) {
      //Go to dealin
      dispatchToServer(getDealingUsingURI(propertyHash));
      <Dealings />;
    } else {
      alert("not on rent");
    }
  };

  const updateUI = async () => {
    console.log(entryTokenId);
    const tempTokenURI = await tokenURI({
      onError: (error) => console.log(error),
    });
    console.log(tempTokenURI);
    setProfileURI(tempTokenURI.toString());
    const { data } = await axios.get(`${tempTokenURI}`);
    const { attributes, image } = data;
    const tempObj = {
      image: image,
      reputation: attributes.reputation,
      dealTokens: attributes.dealTokens,
      propertiesOwned: attributes.propertiesOwned,
    };
    setProfileData(tempObj);
  };

  const updateTokenID = async () => {
    const tempEntryTokenID = await getTokenId({
      onError: (error) => console.log(error),
    });
    setEntryTokenId(tempEntryTokenID.toString());
  };

  //************************************************************************//

  return (
    <div className="fullbox">
      <nav>
        <div>
          <ConnectWallet />
          <Link to="/">Back To Main Page</Link>
        </div>
      </nav>
      <div className="mainContainer">
        <section className="mainSection">
          {profileData == undefined || profileData == "" ? (
            <h1>Loading</h1>
          ) : (
            <div>
              <h1>This is profile</h1>
              <img src={profileData.image} alt="Entry Token Image" />
              <h3>Reputation : {profileData.reputation}</h3>
              {profileData.dealTokens.map((oneDealToken) => {
                return (
                  <Link to="/dealTokenData" state={{ details: oneDealToken }}>
                    {oneDealToken}
                  </Link>
                );
              })}
              {profileData.propertiesOwned.map((oneHash) => {
                return (
                  <div>
                    <Link to="/ownerManagement" state={{ details: oneHash }}>
                      {oneHash}
                    </Link>
                    {/* <button
                      onClick={() => {
                        handleCheckStatus(one);
                      }}
                    >
                      Check Status
                    </button> */}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Profile;
