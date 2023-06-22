import { Link, useLocation } from "react-router-dom";
import console from "console-browserify";
import { useEffect, useState } from "react";

import { useMoralis, useWeb3Contract } from "react-moralis";
import axios from "axios";

import { propertyABI } from "../../constants/Property/propertyConstant";

import "./DealTokenData.css";

const DealTokenData = () => {
  const location = useLocation();
  const { details } = location.state;
  const contractAddress = details;

  const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);

  const [dealTokenId, setDealTokenId] = useState(-1);

  const [dealTokenData, setDealTokenData] = useState({});

  const { runContractFunction: getDealToken } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "getDealToken",
    params: {
      _address: account,
    },
  });

  const { runContractFunction: tokenURI } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "tokenURI",
    params: {
      tokenId: dealTokenId,
    },
  });

  useEffect(() => {
    if (isWeb3Enabled) {
      getInitialInfo();
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    if (dealTokenId !== -1) {
      getDealTokenData();
    }
  }, [dealTokenId]);

  const getInitialInfo = async () => {
    const tempId = await getDealToken({
      onError: (err) => console.log(err),
    });
    setDealTokenId(tempId);
  };

  const getDealTokenData = async () => {
    const tempURI = await tokenURI({
      onError: (err) => console.log(err),
    });
    const { data } = await axios.get(tempURI);
    setDealTokenData(data);
  };
  console.log(dealTokenData);
  return Object.keys(dealTokenData).length === 0 ? (
    <div className="container">
      <div className="loading">Loading</div>
    </div>
  ) : (
    <div className="container">
      <img className="image" src={dealTokenData.image} alt="dealToken Image" />
      <h2 className="attribute">
        Start Date : {dealTokenData.attributes.startDate}{" "}
      </h2>
      <h2 className="attribute">
        End Date : {dealTokenData.attributes.endDate}
      </h2>
      <h2 className="attribute">
        Duration : {dealTokenData.attributes.duration}
      </h2>
      <h2 className="attribute">Score : {dealTokenData.attributes.score}</h2>
      <h2 className="attribute">
        Warnings : {dealTokenData.attributes.warnings}
      </h2>
    </div>
  );
};

export default DealTokenData;
