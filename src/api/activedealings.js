import axios from "axios";

const url = "http://localhost:5000/activeproperties";

export const fetchActiveProperties = () => axios.get(url);
export const createActiveProperty = (newProperty) =>
  axios.post(url, newProperty);
