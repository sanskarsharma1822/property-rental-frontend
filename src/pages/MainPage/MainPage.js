// import React, { useEffect, useState } from "react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useSelector } from "react-redux";

import "../../App.css";
import "./MainPage.css";
import PropertyCards from "./PropertyCards/PropertyCards";

// import { useMoralis, useWeb3Contract } from "react-moralis";
import console from "console-browserify";
import ConnectWallet from "../ConnectWallet/ConnectWallet";
// import { useNotification } from "web3uikit";

import { scroller } from "react-scroll";

import NavbarApp from "../NavbarApp/NavbarApp";

//----------------------------Contract Imports---------------------------------------//
import {
  adminABI,
  adminContractAddress,
} from "../../constants/Admin/adminConstants";
import { Container } from "react-bootstrap";
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

  //scroll animation

  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    // Function to check if an element is in view (even if partially visible)
    const isInViewport = (el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top <= window.innerHeight &&
        rect.bottom >= 0 &&
        rect.left <= window.innerWidth &&
        rect.right >= 0
      );
    };

    const handleScroll = () => {
      const updatedVisibility = {};
      properties.forEach((propertyDetails) => {
        const element = document.getElementById(propertyDetails._id);
        if (element) {
          updatedVisibility[propertyDetails._id] = isInViewport(element);
        }
      });
      setIsVisible(updatedVisibility);
    };

    // Add scroll event listener to check visibility on scroll
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check visibility on initial render

    return () => {
      // Clean up the event listener on unmount
      window.removeEventListener("scroll", handleScroll);
    };
  }, [properties]);

  return (
    <div className="mainPageFullBox">
      <NavbarApp />
      <div className="mainPageHeadingDiv">
        <h2 className="mainPageHeading">Properties Available for Rent </h2>
      </div>
      <div className="mainContainer"></div>
      {/* Property cards  */}
      <div className="listedProperties">
        {properties.map((propertyDetails) => {
          return (
            //Don't show property if already on rent
            // propertyDetails.onRent === true ? (
            <PropertyCards
              property={propertyDetails}
              key={propertyDetails._id}
              isVisible={isVisible[propertyDetails._id]}
            />
            // ) : (
            //   <></>
            // )
          );
        })}
      </div>
    </div>
  );
}

export default MainPage;
