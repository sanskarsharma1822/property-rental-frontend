import console from "console-browserify";
import { useLocation } from "react-router-dom";
import { useMoralis, useWeb3Contract } from "react-moralis";

import { useDispatch } from "react-redux";
import { applyForTenant } from "../../actions/property";
import { useEffect, useState } from "react";

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

  const dispatch = useDispatch();

  const [applied, setApplied] = useState(false);
  const [disable, setDisable] = useState(false);
  const applyInterested = () => {
    dispatch(applyForTenant(_id, { userAddress: account }));
    setApplied(true);
  };

  //To disable the apply button without refreshing the page
  useEffect(() => {
    if (applied) {
      setDisable(true);
    }
  }, [applied]);
  return (
    <div>
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
      {account === ownerAddress.toLowerCase() ? (
        <div>
          <h2>Interested Users : {interestedUsers}</h2>
        </div>
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
