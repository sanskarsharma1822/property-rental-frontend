import React, { useEffect, useState } from "react";
import "../../App.css";
import "./Home.css";
import { useMoralis, useWeb3Contract } from "react-moralis";
import console from "console-browserify";
import ConnectWallet from "../ConnectWallet/ConnectWallet";
import { useNotification } from "web3uikit";
import MainPage from "../MainPage/MainPage";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Row from "react-bootstrap/Row";

import signupPage from "../../images/signupPage.jpg";
import tick from "../../images/tick.png";

//----------------------------Contract Imports---------------------------------------//

import {
  adminABI,
  adminContractAddress,
} from "../../constants/Admin/adminConstants";
import { Button, Col } from "react-bootstrap";

//----------------------------------------------------------------------------------//

function Home() {
  const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const dispatch = useNotification();
  const adminAddress =
    chainId in adminContractAddress ? adminContractAddress[chainId][0] : null;

  const [entryTokenId, setEntryTokenId] = useState("-1");
  const [disableSignup, setDisableSignup] = useState(false);
  const [userAccount, setUserAccount] = useState("");

  //============================Contract Functions==================================//

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

  //=============================================================================//

  //-----------------------------------UseEffects----------------------------------//

  useEffect(() => {
    if (isWeb3Enabled) {
      console.log("first useEffect");
      if (account !== "" || account !== "null") {
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
      if (userAccount) {
        console.log("change in account, calling update ui");
        console.log(userAccount);
        console.log(adminAddress);
        updateUI();
      }
    }
  }, [userAccount]);

  //--------------------------------------------------------------------------------//

  //********************************Functions**************************************//

  const updateUI = async () => {
    const tempEntryTokenID = await getTokenId({
      onError: (error) => console.log(error),
    });
    setEntryTokenId(tempEntryTokenID.toString());
  };

  const getAccount = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
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

  //**************************************************************************//
  return (
    <div>
      {entryTokenId !== "0" && entryTokenId !== "-1" ? (
        <MainPage userTokenId={entryTokenId} />
      ) : (
        <div style={{ height: "100%" }}>
          {entryTokenId === "-1" ? (
            <div className="signUpSpinnerDiv">
              <Navbar
                expand="lg"
                style={{ backgroundColor: "#f5f5f5", paddingTop: "2em" }}
              >
                <Container fluid>
                  <Navbar.Toggle aria-controls="navbarScroll" />
                  <Navbar.Collapse
                    id="navbarScroll"
                    className="d-flex flex-row-reverse"
                  >
                    <Nav>
                      <ConnectWallet />
                    </Nav>
                  </Navbar.Collapse>
                </Container>
              </Navbar>
              <div id="signUpLoadingContainer">
                <svg viewBox="0 0 100 100">
                  <defs>
                    <filter id="shadow">
                      <feDropShadow
                        dx="0"
                        dy="0"
                        stdDeviation="1.5"
                        flood-color="#80b0b0"
                      />
                    </filter>
                  </defs>
                  <circle
                    id="spinner"
                    style={{
                      fill: "transparent",
                      stroke: "#507D7D",
                      strokeWidth: "7px",
                      strokeLinecap: "round",
                      filter: "url(#shadow)",
                    }}
                    cx="50"
                    cy="50"
                    r="45"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <div className="signUpMainDiv">
              <Container fluid>
                <Navbar expand="lg" className="homeNavbar">
                  <Container fluid>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse
                      id="navbarScroll"
                      className="d-flex flex-row-reverse"
                    >
                      <Nav>
                        <ConnectWallet />
                      </Nav>
                    </Navbar.Collapse>
                  </Container>
                </Navbar>
                <Row>
                  <Col xs={12} md={8} className="signUpText">
                    <h1 className="signUpHeading">
                      Renting Made <br></br>More Secure
                    </h1>
                    <div className="signUpBullets">
                      <div style={{ marginTop: "1em" }}>
                        <div style={{ margin: "0.5em 0" }}>
                          <img src={tick} style={{ marginRight: "0.5em" }} />{" "}
                          Reliable Reviews
                        </div>
                      </div>
                      <div>
                        <div style={{ margin: "0.5em 0" }}>
                          <img src={tick} style={{ marginRight: "0.5em" }} />{" "}
                          Secure Community
                        </div>
                      </div>
                      <div>
                        <div style={{ margin: "0.5em 0" }}>
                          <img src={tick} style={{ marginRight: "0.5em" }} />{" "}
                          Easy Renting
                        </div>
                      </div>
                      <div className="signUpButtonDiv">
                        <Button
                          variant="light"
                          size="lg"
                          className="signUpButton"
                          disabled={disableSignup === true}
                          onClick={async () => {
                            setDisableSignup(true);
                            handleEntryTokenMint();
                          }}
                        >
                          Mint
                        </Button>
                        <Button
                          variant="outline-light"
                          size="lg"
                          className="signUpButton"
                        >
                          Know More
                        </Button>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <img
                      src={signupPage}
                      alt="Sign Up Image"
                      className="signUpImage"
                    />
                  </Col>
                </Row>
              </Container>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
