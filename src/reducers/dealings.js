export default (dealings = [], action) => {
  switch (action.type) {
    case "FETCH_ALL_ACTIVE":
      return action.payload;
    case "LIST_DEALING":
      return [...dealings, action.payload];
    case "FIND_DEALING":
      return action.payload;
    case "DELETE_DEALING":
      return dealings.filter((dealing) => dealing._id !== action.payload);
    //   case "APPLY_INTERESTED":
    //   case "CLEAR_INTERESTED":
    //     return properties.map((property) =>
    //       property._id === action.payload._id ? action.payload : property
    //     );
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
      return dealings;
  }
};
