import "regenerator-runtime/runtime";
import React, { useState, useContext, useEffect } from "react";
import { StateContext, ActionContext } from "../../hooks";
import { Calendar, MapPin } from "react-feather";
import { useHistory, Link } from "react-router-dom";
import textVersion from "textversionjs";
import "./Home.scss";
import Big from "big.js";
import { isJoined, isQuotaFilled } from "../../utils";
import { NuCypherService } from "../../services";
import Loader from "react-loader-spinner";
import GeoCode from "react-geocode";
import AnchorLink from "react-anchor-link-smooth-scroll";

const BOATLOAD_OF_GAS = Big(1)
  .times(10 ** 16)
  .toFixed();

// set Google Maps Geocoding API for purposes of quota management. Its optional but recommended.
GeoCode.setApiKey("{useyourkey}");

// set response language. Defaults to english.
GeoCode.setLanguage("en");

const Home = () => {
  const history = useHistory();
  const { contract, currentUser, wallet, userDetails, events } = useContext(
    StateContext
  );
  const { setModalConfig, setDecryptLocationEventUuid, setEvents } = useContext(
    ActionContext
  );

  const [loader, setLoader] = useState("");

  useEffect(() => {
    // TODO: don't just fetch once; subscribe!
    let watchLocation = null;
    if ("geolocation" in window) {
      watchLocation = navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);
        GeoCode.fromLatLng(
          position.coords.latitude,
          position.coords.longitude
        ).then(
          (response) => {
            console.log(response.results);
            const address = response.results[0].address_components.filter(
              (address) => address.types[0] === "locality"
            )[0].long_name;
            console.log(address);
            if (contract) {
              contract
                .getEventsByLocality({ locality: address })
                .then((eventUUIDs) => {
                  Promise.all(
                    eventUUIDs.map((eventUUID) =>
                      contract.getEventByUUID({ uuid: eventUUID })
                    )
                  ).then((events) => setEvents(events));
                });
            }
          },
          (error) => {
            console.error(error);
          }
        );
      });
    } else {
      if (contract) {
        contract.getEvents().then((events) => {
          setEvents(events);
        });
      }
    }

    return () => {
      if (watchLocation) {
        navigator.geolocation.clearWatch(watchLocation);
      }
    };
  }, [contract]);

  const joinEvent = async (event) => {
    setLoader(event.uuid);
    NuCypherService.assignPolicy(
      currentUser.accountId,
      userDetails.uuid,
      event.uuid,
      userDetails.publicEncKey,
      userDetails.publicSigKey
    )
      .then((data) => {
        contract
          .subscribeEvent(
            {
              uuid: event.uuid,
              sender: currentUser.accountId,
              label: data.label,
              policyPubKey: data.policy_pub_key,
              policySigKey: data.policy_sig_key,
            },
            BOATLOAD_OF_GAS
          )
          .then((data) => {
            console.log(data);
            contract.getEvents().then((events) => {
              setEvents(events);
              setLoader("");
            });
          });
      })
      .catch((error) => console.log(error));
  };
  const openEvent = (event) => {
    history.push(`/events/${event.uuid}`);
  };

  return (
    <main className="home">
      <div className="home-header">
        <div className="home-header-content">
          <h1 className="home-header-content-title">Protest made private.</h1>
          <p className="home-header-content-description">
            Provide single platform for protest organizers to create events and
            allow others to join the event without publishing the location.
          </p>
          <div className="home-header-button-container">
            <button
              className="home-header-explore-button"
              onClick={(e) => history.push("/events")}
            >
              Explore Events
            </button>
            <button
              className="home-header-start-button"
              onClick={(e) => history.push("/event-registration")}
            >
              Start an Event
            </button>
          </div>
        </div>
      </div>
      <div className="home-container" id="events">
        <div>
          <h2>Discover Recent Events</h2>
        </div>
        <ul className="event-list-container">
          {events
            .filter((evt, i) => i < 4)
            .map((event, i) => (
              <li className="event-list-item" key={i}>
                <div onClick={(e) => openEvent(event)}>
                  <h3 className="event-list-item-title">{event.title}</h3>
                  <p className="event-list-item-description">
                    {textVersion(event.purpose).substring(0, 128)}...{" "}
                    <Link to={`/events/${event.uuid}`}>[Read More]</Link>
                  </p>
                  <div className="event-list-item-progress-container">
                    <div
                      className="event-list-item-progress"
                      style={{
                        width:
                          ((event.subscriber.length / event.minSubscribers) *
                            100 >
                          100
                            ? 100
                            : (event.subscriber.length / event.minSubscribers) *
                              100) + "%",
                      }}
                    ></div>
                  </div>
                  <div className="event-list-item-progress-labels-container">
                    <span className="event-list-item-progress-label">
                      {event.subscriber.length} joined
                    </span>
                    <span className="event-list-item-progress-label">
                      {event.minSubscribers} member goal
                    </span>
                  </div>
                  <div className="top-margin-set event-list-item-date">
                    <span className="event-list-item-date-icon">
                      <Calendar />
                    </span>
                    <span>{event.date}</span>
                  </div>
                </div>
                <div className="top-margin-set event-list-item-date">
                  <span className="event-list-item-date-icon">
                    <MapPin />
                  </span>
                  <span>
                    {event.address ? (
                      event.address
                    ) : !isJoined(event, currentUser) ? (
                      "Visible to only joined member and after the quota is reached"
                    ) : !isQuotaFilled(event) ? (
                      "Visible only after member goal is reached"
                    ) : (
                      <a
                        onClick={(e) => {
                          setDecryptLocationEventUuid(event.uuid);
                          setModalConfig(true, { type: "upload-encryption" });
                        }}
                      >
                        Show Location
                      </a>
                    )}
                    {/* Los Angeles, CA, USA */}
                  </span>
                </div>
                <div className="event-list-item-join-button-container top-margin-set">
                  <button
                    className="event-list-item-join-button"
                    disabled={isJoined(event, currentUser) || !currentUser}
                    onClick={(e) => joinEvent(event)}
                  >
                    {loader === event.uuid ? (
                      <Loader
                        type="Oval"
                        color="#FFF"
                        height={16}
                        width={16}
                        style={{ display: "flex" }}
                      />
                    ) : isJoined(event, currentUser) ? (
                      "Joined"
                    ) : (
                      "Join"
                    )}
                  </button>
                </div>
              </li>
            ))}
        </ul>
        <div
          className="event-single-read-more-container bottom-margin-set"
          onClick={() => history.push("/events")}
        >
          <span className="event-single-read-more-button">
            Explore more events
          </span>
        </div>
      </div>
      <div className="footer-section">
        <div className="footer-container">
          <div className="footer-app-section">
            <h1 className="footer-app-name">PWPEvents.</h1>
            <p>
              Built with{" "}
              <span role="img" aria-label="Purple heart">
                💜
              </span>{" "}
              in{" "}
              <a
                href="https://github.com/izrake/PWPEvents"
                target="_blank"
                rel="noopener noreferrer"
                className="open-source"
              >
                open-source
              </a>
              .
            </p>
          </div>
          <div className="footer-link-section">
            <h3 className="footer-link-header">Quick Links</h3>
            <ul className="footer-link-list">
              <li className="footer-link-item">
                <a
                  className="footer-link"
                  href="https://near.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NEAR
                </a>
              </li>
              <li className="footer-link-item">
                <a
                  className="footer-link"
                  href="https://www.nucypher.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NuCypher
                </a>
              </li>
              {/* <li className="footer-link-item">
                <a
                  className="footer-link"
                  href="https://www.arweave.org/get-involved/community"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Community
                </a>
              </li> */}
              <li className="footer-link-item">
                <a
                  className="footer-link"
                  href="https://github.com/izrake/PWPEvents/blob/master/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-link-section">
            <h3 className="footer-link-header">Navigations</h3>
            <ul className="footer-link-list">
              <li className="footer-link-item">
                <AnchorLink href="#home" className="footer-link">
                  Home
                </AnchorLink>
              </li>
              <li className="footer-link-item">
                <Link to="/events" className="footer-link">
                  Events
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/donations" className="footer-link">
                  Donations
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/event-registration" className="footer-link">
                  Create an Event
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
