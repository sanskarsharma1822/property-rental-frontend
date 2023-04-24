import axios from "axios";
import console from "console-browserify";
const JWT = "Bearer " + process.env.REACT_APP_PINATA_JWT;

const uploadJsonToIPFS = async (_data) => {
  console.log(_data);
  const data = JSON.stringify({
    pinataOptions: {
      cidVersion: 1,
    },
    pinataMetadata: {
      name: "Property Rental Web3",
    },

    pinataContent: _data,
  });

  var config = {
    method: "post",
    url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    headers: {
      "Content-Type": "application/json",
      Authorization: JWT,
    },
    data: data,
  };

  const res = await axios(config);
  //   console.log(res.data);
  return res.data;
};

export default uploadJsonToIPFS;
