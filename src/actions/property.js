import * as api from "../api/index";
import console from "console-browserify";

export const getProperties = () => async (dispatch) => {
  try {
    const { data } = await api.fetchProperties();
    dispatch({ type: "FETCH_ALL", payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const addNewProperty = (newProperty) => async (dispatch) => {
  try {
    const { data } = await api.createProperty(newProperty);
    dispatch({ type: "LIST_PROPERTY", payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const applyForTenant = (id, newInterestedUser) => async (dispatch) => {
  try {
    const { data } = await api.applyInterested(id, newInterestedUser);
    dispatch({ type: "APPLY_INTERESTED", payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const clearInterestedTenants = (id) => async (dispatch) => {
  try {
    const { data } = await api.clearInterested(id);
    dispatch({ type: "CLEAR_INTERESTED", payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const endPeriodChanges = (dataURI) => async (dispatch) => {
  try {
    const { data } = await api.endTenantChanges(dataURI);
    dispatch({ type: "MODIFIED_PROPERTY", payload: data });
  } catch (error) {
    console.log(error);
  }
};

// export const getProperty = (dataURI) => async (dispatch) => {
//   try {
//     const { data } = await api.checkStatus(dataURI);
//     console.log(data);
//     dispatch({ type: "GET_PROPERTY", payload: data });
//   } catch (error) {
//     console.log(error);
//   }
// };
