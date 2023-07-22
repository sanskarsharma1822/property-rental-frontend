//react
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import { useDispatch } from "react-redux";
import { getProperties } from "./actions/property";

//pages
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import AddProperty from "./pages/AddProperty/AddProperty";
import PropertyDetail from "./pages/PropertyDetail/PropertyDetail";
import Tenant from "./pages/Tenant/Tenant";
import NavbarApp from "./pages/NavbarApp/NavbarApp";

//web3
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";
import OwnerManagement from "./pages/OwnerManagement/OwnerManagement";
import DealTokenData from "./pages/DealTokenData/DealTokenData";

function App() {
  const dispatchAction = useDispatch();
  useEffect(() => {
    dispatchAction(getProperties());
  }, [dispatchAction]);
  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/addProperty" element={<AddProperty />} />
            <Route path="/propertyDetail" element={<PropertyDetail />} />
            <Route path="/tenant" element={<Tenant />} />
            <Route path="/ownerManagement" element={<OwnerManagement />} />
            <Route path="/dealTokenData" element={<DealTokenData />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </MoralisProvider>
  );
}

export default App;
