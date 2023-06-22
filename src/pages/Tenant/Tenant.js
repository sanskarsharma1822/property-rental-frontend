import console from "console-browserify";
import { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import { useMoralis } from "react-moralis";

import { checkIfUserIsTenant } from "../../actions/activedealing";

import Dealings from "../Dealings/Dealings";
import "./Tenant.css";

const Tenant = () => {
  //check if user is tenant at any property. if yes, then send property data to dealings page
  const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const dealing = useSelector((state) => state.dealings);

  const dispatch = useDispatch();
  useEffect(() => {
    if (isWeb3Enabled) {
      handleIsUserTenant();
    }
  }, [isWeb3Enabled]);

  const handleIsUserTenant = async () => {
    const tempIsUserTenant = dispatch(checkIfUserIsTenant(account));
  };

  return (
    <div className="container">
      {Array.isArray(dealing) ? (
        <div className="loading">Loading</div>
      ) : dealing === null ? (
        <div className="message">You are not a tenant</div>
      ) : (
        <div className="dealings-container">
          <Dealings isTenant={true} />
        </div>
      )}
      {/* {dealing == [] ? <div>Loading</div> : (dealing === null
      <div>You are not a tenant</div>:<Dealings isTenant={true} /> */}
    </div>
  );
};

export default Tenant;
