import { useSelector } from "react-redux";
import { useMoralis, useWeb3Contract } from "react-moralis";

import { useNotification } from "web3uikit";

import { propertyABI } from "../../constants/Property/propertyConstant";

import console from "console-browserify";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

import axios from "axios";
import uploadJsonToIPFS from "../../backendScripts/uploadJsonToIPFS";

import { useDispatch } from "react-redux";

import { deleteDealing } from "../../actions/activedealing";
import { endPeriodChanges } from "../../actions/property";

import {
  adminABI,
  adminContractAddress,
} from "../../constants/Admin/adminConstants";

import "./Dealings.css";
const Dealings = ({ isTenant }) => {
  const dealing = useSelector((state) => state.dealings);
  const {
    _id,
    contractAddress,
    dueDates,
    ownerAddress,
    tenantAddress,
    startDate,
    endDate,
    rent,
    security,
    dataURI,
  } = dealing;

  const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const adminAddress =
    chainId in adminContractAddress ? adminContractAddress[chainId][0] : null;
  const tempRent = ethers.utils.parseEther(rent.toString());
  const finalRent = tempRent.toString();

  const dispatchToServer = useDispatch();

  const [totalRentLeftToBePaid, setTotalRentLeftToBePaid] = useState(0);
  const [nextDueDate, setNextDueDate] = useState("");
  const [contractBalance, setContractBalance] = useState(0);

  const [dealTokenId, setDealTokenId] = useState(-1);
  const [dealTokenURI, setDealTokenURI] = useState("");

  const [reviewToProperty, setReviewToProperty] = useState("");
  const [warningToTenant, setWarningToTenant] = useState("");

  const [giveWarningDisable, setGiveWarningDisable] = useState(false);
  const [isWarning, setIsWarning] = useState(false);

  const [tenantScore, setTenantScore] = useState(0);

  const [tenantEntryTokenId, setTenantEntryTokenId] = useState(-1);
  const [tenantEntryTokenURI, setTenantEntryTokenURI] = useState("");

  const dispatchNotification = useNotification();

  const { runContractFunction } = useWeb3Contract();

  const { runContractFunction: payRent } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "payRent",
    params: {},
    msgValue: finalRent,
  });

  const { runContractFunction: getDueDate } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "getDueDate",
    params: {},
  });

  const { runContractFunction: getBalance } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "getBalance",
    params: {},
  });

  const { runContractFunction: getTotalRentLeftToBePaid } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "getTotalRentLeftToBePaid",
    params: {},
  });

  const { runContractFunction: withdrawMonthRent } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "withdrawMonthRent",
    params: {},
  });

  const { runContractFunction: getDealToken } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "getDealToken",
    params: {
      _address: tenantAddress,
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

  const { runContractFunction: giveWarning } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "giveWarning",
    params: {
      _newDealTokenURI: dealTokenURI,
    },
  });

  const { runContractFunction: updateTokenURI } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "updateTokenURI",
    params: {
      _newTokenURI: dealTokenURI,
      _dealTokenId: dealTokenId,
    },
  });

  const { runContractFunction: endTenantTime } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "endTenantTime",
    params: {},
  });

  const { runContractFunction: getTokenId } = useWeb3Contract({
    abi: adminABI,
    contractAddress: adminAddress,
    functionName: "getTokenId",
    params: {
      _userAddress: tenantAddress,
    },
  });

  const { runContractFunction: entryTokenURI } = useWeb3Contract({
    abi: adminABI,
    contractAddress: adminAddress,
    functionName: "tokenURI",
    params: {
      tokenId: tenantEntryTokenId,
    },
  });

  useEffect(() => {
    if (isWeb3Enabled) {
      getInitialInfo();
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    if (dealTokenId !== -1 && isWarning) {
      handleGetDealTokenURI();
    }
    if (dealTokenId !== -1 && tenantScore !== 0) {
      handleScoreDealTokenURI();
    }
  }, [dealTokenId]);

  useEffect(() => {
    if (dealTokenURI !== "" && isWarning) {
      updateDealTokenURI();
    }
    if (dealTokenURI !== "" && tenantScore !== 0) {
      giveFinalScore();
    }
  }, [dealTokenURI]);

  useEffect(() => {
    if (tenantEntryTokenId !== -1) {
      getTenantEntryTokenURI();
    }
  }, [tenantEntryTokenId]);

  useEffect(() => {
    if (entryTokenURI !== "") {
      finalTransaction();
    }
  }, [tenantEntryTokenURI]);

  const getInitialInfo = async () => {
    const bigTotalRentLeft = await getTotalRentLeftToBePaid({
      onError: (error) => console.log(error),
    });
    const bigDueDate = await getDueDate({
      onError: (error) => console.log(error),
    });

    const tempBalance = await getBalance({
      onError: (error) => console.log(error),
    });

    const etherBalance = ethers.utils.formatEther(tempBalance);

    const tempTotalRentLeftToBePaid =
      ethers.utils.formatEther(bigTotalRentLeft);

    setTotalRentLeftToBePaid(tempTotalRentLeftToBePaid);
    setNextDueDate(new Date(bigDueDate * 1000).toString());
    setContractBalance(etherBalance);
  };

  const handleRentPayment = async () => {
    await payRent({
      onSuccess: handleRentPaidSuccess,
      onError: (error) => {
        console.log(error);
        handleErrorNotification("Transaction failed", "Rent not paid");
      },
    });
  };

  const handleReviewProperty = async () => {
    const giveReviewToPropertyOptions = {
      abi: propertyABI,
      contractAddress: contractAddress,
      functionName: "giveReviewToProperty",
      params: {
        _newReview: reviewToProperty,
      },
    };

    await runContractFunction({
      params: giveReviewToPropertyOptions,
      onSuccess: (tx) => {
        handleNotification("Review Given Successfully", "Your review is saved");
      },
      onError: (error) => {
        console.log(error);
        handleErrorNotification("Transaction failed", "Cannot give review");
      },
    });
  };

  const handleRentWithdrawl = async () => {
    await withdrawMonthRent({
      onSuccess: handleRentWithdrawSuccess,
      onError: (error) => {
        console.log(error);
        handleErrorNotification("Transaction failed", "Rent not withdrawn");
      },
    });
  };

  const handleGiveWarning = async () => {
    //get deal token , udate it, reassign it
    if (warningToTenant !== "") {
      setIsWarning(true);
      const tempDealTokenId = await getDealToken({
        onError: (error) => console.log(error),
      });
      setDealTokenId(tempDealTokenId);
      console.log("1");
      setGiveWarningDisable(true);
    }
  };

  const handleGetDealTokenURI = async () => {
    const tempURI = await tokenURI({
      onError: (error) => console.log(error),
    });
    const { data } = await axios.get(tempURI);
    const { attributes } = data;
    const { warnings } = attributes;
    warnings.push(warningToTenant);
    const tempURIData = { ...data, warnings: warnings };
    const tempUpdatedDealTokenURI = await uploadJsonToIPFS(tempURIData);
    setDealTokenURI(`https://ipfs.io/ipfs/${tempUpdatedDealTokenURI.IpfsHash}`);
  };

  const updateDealTokenURI = async () => {
    await giveWarning({
      onError: (err) => {
        console.log(err);
        handleErrorNotification("Message not saved", "Error Occured");
        setGiveWarningDisable(false);
        setWarningToTenant("");
      },
      onSuccess: async (tx) => {
        await tx.wait(1);
        handleNotification(
          "Message saved to Deal Token",
          "Warning Given Successfully"
        );
        setGiveWarningDisable(false);
        setWarningToTenant("");
        setIsWarning(false);
      },
    });
  };

  const handleEndTenantTime = async () => {
    // fetch dealtoken , update score in dealtoken, fetch entryToken, update reputation in entryToken, entTenantTime function of smart contract, remove property from active properties and update onRent in properties backend
    const tempDealTokenId = await getDealToken({
      onError: (error) => console.log(error),
    });
    setDealTokenId(tempDealTokenId);
  };

  const handleScoreDealTokenURI = async () => {
    const tempURI = await tokenURI({
      onError: (error) => console.log(error),
    });
    const { data } = await axios.get(tempURI);
    const { attributes } = data;
    const { score } = attributes;
    score = tenantScore;
    const tempURIData = { ...data, score: score };
    const tempUpdatedDealTokenURI = await uploadJsonToIPFS(tempURIData);
    setDealTokenURI(`https://ipfs.io/ipfs/${tempUpdatedDealTokenURI.IpfsHash}`);
  };

  const giveFinalScore = async () => {
    await updateTokenURI({
      onError: (err) => console.log(err),
    });

    const tempTenantEntryTokenId = await getTokenId({
      onError: (error) => console.log(error),
    });

    setTenantEntryTokenId(tempTenantEntryTokenId);
  };

  const getTenantEntryTokenURI = async () => {
    const tempEntryTokenURI = await entryTokenURI({
      onError: (err) => console.log(err),
    });
    const { data } = await axios.get(tempEntryTokenURI);
    const { attributes } = data;
    const { reputation, dealTokens } = attributes;
    const logScore = Math.log(tenantScore) / Math.log(5);
    const n = dealTokens.length;
    reputation =
      (1.01 * (100 - 50 * (1 - logScore)) + reputation * (n - 1)) / n;
    const tempURIData = { ...data, reputation: reputation };
    const tempUpdatedEntryTokenURI = await uploadJsonToIPFS(tempURIData);
    setTenantEntryTokenURI(
      `https://ipfs.io/ipfs/${tempUpdatedEntryTokenURI.IpfsHash}`
    );
  };

  const finalTransaction = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const wallet = new ethers.Wallet(
      process.env.REACT_APP_PRIVATE_KEY,
      provider
    );

    const adminContract = new ethers.Contract(adminAddress, adminABI, wallet);
    await adminContract.updateTokenURI(tenantEntryTokenURI, tenantEntryTokenId);
    await endTenantTime({
      onError: (err) => {
        console.log(err);
        setTenantScore(0);
        handleErrorNotification("Transaction failed", "Error Occured");
      },
      onSuccess: async (tx) => {
        await tx.wait(1);
        setTenantScore(0);
        handleBackendAfterEnd();
      },
    });
  };

  const handleBackendAfterEnd = async () => {
    dispatchToServer(deleteDealing(_id));
    const tempURI = dataURI.split("ipfs/").pop();
    dispatchToServer(endPeriodChanges(tempURI));
    handleNotification("Transaction successful", "Period Ended Successfully");
  };

  const handleRentPaidSuccess = async function (tx) {
    await tx.wait(1);
    const newDueDate = await getDueDate({
      onError: (error) => console.log(error),
    });
    const newRentLeft = await getTotalRentLeftToBePaid({
      onError: (error) => console.log(error),
    });
    const newContractBalance = await getBalance({
      onError: (error) => console.log(error),
    });
    const dateInFormat = new Date(newDueDate * 1000).toString();
    setNextDueDate(dateInFormat);
    setTotalRentLeftToBePaid(ethers.utils.formatEther(newRentLeft));
    setContractBalance(ethers.utils.formatEther(newContractBalance));

    const message = `Next Due Date is ${dateInFormat}`;
    const title = "Rent Paid Successfully";
    handleNotification(message, title);
  };

  const handleRentWithdrawSuccess = async function (tx) {
    await tx.wait(1);
    const newContractBalance = await getBalance({
      onError: (error) => console.log(error),
    });
    setContractBalance(ethers.utils.formatEther(newContractBalance));
    handleNotification(
      "Please wait for the transaction to be reflected",
      "Added to wallet"
    );
  };

  const handleNotification = function (message, title) {
    dispatchNotification({
      type: "success",
      message: message,
      title: title,
      position: "topR",
      icon: "checkmark",
    });
  };

  const handleErrorNotification = function (message, title) {
    dispatchNotification({
      type: "error",
      message: message,
      title: title,
      position: "topR",
      icon: "info",
    });
  };

  return (
    <div className="container">
      <h2>Owner : {ownerAddress}</h2>
      <h2>Tenant : {tenantAddress}</h2>
      <h2>startDate : {startDate}</h2>
      <h2>endDate : {endDate}</h2>
      <h2>dueDates : {dueDates}</h2>
      <h2>Next Due Date : {nextDueDate}</h2>
      <h2>Total Rent Left : {totalRentLeftToBePaid}</h2>
      <h2>Contract Balance : {contractBalance}</h2>
      {isTenant ? (
        //Pay Rent -> 1. Check if all rent already paid.  2. payRent function of smart contract  3.update duedate in mongodb
        //Give Review -> 1. giveReviewToProperty function of smart contract
        <div>
          <button onClick={handleRentPayment}>Pay Rent</button>
          <button>Withdraw Security</button>
          <input
            type="text"
            placeholder="Write Here"
            value={reviewToProperty}
            onChange={(e) => setReviewToProperty(e.target.value)}
            required
          />
          <button onClick={handleReviewProperty}>
            Give Review to Property
          </button>
        </div>
      ) : (
        <div>
          <button onClick={handleRentWithdrawl}>Withdraw Rent</button>
          <input
            type="text"
            placeholder="Write Here"
            value={warningToTenant}
            onChange={(e) => setWarningToTenant(e.target.value)}
            required
          />
          <button onClick={handleGiveWarning} disabled={giveWarningDisable}>
            Give Warning
          </button>
          <label htmlfor="pack">Select a score for Tenant : </label>
          <select
            id="pack"
            name="pack"
            onChange={(e) => setTenantScore(e.target.value)}
            value={tenantScore}
            required
          >
            <option value="1">Extremely Poor</option>
            <option value="2">Poor</option>
            <option value="3">Medicore</option>
            <option value="4">Good</option>
            <option value="5">Excellent</option>
          </select>
          <button onClick={handleEndTenantTime}>End Tenant Time</button>
        </div>
      )}
    </div>
  );
};

export default Dealings;
