import React, { useEffect, useState } from "react";
import "../../App.css";
import "./Home.css";
import { useMoralis, useWeb3Contract } from "react-moralis";
import console from "console-browserify";
import ConnectWallet from "../ConnectWallet/ConnectWallet";
import { useNotification } from "web3uikit";
import MainPage from "../MainPage/MainPage";

import {
  adminABI,
  adminContractAddress,
} from "../../constants/Admin/adminConstants";

function Home() {
  const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const dispatch = useNotification();
  const adminAddress =
    chainId in adminContractAddress ? adminContractAddress[chainId][0] : null;

  const [entryTokenId, setEntryTokenId] = useState("-1");
  const [disableSignup, setDisableSignup] = useState(false);
  const [userAccount, setUserAccount] = useState("");

  //Contract Functions

  const { runContractFunction: getTokenId } = useWeb3Contract({
    abi: adminABI,
    contractAddress: adminAddress,
    functionName: "getTokenId",
    params: {
      _userAddress: userAccount,
    },
  });

  const {
    runContractFunction: registerUser,
    isFetching,
    isLoading,
  } = useWeb3Contract({
    abi: adminABI,
    contractAddress: adminAddress,
    functionName: "registerUser",
    params: {},
  });

  //UseEffects

  useEffect(() => {
    if (isWeb3Enabled) {
      console.log("first useEffect");
      if (account !== "" || account !== null) {
        setUserAccount(account);
        console.log(account);
      }
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    window.ethereum.on("accountsChanged", function (accounts) {
      console.log("change in account");
      getAccount();
    });
  }, []);

  useEffect(() => {
    if (isWeb3Enabled) {
      if (userAccount !== "" || userAccount !== null) {
        console.log("change in account, calling update ui");
        updateUI();
      }
    }
  }, [userAccount]);

  //Functions

  const updateUI = async () => {
    const tempEntryTokenID = await getTokenId({
      onError: (error) => console.log(error),
    });
    setEntryTokenId(tempEntryTokenID.toString());
  };

  const getAccount = async () => {
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    setUserAccount(account);
  };

  const handleEntryTokenMint = async () => {
    await registerUser({
      onError: handleErrorNotification,
      onSuccess: handleSuccess,
      onComplete: () => setDisableSignup(false),
    });
    updateUI();
  };

  const handleErrorNotification = function (tx) {
    dispatch({
      type: "error",
      message: "Signup Unsuccessfull",
      title: "Error Occured",
      position: "topR",
      icon: "info",
    });
  };

  const handleSuccess = async function (tx) {
    await tx.wait(1);
    handleNotification(tx);
    updateUI();
  };

  const handleNotification = function (tx) {
    dispatch({
      type: "success",
      message: "Sign Up Successful",
      title: "Account Created",
      position: "topR",
      icon: "checkmark",
    });
  };

  return (
    <div className="fullbox">
      {entryTokenId !== "0" ? (
        <MainPage userTokenId={entryTokenId} />
      ) : (
        <div>
          <nav>
            <ConnectWallet />
          </nav>
          <div className="homeContainer">
            <section
              className="home"
              style={{ backgroundColor: "rgb(0,0,0,0.75)", borderRadius: "2%" }}
            >
              {entryTokenId === "-1" ? (
                <h1>Wait</h1>
              ) : (
                <div>
                  <h1>You don't have an account</h1>
                  <button
                    disabled={disableSignup === true}
                    onClick={async () => {
                      setDisableSignup(true);
                      handleEntryTokenMint();
                    }}
                  >
                    Mint
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
