// import { FETCH_ALL, CREATE, UPDATE, DELETE, LIKE } from '../constants/actionTypes';

export default (properties = [], action) => {
  switch (action.type) {
    case "FETCH_ALL":
    case "GET_PROPERTY":
      return action.payload;
    case "LIST_PROPERTY":
      return [...properties, action.payload];
    case "APPLY_INTERESTED":
    case "CLEAR_INTERESTED":
    case "MODIFIED_PROPERTY":
      return properties.map((property) =>
        property._id === action.payload._id ? action.payload : property
      );
    // case FETCH_ACTIVE:
    //   return action.payload;
    // case LIKE:
    //   return properties.map((post) =>
    //     post._id === action.payload._id ? action.payload : post
    //   );
    // case CREATE:
    //   return [...properties, action.payload];
    // case UPDATE:
    //   return properties.map((post) =>
    //     post._id === action.payload._id ? action.payload : post
    //   );
    // case DELETE:
    //   return properties.filter((post) => post._id !== action.payload);
    default:
      return properties;
  }
};
