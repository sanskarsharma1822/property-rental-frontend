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
