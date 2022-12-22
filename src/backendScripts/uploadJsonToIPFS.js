import axios from "axios";
import console from "console-browserify";
const JWT = "Bearer " + process.env.REACT_APP_PINATA_JWT;

const uploadJsonToIPFS = async (propertyData) => {
  const { description, highlights, location, terms, imagesArr } = propertyData;
  console.log(imagesArr);
  const data = JSON.stringify({
    pinataOptions: {
      cidVersion: 1,
    },
    pinataMetadata: {
      name: "Property Data",
    },

    pinataContent: {
      description: description,
      highlights: highlights,
      location: location,
      terms: terms,
      imagesArr: imagesArr,
    },
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
