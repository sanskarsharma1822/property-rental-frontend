import { useEffect } from "react";
import { Link } from "react-router-dom";
import console from "console-browserify";
import "./PropertyCards.css";

import { Row, Col, Container, Button } from "react-bootstrap";

import SquareFootIcon from "@mui/icons-material/SquareFoot";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GroupIcon from "@mui/icons-material/Group";
import ChairIcon from "@mui/icons-material/Chair";
import ApartmentIcon from "@mui/icons-material/Apartment";

const PropertyCards = ({ property, isVisible }) => {
  useEffect(() => {
    if (isVisible) {
      // Apply your animation logic here
      // For example, you can add a class to the card to trigger CSS animations
      document.getElementById(property._id).classList.add("flyInAnimation");
    }
  }, [isVisible, property._id]);

  return (
    <Container className="propertyCardMainContainer" id={property._id}>
      <Row className="propertyCardMainRow">
        <Col xs={12} md={3} className="propertyCardImageContainer">
          <img
            src={property.images[0]}
            alt="Property Image"
            className="propertyCardImage"
          ></img>
        </Col>
        <Col xs={12} md={7} className="propertyCardDataContainer">
          <div className="propertyCardDataHeading">4BHK in Delhi</div>
          <div className="propertyCardDataLocation">
            {/* {" "}
            <LocationOnIcon /> */}
            62/F-25, Sector-7, Rohini, Delhi-110085
          </div>
          <Container className="propertyCardFeaturesContainer">
            <Row className="propertyCardFeaturesRow">
              <Col>
                <Row>
                  <Col xs={2} className="propertyCardFeaturesIcon">
                    <ApartmentIcon />
                  </Col>
                  <Col>
                    <div className="propertyCardFeaturesHeading">Floor</div>
                    <div className="propertyCardFeaturesValue">4th</div>
                  </Col>
                </Row>
              </Col>
              <Col
                style={{
                  borderLeft: "2px solid #777777",
                  borderRight: "2px solid #777777",
                }}
              >
                <Row>
                  <Col xs={2} className="propertyCardFeaturesIcon">
                    <ChairIcon />
                  </Col>
                  <Col>
                    <div className="propertyCardFeaturesHeading">
                      Furnishing
                    </div>
                    <div className="propertyCardFeaturesValue">
                      Semi-Furnished
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Row>
                  <Col xs={2} className="propertyCardFeaturesIcon">
                    <GroupIcon />
                  </Col>
                  <Col>
                    <div className="propertyCardFeaturesHeading">
                      Tenant Preferred
                    </div>
                    <div className="propertyCardFeaturesValue">
                      Bachelors/Family
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className="propertyCardFeaturesRow">
              <Col>
                <Row>
                  <Col xs={2} className="propertyCardFeaturesIcon">
                    <EventAvailableIcon />
                  </Col>
                  <Col>
                    <div className="propertyCardFeaturesHeading">
                      Availability
                    </div>
                    <div className="propertyCardFeaturesValue">Immediately</div>
                  </Col>
                </Row>
              </Col>
              <Col
                style={{
                  borderLeft: "2px solid #777777",
                  borderRight: "2px solid #777777",
                }}
              >
                <Row>
                  <Col xs={2} className="propertyCardFeaturesIcon">
                    <LocalParkingIcon />
                  </Col>
                  <Col className="propertyCardFeaturesText">
                    <div className="propertyCardFeaturesHeading">
                      Car Parking
                    </div>
                    <div className="propertyCardFeaturesValue">1 Open</div>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Row>
                  <Col xs={2} className="propertyCardFeaturesIcon">
                    <SquareFootIcon />
                  </Col>
                  <Col>
                    <div className="propertyCardFeaturesHeading">
                      Carpet Area
                    </div>
                    <div className="propertyCardFeaturesValue">250 sqft</div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
          <div className="propertyCardDescription">
            This is the property description...
          </div>
          {/* <h2>Rent : {property.rent} </h2>
          <h2>Security : {property.security}</h2>
          <h2>State : {property.state}</h2>
          <h2>Description : {property.description}</h2> */}
        </Col>
        <Col xs={12} md={2} className="propertyCardExploreContainer">
          <div className="propertyCardImpDiv">
            <div className="propertyCardImpHeading">Rent (per mo.)</div>{" "}
            <div className="propertyCardImpValue">2 ETH</div>
          </div>
          <div className="propertyCardImpDiv">
            <div className="propertyCardImpHeading">Security </div>{" "}
            <div className="propertyCardImpValue">5 ETH</div>
          </div>
          <Link to="/propertyDetail" state={{ details: property }}>
            <Button variant="success" className="propertyCardExploreMore">
              Explore More
            </Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default PropertyCards;
