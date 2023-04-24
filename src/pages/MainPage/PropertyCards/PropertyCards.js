import { Link } from "react-router-dom";
import console from "console-browserify";
const PropertyCards = ({ property }) => {
  return (
    <div>
      <img src={property.images[0]} alt="Property Image"></img>
      <h2>Rent : {property.rent} </h2>
      <h2>Security : {property.security}</h2>
      <h2>State : {property.state}</h2>
      <h2>Description : {property.description}</h2>
      <button>
        <Link to="/propertyDetail" state={{ details: property }}>
          Explore More
        </Link>
      </button>
    </div>
  );
};

export default PropertyCards;
