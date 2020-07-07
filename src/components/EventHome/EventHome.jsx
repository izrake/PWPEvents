import "regenerator-runtime/runtime";
import React, { useState, useContext, useEffect } from "react";
import { StateContext, ActionContext } from "../../hooks";
import { Calendar, MapPin, Search } from "react-feather";
import { useHistory, Link } from "react-router-dom";
import textVersion from "textversionjs";
import "./EventHome.scss";
import Big from "big.js";
import { isJoined, isQuotaFilled } from "../../utils";
import { NuCypherService } from "../../services";
import Loader from "react-loader-spinner";
import GeoCode from "react-geocode";
import Select from "react-select";

const BOATLOAD_OF_GAS = Big(1)
  .times(10 ** 16)
  .toFixed();

// set Google Maps Geocoding API for purposes of quota management. Its optional but recommended.
GeoCode.setApiKey("{useyourkey}");

// set response language. Defaults to english.
GeoCode.setLanguage("en");

const EventHome = () => {
  const history = useHistory();
  const { contract, currentUser, wallet, userDetails, events } = useContext(
    StateContext
  );
  const { setModalConfig, setDecryptLocationEventUuid, setEvents } = useContext(
    ActionContext
  );

  const [loader, setLoader] = useState("");
  const [selectedOption, setSelectedOption] = useState({
    value: "all",
    label: "All Events",
  });
  const [options, setOptions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchEvents, setSearchEvents] = useState([]);

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
                  ).then((events) => {
                    setEvents(events);
                    setSearchEvents(events);
                  });
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
          setSearchEvents(events);
        });
      }
    }

    if (contract) {
      contract.getLocalities().then((data) => {
        console.log("Data", data);
        let filteredLocality = data
          .filter((loc, i) => data.indexOf(loc) === i)
          .filter((loc) => loc !== "")
          .map((loc) => ({ value: loc, label: loc }));
        filteredLocality = [
          { value: "all", label: "All Events" },
          ...filteredLocality,
        ];
        console.log(filteredLocality);
        setOptions(filteredLocality);
      });
    }

    return () => {
      navigator.geolocation.clearWatch(watchLocation);
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

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    if (contract) {
      if (selectedOption.value !== "all") {
        contract
          .getEventsByLocality({ locality: selectedOption.value })
          .then((eventUUIDs) => {
            Promise.all(
              eventUUIDs.map((eventUUID) =>
                contract.getEventByUUID({ uuid: eventUUID })
              )
            ).then((events) => {
              setEvents(events);
              setSearchEvents(events);
            });
          });
      } else {
        contract.getEvents().then((events) => {
          setEvents(events);
          setSearchEvents(events);
        });
      }
    }
  };

  const handleSearch = (search) => {
    console.log(search);
    setSearchText(search);
    const searchList = events.filter(
      (event) => event.title.toLowerCase().indexOf(search.toLowerCase()) !== -1
    );
    setSearchEvents(searchList);
  };

  return (
    <main className="event-home">
      <div className="home-container">
        <div>
          <h2>Discover Near Events</h2>
        </div>
        <div className="event-home-op-bar">
          <div className="event-home-search-bar-container">
            <Search />{" "}
            <input
              type="search"
              className="event-home-search-bar"
              placeholder="Search.."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select
            value={selectedOption}
            onChange={handleChange}
            options={options}
            placeholder="Search by location..."
            className="event-home-select-location"
          />
        </div>
        <ul className="event-list-container">
          {searchEvents.map((event, i) => (
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
      </div>
    </main>
  );
};

export default EventHome;
