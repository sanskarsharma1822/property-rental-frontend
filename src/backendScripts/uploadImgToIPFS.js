import axios from "axios";
import console from "console-browserify";
const JWT = "Bearer " + process.env.REACT_APP_PINATA_JWT;

const uploadImgToIPFS = async (selectedFile) => {
  let returnVal;
  const formData = new FormData();
  formData.append("file", selectedFile);

  const metadata = JSON.stringify({
    name: "Property Images",
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append("pinataOptions", options);

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: JWT,
        },
      }
    );
    returnVal = res.data;
  } catch (error) {
    console.log(error);
  }
  return returnVal;
};

export default uploadImgToIPFS;
