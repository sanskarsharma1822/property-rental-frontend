import console from "console-browserify";
import { Link, useLocation } from "react-router-dom";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";

import "./PropertyDetail.css";

import { useDispatch } from "react-redux";
import { applyForTenant, clearInterestedTenants } from "../../actions/property";
import { useEffect, useState } from "react";

import { propertyABI } from "../../constants/Property/propertyConstant";
import DealToken from "../../constants/DealToken /DealToken";
import { useNotification } from "web3uikit";

import { addNewDealing } from "../../actions/activedealing";
import axios from "axios";

import uploadJsonToIPFS from "../../backendScripts/uploadJsonToIPFS";
import {
  adminABI,
  adminContractAddress,
} from "../../constants/Admin/adminConstants";

const PropertyDetail = () => {
  //Pass data from property cards (explore the property in detail now)
  const location = useLocation();
  const { details } = location.state;

  const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);

  const adminAddress =
    chainId in adminContractAddress ? adminContractAddress[chainId][0] : null;
  const { runContractFunction } = useWeb3Contract();

  const dispatch = useDispatch();
  const dispatchNotification = useNotification();

  const [tenantEntryTokenID, setTenantEntryTokenID] = useState(-1);
  const [tenantEntryTokenURI, setTenantEntryTokenURI] = useState("");

  const [i, setI] = useState(0);
  const [noOfReview, setNoOfReviews] = useState(0);
  const [reviewArr, setReviewArr] = useState([]);

  const [verifiedUser, setVerifiedUser] = useState("");

  const [selectedTenantAddress, setSelectedTenantAddress] = useState("");

  const [applied, setApplied] = useState(false);
  const [disable, setDisable] = useState(false);

  const [dealTokenIPFS, setDealTokenIPFS] = useState("");

  const {
    _id,
    completeLocation,
    contractAddress,
    dataURI,
    description,
    highlights,
    images,
    interestedUsers,
    onRent,
    ownerAddress,
    rent,
    security,
    state,
    tenantHistory,
    terms,
    duration,
  } = details;

  const { runContractFunction: getReview } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "getReview",
    params: {
      _index: i,
    },
  });

  const { runContractFunction: getNoOfReviews } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "getNoOfReviews",
    params: {},
  });

  const { runContractFunction: verifiedByLandlord } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "verifiedByLandlord",
    params: {
      _proposedTenantAddress: selectedTenantAddress,
    },
  });

  const { runContractFunction: getAddressVerifiedByOwner } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "getAddressVerifiedByOwner",
    params: {},
  });

  const { runContractFunction: getTokenId } = useWeb3Contract({
    abi: adminABI,
    contractAddress: adminAddress,
    functionName: "getTokenId",
    params: {
      _userAddress: account,
    },
  });

  const { runContractFunction: tokenURI } = useWeb3Contract({
    abi: adminABI,
    contractAddress: adminAddress,
    functionName: "tokenURI",
    params: {
      tokenId: tenantEntryTokenID,
    },
  });

  const applyInterested = () => {
    dispatch(applyForTenant(_id, { userAddress: account }));
    setApplied(true);
  };

  // To get reviews and verifiedUser from contracts. IF verified user is still the owner, allow him to verify someone. but if someone is already verified, revoke that aciton    /////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (isWeb3Enabled) {
      getTotalReviews();
      getTenantVerifiedByOwner();
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    if (noOfReview !== 0) {
      getReviewFromContract();
    }
  }, [noOfReview]);

  //To loop through reviews array in smart contract
  useEffect(() => {
    if (i < noOfReview) {
      getReviewFromContract();
    }
  }, [i]);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  //To disable the apply button without refreshing the page
  useEffect(() => {
    if (applied) {
      setDisable(true);
    }
  }, [applied]);

  /// For tenant verification

  useEffect(() => {
    if (selectedTenantAddress !== "") {
      handleTenantVerification();
    }
  }, [selectedTenantAddress]);

  /// For AddTenant

  useEffect(() => {
    if (dealTokenIPFS !== "") {
      handleStartLease();
      getEntryTokenID();
    }
  }, [dealTokenIPFS]);

  //Get total no of reviews as soon as the page loads(web3 enabled)
  const getTotalReviews = async () => {
    const tempNoOfReviews = await getNoOfReviews({
      onError: (error) => console.log(error),
    });
    setNoOfReviews(tempNoOfReviews.toNumber());
  };

  //to update entry token
  useEffect(() => {
    if (tenantEntryTokenID !== -1) {
      console.log("calling handleEntryTokenURI");
      handleEntryTokenURI();
    }
  }, [tenantEntryTokenID]);

  useEffect(() => {
    if (
      tenantEntryTokenURI !== "" &&
      (tenantEntryTokenID !== "0" || tenantEntryTokenID !== "-1")
    ) {
      console.log("calling updating entryToken");
      updateEntryToken();
    }
  }, [tenantEntryTokenURI]);

  const getReviewFromContract = async () => {
    const tempReview = await getReview({
      onError: (error) => console.log(error),
    });
    setReviewArr((prevArr) => [...prevArr, tempReview]);
    setI((prevI) => prevI + 1);
  };

  const getEntryTokenID = async () => {
    const tempEntryTokenId = await getTokenId({
      onError: (error) => console.log(error),
    });
    console.log(tempEntryTokenId.toString());
    setTenantEntryTokenID(tempEntryTokenId.toString());
  };

  const handleEntryTokenURI = async () => {
    const tempURI = await tokenURI({
      onError: (err) => console.log(err),
    });
    const { data } = await axios.get(`${tempURI}`);
    const { attributes } = data;
    const { dealTokens } = attributes;
    dealTokens.push(contractAddress);
    const tempURIData = { ...data, dealTokens: dealTokens };
    console.log(tempURIData);
    const tempUpdatedEntryTokenURI = await uploadJsonToIPFS(tempURIData);
    console.log(tempUpdatedEntryTokenURI);
    setTenantEntryTokenURI(
      `https://ipfs.io/ipfs/${tempUpdatedEntryTokenURI.IpfsHash}`
    );
  };

  const updateEntryToken = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const wallet = new ethers.Wallet(
      process.env.REACT_APP_PRIVATE_KEY,
      provider
    );

    const adminContract = new ethers.Contract(adminAddress, adminABI, wallet);
    await adminContract.updateTokenURI(tenantEntryTokenURI, tenantEntryTokenID);
  };

  const getTenantVerifiedByOwner = async () => {
    const tempVerified = await getAddressVerifiedByOwner({
      onError: (error) => console.log(error),
    });
    setVerifiedUser(tempVerified);
  };

  const handleTenantVerification = async () => {
    await verifiedByLandlord({
      onError: (error) => console.log(error),
      onSuccess: handleSuccess,
    });
  };

  const handleDealTokenIPFS = async () => {
    const currentDate = new Date();
    const endDate = new Date(
      new Date().getTime() + duration * 30 * 24 * 60 * 60 * 1000
    );
    //Getting Deal Token Metadata
    const dealTokenMetaData = DealToken(
      duration,
      terms,
      ownerAddress,
      account,
      currentDate,
      endDate,
      [],
      0
    );
    const dealTokenIPFSHash = await uploadJsonToIPFS(dealTokenMetaData);
    setDealTokenIPFS(`https://ipfs.io/ipfs/${dealTokenIPFSHash.IpfsHash}`);
  };

  const handleStartLease = async () => {
    //one month after current date;
    const dueDateJS = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
    const dueDate = Math.floor(dueDateJS.getTime() / 1000);

    //end date
    const endDateJS = new Date(
      new Date().getTime() + duration * 30 * 24 * 60 * 60 * 1000
    );
    const endDate = Math.floor(endDateJS.getTime() / 1000);

    //changing security in ether format
    const tempSecurity = ethers.utils.parseEther(security.toString());
    const finalSecurity = tempSecurity.toString();

    //contract params
    const addTenantOptions = {
      abi: propertyABI,
      contractAddress: contractAddress,
      functionName: "addTenant",
      params: {
        _newTokenURI: dealTokenIPFS,
        _dueDate: dueDate,
        _endDate: endDate,
        _duration: duration,
      },
      msgValue: finalSecurity,
    };

    // running addTenant contract
    await runContractFunction({
      params: addTenantOptions,
      onSuccess: handleTenantAddedSuccess,
      onError: (error) => console.log(error),
    });
  };

  const handleSuccess = async function (tx) {
    await tx.wait(1);

    //--------------check if interested tenant array should be cleared at verification or after the tenant pays security-----------//////

    // dispatch(clearInterestedTenants(_id));
    setVerifiedUser(selectedTenantAddress);
    handleNotification();
  };

  const handleTenantAddedSuccess = async function (tx) {
    await tx.wait(1);
    const tempStartDate = new Date();
    let loopStartDate = tempStartDate;
    const tempEndDate = new Date(
      new Date().getTime() + duration * 30 * 24 * 60 * 60 * 1000
    );
    const tempDueDates = [];
    for (let i = 0; i < duration; i++) {
      let tempDate = new Date(
        loopStartDate.getTime() + 30 * 24 * 60 * 60 * 1000
      );
      tempDueDates.push(tempDate);
      loopStartDate = tempDate;
    }
    dispatch(
      addNewDealing({
        ownerAddress: ownerAddress,
        tenantAddress: verifiedUser.toLowerCase(),
        dataURI: dataURI,
        startDate: tempStartDate,
        endDate: tempEndDate,
        dueDates: tempDueDates,
        duration: duration,
        contractAddress: contractAddress,
        rent: rent,
        security: security,
      })
    );

    dispatch(clearInterestedTenants(_id));

    handleTenantNotification();
  };

  const handleNotification = function () {
    dispatchNotification({
      type: "success",
      message: "Waiting for tenant to pay security",
      title: "Tenant Verified",
      position: "topR",
      icon: "checkmark",
    });
  };

  const handleTenantNotification = function () {
    dispatchNotification({
      type: "success",
      message: "Lease Period Started",
      title: "Security Paid Successfully",
      position: "topR",
      icon: "checkmark",
    });
  };

  return (
    <div className="property-detail">
      {images.length === 1 ? (
        <img className="property-image" src={images[0]} alt="Property Image" />
      ) : (
        ///// ////////////////////////////add a carousel for multiple images/////////////////////////
        <div className="carousel">multiple images</div>
      )}
      <h2>Rent : {rent}</h2>
      <h2>Security : {security}</h2>
      <h2>completeLocation : {completeLocation}</h2>
      <h2>State : {state}</h2>
      <h2>Terms : {terms}</h2>
      <h2>Description : {description}</h2>
      <h2>Highlights : {highlights}</h2>
      <h2>Tenant History : {tenantHistory}</h2>
      <h2>Owner Address : {ownerAddress}</h2>
      <h2>Reviews : {reviewArr}</h2>
      {account === ownerAddress.toLowerCase() ? (
        ///check if someone is verified already or not
        verifiedUser !== ownerAddress ? (
          <h2>Already verified - {verifiedUser}</h2>
        ) : (
          <div>
            <h2>
              Interested Users :
              {interestedUsers.map((userAdd) => {
                ///// CHECK THIS, WHAT TO DO AFTER VERIFICATION  ---->   At approval of tenant -> step 1. verifiedByLandlord of Contract, step 2. empty interested users array in mongodb, step 3. stop owner from making multiple users verified.
                ///// or set 1. verifiedByLandlord of smart contract , then other steps after tenant pays security. Not Allowing landlord to verify multiple users.
                return (
                  <div>
                    <Link to="/profile" state={{ userAccount: userAdd }}>
                      {userAdd}
                    </Link>
                    <button onClick={() => setSelectedTenantAddress(userAdd)}>
                      Approve this for tenant
                    </button>
                    <br />
                  </div>
                );
              })}
            </h2>
          </div>
        )
      ) : (
        <div>
          {verifiedUser.toLowerCase() === account ? (
            //When verified user clicks start now -> 1. send contract data on ipfs 2. send the ipfs hash, end date, start date, and duration to addTenant function of smart contract
            // 3. Send data to active property mongodb database. 4. update data of this property in mongodb
            <div>
              <button onClick={handleDealTokenIPFS}> Start Now </button>
            </div>
          ) : onRent === true ? (
            <div>Already on Rent</div>
          ) : interestedUsers.includes(account) || disable ? (
            <div>Already Registered</div>
          ) : (
            <button onClick={applyInterested}>Apply</button>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
