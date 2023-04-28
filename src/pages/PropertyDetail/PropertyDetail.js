import console from "console-browserify";
import { Link, useLocation } from "react-router-dom";
import { useMoralis, useWeb3Contract } from "react-moralis";

import { useDispatch } from "react-redux";
import { applyForTenant, clearInterestedTenants } from "../../actions/property";
import { useEffect, useState } from "react";

import { propertyABI } from "../../constants/Property/propertyConstant";
import { useNotification } from "web3uikit";

const PropertyDetail = () => {
  //Pass data from property cards (explore the property in detail now)
  const location = useLocation();
  const { details } = location.state;

  const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
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
  } = details;

  // const { runContractFunction: getReview } = useWeb3Contract({
  //   abi: propertyABI,
  //   contractAddress: contractAddress,
  //   functionName: "getReview",
  //   params: {
  //     _index: i,
  //   },
  // });

  const { runContractFunction: getNoOfReviews } = useWeb3Contract({
    abi: propertyABI,
    contractAddress: contractAddress,
    functionName: "getNoOfReviews",
    params: {},
  });

  // const { runContractFunction: verifiedByLandlord } = useWeb3Contract({
  //   abi: propertyABI,
  //   contractAddress: contractAddress,
  //   functionName: "verifiedByLandlord",
  //   params: {
  //     _proposedTenantAddress: selectedTenantAddress,
  //   },
  // });

  // const { runContractFunction: getAddressVerifiedByOwner } = useWeb3Contract({
  //   abi: propertyABI,
  //   contractAddress: contractAddress,
  //   functionName: "getAddressVerifiedByOwner",
  //   params: {},
  // });

  const dispatch = useDispatch();
  const dispatchNotification = useNotification();

  const [i, setI] = useState(0);
  const [noOfReview, setNoOfReviews] = useState(0);
  const [reviewArr, setReviewArr] = useState([]);

  const [verifiedUser, setVerifiedUser] = useState("");

  // const [selectedTenantAddress, setSelectedTenantAddress] = useState("");

  const [applied, setApplied] = useState(false);
  const [disable, setDisable] = useState(false);
  const applyInterested = () => {
    dispatch(applyForTenant(_id, { userAddress: account }));
    setApplied(true);
  };

  // To get reviews and verifiedUser from contracts. IF verified user is still the owner, allow him to verify someone. but if someone is already verified, revoke that aciton    /////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (isWeb3Enabled) {
      getTotalReviews();
      // getTenantVerifiedByOwner();
    }
  }, [isWeb3Enabled]);

  // useEffect(() => {
  //   if (noOfReview !== 0) {
  //     getReviewFromContract();
  //   }
  // }, [noOfReview]);

  //To loop through reviews array in smart contract
  // useEffect(() => {
  //   if (i < noOfReview) {
  //     getReviewFromContract();
  //   }
  // }, [i]);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  //To disable the apply button without refreshing the page
  useEffect(() => {
    if (applied) {
      setDisable(true);
    }
  }, [applied]);

  /// For tenant verification

  // useState(() => {
  //   if (selectedTenantAddress !== "") {
  //     handleTenantVerification();
  //   }
  // }, [selectedTenantAddress]);

  //Get total no of reviews as soon as the page loads(web3 enabled)
  const getTotalReviews = async () => {
    const tempNoOfReviews = await getNoOfReviews({
      onError: (error) => console.log(error),
    });
    setNoOfReviews(tempNoOfReviews);
  };

  // const getReviewFromContract = async () => {
  //   const tempReview = await getReview({
  //     onError: (error) => console.log(error),
  //   });
  //   setReviewArr((prevArr) => [...prevArr, tempReview]);
  //   setI((prevI) => prevI + 1);
  // };

  // const getTenantVerifiedByOwner = async () => {
  //   const tempVerified = await getAddressVerifiedByOwner({
  //     onError: (error) => console.log(error),
  //   });
  //   setVerifiedUser(tempVerified);
  // };

  // const handleTenantVerification = async () => {
  //   await verifiedByLandlord({
  //     onError: (error) => console.log(error),
  //     onSuccess: handleSuccess,
  //   });
  // };

  const handleSuccess = async function (tx) {
    await tx.wait(1);

    //--------------check if interested tenant array should be cleared at verification or after the tenant pays security-----------//////

    // dispatch(clearInterestedTenants(_id));
    handleNotification();
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

  return (
    <div>
      {console.log(noOfReview)}
      {images.length === 1 ? (
        <img src={images[0]} alt="Property Image" />
      ) : (
        ///// ////////////////////////////add a carousel for multiple images/////////////////////////
        <div>multiple images</div>
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
      {/* <h2>Reviews : {reviewArr}</h2> */}
      {account === ownerAddress.toLowerCase() ? (
        ///check if someone is verified already or not
        ownerAddress !== ownerAddress ? (
          <h2>Verified Someone</h2>
        ) : (
          <div>
            <h2>
              Interested Users :
              {interestedUsers.map((userAdd) => {
                ///// CHECK THIS, WHAT TO DO AFTER VERIFICATION  ---->   At approval of tenant -> step 1. verifiedByLandlord of Contract, step 2. empty interested users array in mongodb, step 3. stop owner from making multiple users verified.
                ///// or set 1. verifiedByLandlord of smart contract , then other steps after tenant pays security. Not Allowing landlord to verify multiple users.
                return (
                  <Link to="/profile" state={{ userAccount: userAdd }}>
                    {userAdd} <br />
                    <button
                    // onClick={() => setSelectedTenantAddress(userAdd)}
                    >
                      Approve this for tenant
                    </button>
                  </Link>
                );
              })}
            </h2>
          </div>
        )
      ) : (
        <div>
          {onRent === true ? (
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
