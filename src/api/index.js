import axios from "axios";

const url = "http://localhost:5000/property";

export const fetchProperties = () => axios.get(url);
export const createProperty = (newProperty) => axios.post(url, newProperty);
export const applyInterested = (id, newInterestedUser) =>
  axios.patch(`${url}/${id}/applyInterested`, newInterestedUser);
