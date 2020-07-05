import "regenerator-runtime/runtime";
import React, { useEffect } from "react";
import "./App.scss";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./components/Home";
import EventRegistration from "./components/EventRegistration";
import UserRegistration from "./components/UserRegistration";
import { StateContext, ActionContext } from "./hooks";
import Header from "./components/Header";
import Modal from "./components/Modal/Modal";
import EventSingle from "./components/EventSingle/EventSingle";
import DonationRegistration from "./components/DonationRegistration";
import DonationSingle from "./components/DonationSingle";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import DonationHome from "./components/DonationHome";

const App = ({ contract, currentUser, nearConfig, wallet }) => {
  const { loadNearConfig, setModalConfig, setUserDetails } = React.useContext(
    ActionContext
  );
  useEffect(() => {
    console.log(contract);
    loadNearConfig(contract, currentUser, nearConfig, wallet);
    if (contract && currentUser) {
      console.log(currentUser.accountId);
      contract
        .getUserBySender({ currentUser: currentUser.accountId.toString() })
        .then((user) => {
          console.log(user);
          if (!user.isRegistered) {
            setModalConfig(true, { type: "registration" });
          }
          setUserDetails(user);
        });
    }
    // setModalConfig(true, { type: "user-encryption" })
  }, [contract, currentUser, nearConfig, wallet]);

  return (
    <div className="App">
      <Router>
        <Header />
        <Modal />
        <Route path="/" exact render={() => <Home />} />
        <Route path="/donations" exact render={() => <DonationHome />} />
        <Route path="/events/:id" exact render={() => <EventSingle />} />
        <Route path="/donations/:id" exact render={() => <DonationSingle />} />
        <Route
          path="/event-registration"
          exact
          render={() => <EventRegistration />}
        />
        <Route
          path="/events/:id/create-donation"
          exact
          render={() => <DonationRegistration />}
        />
        <Route
          path="/user-registration"
          exact
          render={() => <UserRegistration />}
        />
      </Router>
    </div>
  );
};

export default App;
