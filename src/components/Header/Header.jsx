import React, { useContext, useState } from "react";
import { StateContext } from "../../hooks";
import "./Header.scss";
import makeBlockie from "ethereum-blockies-base64";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const { currentUser, nearConfig, wallet } = useContext(StateContext);
  const [dropdownActive, setDropdownActive] = useState(false);

  const signIn = () => {
    console.log(wallet);
    wallet.requestSignIn(nearConfig.contractName, "NEAR Guest Book");
  };

  const signOut = () => {
    wallet.signOut();
    window.location = "/";
  };
  return (
    <header className="header" id="home">
      {location.pathname === "/" && (
        <div className="header-top-bar">
          Built on{" "}
          <a href="https://near.org/" target="_blank" rel="noopener noreferrer">
            NEAR
          </a>{" "}
          &{" "}
          <a
            href="https://www.nucypher.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            NuCypher
          </a>
          .
        </div>
      )}
      <div className="header-bar">
        <Link className="header-app-icon" to="/">
          PWPEvents.
        </Link>
        <div className="header-action-button-container">
          <div className="header-tabs">
            <Link to="/">Home</Link>
          </div>
          <div className="header-tabs">
            <Link to="/events">Explore Events</Link>
          </div>
          <div className="header-tabs">
            <Link to="/donations">Explore Donations</Link>
          </div>
          <div className="header-tabs">
            <Link to="/event-registration">Start an Event</Link>
          </div>
          <div className="header-tabs">
            {!currentUser ? (
              <button className="header-play-buttons" onClick={signIn}>
                Login
              </button>
            ) : (
              <img
                src={makeBlockie(currentUser.accountId)}
                alt="address-blockie"
                className="user-profile-blockie-icon"
                onClick={(e) => setDropdownActive(true)}
              />
            )}
          </div>
          {dropdownActive && (
            <div
              className="menu-overlay"
              onClick={(e) => setDropdownActive(false)}
            ></div>
          )}
          {dropdownActive && (
            <div className="toolbar-menu-box">
              <div
                className="toolbar-menu-box-item"
                onClick={(e) => {
                  setDropdownActive(false);
                }}
              >
                <Link className="toolbar-menu-box-item-title" to="/account">
                  Account Info
                </Link>
              </div>
              {/* <div
                className="toolbar-menu-box-item"
                onClick={(e) => {
                  setDropdownActive(false);
                }}
              >
                <Link className="toolbar-menu-box-item-title" to="/account">
                  View your Events
                </Link>
              </div>
              <div
                className="toolbar-menu-box-item"
                onClick={(e) => {
                  setDropdownActive(false);
                }}
              >
                <Link className="toolbar-menu-box-item-title" to="/account">
                  View your Donations
                </Link>
              </div> */}
              <div
                className="toolbar-menu-box-item"
                onClick={(e) => {
                  signOut();
                  setDropdownActive(false);
                }}
              >
                <span className="toolbar-menu-box-item-title">Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
