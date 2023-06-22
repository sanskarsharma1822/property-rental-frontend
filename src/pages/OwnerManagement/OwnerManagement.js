import console from "console-browserify";
import { Link, useLocation } from "react-router-dom";

import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { checkStatus } from "../../api";

import { getDealingUsingURI } from "../../actions/activedealing";
import Dealings from "../Dealings/Dealings";

const OwnerManagement = () => {
  const location = useLocation();
  const { details } = location.state;

  const dealings = useSelector((state) => state.dealings);

  const dispatchToServer = useDispatch();

  const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);

  const [rentStatus, setRentStatus] = useState(-1);

  useEffect(() => {
    if (isWeb3Enabled) {
      handleInitial();
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    if (rentStatus === true) {
      console.log(rentStatus);
      dispatchToServer(getDealingUsingURI(details));
    }
  }, [rentStatus]);

  const handleInitial = async () => {
    const hash = details.split("ipfs/").pop();
    const property = await checkStatus(hash);
    const tempRentStatus = property.data.onRent;
    console.log(tempRentStatus);
    setRentStatus(tempRentStatus);
  };
  console.log(dealings);
  return (
    <div>
      <nav>
        <div>
          <Link to="/profile">Back To Profile</Link>
        </div>
      </nav>
      {rentStatus == -1 ? (
        <div>Loading</div>
      ) : (
        <div>
          {rentStatus == false ? (
            <div>Not on rent</div>
          ) : Array.isArray(dealings) ? (
            <div>load</div>
          ) : (
            <Dealings />
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerManagement;
