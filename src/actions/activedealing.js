import * as api from "../api/activedealings";
import console from "console-browserify";

export const getActiveProperties = () => async (dispatch) => {
  try {
    const { data } = await api.fetchActiveProperties();
    dispatch({ type: "FETCH_ALL_ACTIVE", payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const addNewDealing = (newProperty) => async (dispatch) => {
  try {
    const { data } = await api.createActiveProperty(newProperty);
    dispatch({ type: "LIST_DEALING", payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const checkIfUserIsTenant = (user) => async (dispatch) => {
  try {
    const { data } = await api.checkIfTenant(user);
    dispatch({ type: "FIND_DEALING", payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const getDealingUsingURI = (dataURI) => async (dispatch) => {
  const hash = dataURI.split("ipfs/").pop();
  try {
    const { data } = await api.getDealingFromURI(hash);
    dispatch({ type: "FIND_DEALING", payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const deleteDealing = (_id) => async (dispatch) => {
  try {
    const { data } = await api.removeDealing(_id);
    dispatch({ type: "DELETE_DEALING", payload: data });
  } catch (error) {
    console.log(error);
  }
};
