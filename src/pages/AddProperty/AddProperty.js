import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

//To send to mongodb server
import { useDispatch } from "react-redux";
import { addNewProperty } from "../../actions/property";

import "../../App.css";
import "./AddProperty.css";
import { useMoralis, useWeb3Contract } from "react-moralis";
import console from "console-browserify";
import ConnectWallet from "../ConnectWallet/ConnectWallet";
import { useNotification } from "web3uikit";
import Compressor from "compressorjs";
import { ethers } from "ethers";
import axios from "axios";

//---------------------------IPFS Imports---------------------------------------------//
import uploadImgToIPFS from "../../backendScripts/uploadImgToIPFS";
import uploadJsonToIPFS from "../../backendScripts/uploadJsonToIPFS";
//------------------------------------------------------------------------------------//

//----------------------------Contract Imports---------------------------------------//
import {
  propertyFactoryABI,
  propertyFactoryContractAddress,
} from "../../constants/PropertyFactory/propertyFactoryConstants";

import {
  adminABI,
  adminContractAddress,
} from "../../constants/Admin/adminConstants";
//----------------------------------------------------------------------------------//

//=================================================================================//

function AddProperty() {
  const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const dispatch = useNotification();
  const dispatchToServer = useDispatch();
  const propertyFactoryAddress =
    chainId in propertyFactoryContractAddress
      ? propertyFactoryContractAddress[chainId][0]
      : null;
  const adminAddress =
    chainId in adminContractAddress ? adminContractAddress[chainId][0] : null;

  const [entryTokenId, setEntryTokenId] = useState("-1");
  const [entryTokenURI, setEntryTokenURI] = useState("");

  const [buttonDisable, setButtonDisable] = useState(false);
  const [propertyRent, setPropertyRent] = useState("");
  const [propertySecurity, setPropertySecurity] = useState("");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [propertyDescription, setPropertyDescription] = useState("");
  const [propertyTerms, setPropertyTerms] = useState("");
  const [propertyHighlights, setPropertyHighlights] = useState("");
  const [propertyImages, setPropertyImages] = useState([]);

  const [propertyImageHashes, setPropertyImageHashes] = useState([]);

  const [propertyData, setPropertyData] = useState({});
  const [propertyDataIPFS, setPropertyDataIPFS] = useState("");

  const [propertyContractAndUserAddress, setPropertyContractAndUserAddress] =
    useState([]);

  //-------------------------------------Contract Functions---------------------------------//

  const { runContractFunction: listProperty } = useWeb3Contract({
    abi: propertyFactoryABI,
    contractAddress: propertyFactoryAddress,
    functionName: "listProperty",
    params: {
      _propertyData: propertyDataIPFS,
      _propertyRent: propertyRent,
      _propertySecurity: propertySecurity,
    },
  });

  const { runContractFunction: getTokenId } = useWeb3Contract({
    abi: adminABI,
    contractAddress: adminAddress,
    functionName: "getTokenId",
    params: {
      _userAddress: account,
    },
  });

  const { runContractFunction: updateTokenURI } = useWeb3Contract({
    abi: adminABI,
    contractAddress: adminAddress,
    functionName: "updateTokenURI",
    params: {
      _newTokenURI: entryTokenURI,
      _entryTokenId: entryTokenId,
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

  //-----------------------------------------------------------------------------------------//

  //====================================UseEffects===========================================//

  //If web3 enabled, call updateTokenId function line 170
  useEffect(() => {
    if (isWeb3Enabled) {
      updateTokenId();
    }
  }, [isWeb3Enabled]);

  //3. check if property data object is not empty, then call updatePropertyDataIPFS function line 265
  useEffect(() => {
    if (Object.keys(propertyData).length !== 0) {
      updatePropertyDataIPFS();
    }
    console.log("3");
  }, [propertyData]);

  //2. check if all images have their ipfs hash or not. then set property data and move to useEffect line 114
  useEffect(() => {
    if (
      propertyImageHashes.length === propertyImages.length &&
      propertyImageHashes.length !== 0
    ) {
      setPropertyData({
        description: propertyDescription,
        highlights: propertyHighlights,
        location: propertyLocation,
        terms: propertyTerms,
        imagesArr: propertyImageHashes,
      });
    }
    console.log("2");
  }, [propertyImageHashes]);

  //5. check if propertyData is not null, then call addProperty function on line 159
  useEffect(() => {
    if (propertyDataIPFS !== "") {
      addProperty();
    }
    console.log("5");
  }, [propertyDataIPFS]);

  //on getting the updated entry token uri, call udpdate entry token to set the user entry token id with new entry token uri --> line 233
  useEffect(() => {
    if (
      entryTokenURI !== "" &&
      (entryTokenId !== "0" || entryTokenId !== "-1")
    ) {
      updateEntryToken();
    }
  }, [entryTokenURI]);

  ////////////////////when property listed event is emitted, set data in server. First check that new property contract address is not null;
  useEffect(() => {
    //check if owner address and contract address is present or not. then check if ipfs hash is there or not -> to prevent sending data on reload(contract and user data are still there, so it will send multiple post request)
    if (
      propertyContractAndUserAddress.length !== 0 &&
      propertyDataIPFS !== ""
    ) {
      // console.log(propertyRent);
      // console.log(propertyContractAndUserAddress[0]);
      // console.log(propertyContractAndUserAddress[1]);
      // console.log(account);
      // console.log(propertyDescription);
      console.log("dispatching");
      // handleNotification();

      dispatchToServer(
        addNewProperty({
          ownerAddress: propertyContractAndUserAddress[1],
          contractAddress: propertyContractAndUserAddress[0],
          dataURI: propertyDataIPFS,
          rent: propertyRent,
          security: propertySecurity,
          images: propertyImageHashes,
          completeLocation: propertyLocation,
          state: propertyLocation,
          description: propertyDescription,
          highlights: propertyHighlights,
          terms: propertyTerms,
        })
      );
    }
  }, [propertyContractAndUserAddress]);

  //====================================================================================//

  //***********************************Functions****************************************//

  //6. Calling contract function to list property, listen for event propertyListed emitted on line 166 updateTokenId;
  const addProperty = async () => {
    const tempAdd = await listProperty({
      onError: handleErrorNotification,
      onSuccess: handleSuccess,
    });
  };

  //Create propertycontract to listen for events after addProperty function and setEntryTokenId
  const updateTokenId = async () => {
    const tempEntryTokenID = await getTokenId({
      onError: (error) => console.log(error),
    });

    /////////////////////////Check if required to set event listener or not//////////////////////

    /////////////////////// Event required to get current property address on chain ///////////////////
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const propertyFactoryContract = new ethers.Contract(
      propertyFactoryAddress,
      propertyFactoryABI,
      provider
    );
    propertyFactoryContract.on(
      "PropertyListed",
      (_ownerAddress, _propertyAddress, _propertyData) => {
        setPropertyContractAndUserAddress([_propertyAddress, _ownerAddress]);
        // console.log(_propertyData);
        // console.log(_ownerAddress);
        // console.log(account);
        // console.log("LISTED!!!!!");
        // console.log(_ownerAddress);
        // console.log(_propertyAddress);
        // console.log(_propertyData);
        // console.log(account);
        // console.log(propertyRent);
        // console.log(propertySecurity);
        // console.log(propertyDescription);
        // console.log(propertyDataIPFS);
        // console.log(propertyHighlights);
        // console.log(propertyTerms);
        // console.log(propertyImageHashes);
        // console.log(propertyLocation);

        // handleNotification();
        // updateUI();

        //       const tempProperty = {
        //         ownerAddress: _ownerAddress,
        // contractAddress: _propertyAddress,
        // dataURI: String,
        // onRent: {
        //   type: Boolean,
        //   default: false,
        // },
        // interestedUsers: {
        //   type: [String],
        //   default: [],
        // },
        // tenantHistory: {
        //   type: [String],
        //   default: [],
        // },
        // rent: Number,
        // security: Number,
        // images: [String],
        // completeLocation: String,
        // state: String,
        // description: String,
        //       }
      }
    );

    setEntryTokenId(tempEntryTokenID.toString());
  };

  // as the entry token uri can only be updated by the admin. create admin contract and update entry token uri;
  const updateEntryToken = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const wallet = new ethers.Wallet(
      process.env.REACT_APP_PRIVATE_KEY,
      provider
    );

    const adminContract = new ethers.Contract(adminAddress, adminABI, wallet);
    await adminContract.updateTokenURI(entryTokenURI, entryTokenId);
  };

  // get entry token uri of owner and add to properties owned the added proeprty. upload this to ipfs and set this new entry token uri; this will call the useeffect on line 147
  const getCurrentEntryTokenData = async () => {
    const tempTokenURI = await tokenURI({
      onError: (error) => console.log(error),
    });
    const { data } = await axios.get(`${tempTokenURI}`);
    const { attributes } = data;
    const { propertiesOwned } = attributes;
    propertiesOwned.push(propertyDataIPFS);
    const tempURIData = { ...data, attributes: attributes };
    const tempUpdatedEntryTokenURI = await uploadJsonToIPFS(tempURIData);
    setEntryTokenURI(
      `https://ipfs.io/ipfs/${tempUpdatedEntryTokenURI.IpfsHash}`
    );
    handleNotification();
  };

  const updateUI = async () => {
    setPropertyRent("");
    setPropertySecurity("");
    setPropertyLocation("");
    setPropertyDescription("");
    setPropertyTerms("");
    setPropertyHighlights("");
    setPropertyImages([]);
    setPropertyImageHashes([]);
    setPropertyData({});
    setPropertyDataIPFS("");
    setButtonDisable(false);
  };

  //4. upload propertyData(including image hashes) and setPropertyDataIPFS. now move to useEffect line 137
  const updatePropertyDataIPFS = async () => {
    const tempDataHash = await uploadJsonToIPFS(propertyData);
    setPropertyDataIPFS(`https://ipfs.io/ipfs/${tempDataHash.IpfsHash}`);
  };

  //Give error and reset the ui
  const handleErrorNotification = function (tx) {
    dispatch({
      type: "error",
      message: "Property Not Listed",
      title: "Error Occured",
      position: "topR",
      icon: "info",
    });
    updateUI();
  };

  // if property listed successfully, update entry token id of owner (line 243)
  const handleSuccess = async function (tx) {
    await tx.wait(1);
    // handleNotification();
    getCurrentEntryTokenData();
  };

  const handleNotification = function () {
    dispatch({
      type: "success",
      message: "Transaction Successful",
      title: "Property Listed",
      position: "topR",
      icon: "checkmark",
    });
    updateUI();
  };

  const listPropertyOnServer = function () {
    console.log(account);
    console.log(propertyRent);
    console.log(propertySecurity);
    console.log(propertyDescription);
    console.log(propertyDataIPFS);
    console.log(propertyHighlights);
    console.log(propertyTerms);
    console.log(propertyImageHashes);
    console.log(propertyLocation);
  };

  //************************************************************************//

  return (
    <div className="fullbox">
      <div>
        <nav>
          <ConnectWallet />
          <Link to="/">Back To MainPage</Link>
        </nav>
        <div className="homeContainer">
          <section
            className="home"
            style={{ backgroundColor: "rgb(0,0,0,0.75)", borderRadius: "2%" }}
          >
            <input
              type="number"
              placeholder="Property Rent"
              value={propertyRent}
              onChange={(e) => setPropertyRent(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Property Security"
              value={propertySecurity}
              onChange={(e) => setPropertySecurity(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Property Location"
              value={propertyLocation}
              onChange={(e) => setPropertyLocation(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Property Description"
              value={propertyDescription}
              onChange={(e) => setPropertyDescription(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Property Terms & Conditions"
              value={propertyTerms}
              onChange={(e) => setPropertyTerms(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Property Highlights"
              value={propertyHighlights}
              onChange={(e) => setPropertyHighlights(e.target.value)}
              required
            />
            <label htmlFor="propertyImages">Select Image : </label>
            <input
              type="file"
              id="propertyImages"
              onChange={(e) => {
                if (e.target.files.length !== 0) {
                  //Check if propertyImages is [] empty then setimage to that image. but if [] if not empty, then add current image to previous images. (... operator)
                  if (propertyImages.length === "0") {
                    const tempImg = e.target.files[0];
                    new Compressor(tempImg, {
                      quality: 0.8,
                      success: (compressedResult) => {
                        setPropertyImages(compressedResult);
                      },
                    });
                    // setPropertyImages(e.target.files[0]);
                  } else {
                    const tempImg = e.target.files[0];
                    new Compressor(tempImg, {
                      quality: 0.8,
                      success: (compressedResult) => {
                        setPropertyImages([
                          ...propertyImages,
                          compressedResult,
                        ]);
                      },
                    });
                  }
                }
              }}
            />
            {/* 1. disable button on click, and upload images to ipfs -> set propertyImageHashes. Once image hashees are set, go to useEffect 120 line */}
            <button
              disabled={buttonDisable}
              onClick={async () => {
                setButtonDisable(true);
                propertyImages.map(async (propertyImage) => {
                  const imageHash = await uploadImgToIPFS(propertyImage);
                  setPropertyImageHashes((prevHashes) => [
                    ...prevHashes,
                    `https://ipfs.io/ipfs/${imageHash.IpfsHash}`,
                  ]);
                });
                console.log("1");
              }}
            >
              Submit
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AddProperty;
