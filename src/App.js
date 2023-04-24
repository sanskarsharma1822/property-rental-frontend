//react
import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import { useDispatch } from "react-redux";
import { getProperties } from "./actions/property";

//pages
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import AddProperty from "./pages/AddProperty/AddProperty";
import PropertyDetail from "./pages/PropertyDetail/PropertyDetail";

//web3
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";

function App() {
  const dispatchAction = useDispatch();
  useEffect(() => {
    dispatchAction(getProperties());
  }, [dispatchAction]);
  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <div className="App">
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/addProperty" element={<AddProperty />} />
              <Route path="/propertyDetail" element={<PropertyDetail />} />
              {/* <Route path="/mainpage" element={<MainPage />} />
              <Route path="/brand" element={<Brand />} />
              <Route path="/brand/warehouse" element={<Warehouse />} />
              <Route path="/customer" element={<Customer />} />
              <Route path="*" element={<Error />} /> */}
            </Routes>
          </Router>
        </div>
      </NotificationProvider>
    </MoralisProvider>
  );
}

export default App;
