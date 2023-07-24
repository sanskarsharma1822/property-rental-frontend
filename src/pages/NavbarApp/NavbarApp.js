import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import ConnectWallet from "../ConnectWallet/ConnectWallet";

import logo from "../../images/full-logo.png";

function NavbarApp() {
  return (
    <Navbar
      expand="lg"
      style={{ paddingTop: "0.5em", backgroundColor: "#f5f5f5" }}
    >
      <Container fluid>
        <Navbar.Brand href="#">
          <img src={logo} width="250" height="77" alt="SoulEstate logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className=" ms-auto me-auto my-2 my-lg-0"
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/profile">Profile</Nav.Link>
            <Nav.Link href="/tenant">Current Property</Nav.Link>
            <Nav.Link href="/addProperty">Add Property</Nav.Link>
          </Nav>
          <Nav>
            <ConnectWallet />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarApp;
