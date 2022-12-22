import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../App.css";
import "./AddProperty.css";
import { useMoralis, useWeb3Contract } from "react-moralis";
import console from "console-browserify";
import ConnectWallet from "../ConnectWallet/ConnectWallet";
import { useNotification } from "web3uikit";
import Compressor from "compressorjs";

import uploadImgToIPFS from "../../backendScripts/uploadImgToIPFS";
import uploadJsonToIPFS from "../../backendScripts/uploadJsonToIPFS";

import {
  propertyFactoryABI,
  propertyFactoryContractAddress,
} from "../../constants/PropertyFactory/propertyFactoryConstants";

function AddProperty() {
  const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const dispatch = useNotification();
  const propertyFactoryAddress =
    chainId in propertyFactoryContractAddress
      ? propertyFactoryContractAddress[chainId][0]
      : null;

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

  //Contract Functions

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

  //UseEffects

  useEffect(() => {
    if (Object.keys(propertyData).length !== 0) {
      updatePropertyDataIPFS();
    }
  }, [propertyData]);

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
  }, [propertyImageHashes]);

  useEffect(() => {
    if (propertyDataIPFS !== "") {
      addProperty();
    }
  }, [propertyDataIPFS]);

  //Functions

  const addProperty = async () => {
    await listProperty({
      onError: handleErrorNotification,
      onSuccess: handleSuccess,
    });
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

  const updatePropertyDataIPFS = async () => {
    const tempDataHash = await uploadJsonToIPFS(propertyData);
    setPropertyDataIPFS(`https://ipfs.io/ipfs/${tempDataHash}`);
  };

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

  const handleSuccess = async function (tx) {
    await tx.wait(1);
    handleNotification(tx);
    updateUI();
  };

  const handleNotification = function (tx) {
    dispatch({
      type: "success",
      message: "Transaction Successful",
      title: "Property Listed",
      position: "topR",
      icon: "checkmark",
    });
  };

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
                  if (propertyImages.length === "0") {
                    const tempImg = e.target.files[0];
                    new Compressor(tempImg, {
                      quality: 0.8,
                      success: (compressedResult) => {
                        console.log(compressedResult);
                        setPropertyImages(compressedResult);
                      },
                    });
                    // setPropertyImages(e.target.files[0]);
                  } else {
                    const tempImg = e.target.files[0];
                    new Compressor(tempImg, {
                      quality: 0.8,
                      success: (compressedResult) => {
                        console.log(compressedResult);
                        setPropertyImages([
                          ...propertyImages,
                          compressedResult,
                        ]);
                      },
                    });
                    // setPropertyImages([...propertyImages, e.target.files[0]]);
                  }
                }
              }}
            />
            <button
              disabled={buttonDisable}
              onClick={async () => {
                setButtonDisable(true);
                propertyImages.map(async (propertyImage) => {
                  const imageHash = await uploadImgToIPFS(propertyImage);
                  // propertyImageHashes.push(
                  //   `https://ipfs.io/ipfs/${imageHash.IpfsHash}`
                  // );
                  setPropertyImageHashes((prevHashes) => [
                    ...prevHashes,
                    `https://ipfs.io/ipfs/${imageHash.IpfsHash}`,
                  ]);
                  // console.log(imageHash);
                });

                // if (propertyImageHashes.length !== 0) {
                //   console.log(propertyImageHashes);
                //   setPropertyData({
                //     description: propertyDescription,
                //     highlights: propertyHighlights,
                //     location: propertyLocation,
                //     terms: propertyTerms,
                //     imagesArr: propertyImageHashes,
                //   });
                // }
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
