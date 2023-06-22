import axios from "axios";

const url = "http://localhost:5000/activeproperties";

export const fetchActiveProperties = () => axios.get(url);
export const createActiveProperty = (newProperty) =>
  axios.post(url, newProperty);
export const checkIfTenant = (user) =>
  axios.get(`${url}/${user}/checkIfTenant`);

export const getDealingFromURI = (dataURI) => axios.get(`${url}/${dataURI}`);
export const removeDealing = (_id) => axios.delete(`${url}/${_id}`);
