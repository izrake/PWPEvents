import "regenerator-runtime/runtime";
import React, { useState, useContext } from "react";
import { StateContext, ActionContext } from "../../hooks";
import "./EventRegistration.scss";
import { ChevronRight, Check } from "react-feather";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PlacesAutocomplete from "react-places-autocomplete";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { useHistory } from "react-router-dom";
import Big from "big.js";
import { NuCypherService } from "../../services";
import Loader from "react-loader-spinner";
import { store } from "react-notifications-component";

const BOATLOAD_OF_GAS = Big(1)
  .times(10 ** 16)
  .toFixed();

const EventRegistration = () => {
  const history = useHistory();

  const { contract, currentUser, nearConfig, wallet } = useContext(
    StateContext
  );
  const [eventTitle, setEventTitle] = useState("");
  const [eventPurpose, setEventPurpose] = useState(EditorState.createEmpty());
  const [startDate, setStartDate] = useState(new Date());
  const [eventAddress, setEventAddress] = useState("");
  const [eventLatLng, setEventLatLng] = useState({ lat: 0, lng: 0 });
  const [eventMinParticipant, setEventMinParticipant] = useState("");
  const [eventRegistrationProgress, setEventRegistrationProgress] = useState(1);
  const [loader, setLoader] = useState(false);

  const submitEvent = async () => {
    if (isEmptyField()) {
      setLoader(true);
      try {
        const randomID = (Math.random() * 1e32).toString(36).substring(0, 10);
        const enc_data = JSON.stringify({
          address: eventAddress.toString(),
          latitude: eventLatLng.lat.toString(),
          longitude: eventLatLng.lng.toString(),
        });
        await NuCypherService.encryptData(
          enc_data,
          currentUser.accountId,
          randomID
        );
        contract
          .addEvent(
            {
              uuid: randomID,
              title: eventTitle,
              purpose: draftToHtml(
                convertToRaw(eventPurpose.getCurrentContent())
              ),
              date: startDate.toString(),
              minSubscribers: eventMinParticipant.toString(),
              sender: currentUser.accountId,
            },
            BOATLOAD_OF_GAS
          )
          .catch((err) => {
            console.log(err);
            setLoader(false);
          })
          .then((data) => {
            console.log(data);
            setLoader(false);
            history.push("/");
          });
      } catch (err) {
        console.error(err);
        setLoader(false);
      }
    } else {
      store.addNotification({
        title: "Error!",
        message: "please fill up every fields before submitting",
        type: "danger",
        insert: "top",
        container: "top-right",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 5000,
          onScreen: true,
        },
      });
    }
  };

  const handleChange = (address) => {
    setEventAddress(address);
  };

  const handleSelect = (address) => {
    setEventAddress(address);
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => {
        setEventLatLng(latLng);
      })
      .catch((error) => console.error("Error", error));
  };

  const isEmptyField = () => {
    if (
      !eventTitle &&
      eventPurpose !== EditorState.createEmpty() &&
      !eventAddress &&
      !eventMinParticipant
    )
      return true;
    return false;
  };

  return (
    <main className="event-registration">
      <div className="event-registration-container">
        {currentUser ? (
          <div className="event-registration-form">
            <div className="event-registration-progress-bar">
              {eventRegistrationProgress <= 1 ? (
                <div
                  className={`event-registration-progress-number ${
                    eventRegistrationProgress === 1 ? "active" : ""
                  }`}
                  onClick={(e) => setEventRegistrationProgress(1)}
                >
                  1
                </div>
              ) : (
                <div
                  className="event-registration-progress-done"
                  onClick={(e) => setEventRegistrationProgress(1)}
                >
                  <Check />
                </div>
              )}
              {eventRegistrationProgress <= 2 ? (
                <div
                  className={`event-registration-progress-number ${
                    eventRegistrationProgress === 2 ? "active" : ""
                  }`}
                  onClick={(e) => setEventRegistrationProgress(2)}
                >
                  2
                </div>
              ) : (
                <div
                  className="event-registration-progress-done"
                  onClick={(e) => setEventRegistrationProgress(2)}
                >
                  <Check />
                </div>
              )}
              {eventRegistrationProgress <= 3 ? (
                <div
                  className={`event-registration-progress-number ${
                    eventRegistrationProgress === 3 ? "active" : ""
                  }`}
                  onClick={(e) => setEventRegistrationProgress(3)}
                >
                  3
                </div>
              ) : (
                <div
                  className="event-registration-progress-done"
                  onClick={(e) => setEventRegistrationProgress(3)}
                >
                  <Check />
                </div>
              )}
              {eventRegistrationProgress <= 4 ? (
                <div
                  className={`event-registration-progress-number ${
                    eventRegistrationProgress === 4 ? "active" : ""
                  }`}
                  onClick={(e) => setEventRegistrationProgress(4)}
                >
                  4
                </div>
              ) : (
                <div
                  className="event-registration-progress-done"
                  onClick={(e) => setEventRegistrationProgress(4)}
                >
                  <Check />
                </div>
              )}
              {eventRegistrationProgress <= 5 ? (
                <div
                  className={`event-registration-progress-number ${
                    eventRegistrationProgress === 5 ? "active" : ""
                  }`}
                  onClick={(e) => setEventRegistrationProgress(5)}
                >
                  5
                </div>
              ) : (
                <div
                  className="event-registration-progress-done"
                  onClick={(e) => setEventRegistrationProgress(5)}
                >
                  <Check />
                </div>
              )}
            </div>
            {eventRegistrationProgress === 1 && (
              <div className="event-registration-form-item">
                <h1 className="event-form-title">Write your event title</h1>
                <p className="event-form-description">
                  This is the first thing people will see about your event. Get
                  their attention with a short title that focusses on the change
                  you’d like them to support.
                </p>
                <input
                  type="text"
                  className="form-control-input"
                  placeholder="What do you want to do?"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
                <div className="event-registration-next-button-container">
                  <button
                    type="button"
                    className="event-registration-next-button"
                    onClick={(e) => setEventRegistrationProgress(2)}
                  >
                    Next
                    <ChevronRight />
                  </button>
                </div>
              </div>
            )}
            {eventRegistrationProgress === 2 && (
              <div className="event-registration-form-item">
                <h1 className="event-form-title">
                  Explain the purpose of your event
                </h1>
                <p className="event-form-description">
                  People are more likely to join your event if it’s clear why
                  you care. Explain how this event will impact you, your family,
                  or your community.
                </p>
                <Editor
                  editorState={eventPurpose}
                  wrapperClassName="event-purpose-wrapper"
                  editorClassName="event-purpose-editor"
                  onEditorStateChange={(e) => setEventPurpose(e)}
                />
                <div className="event-registration-next-button-container">
                  <button
                    type="button"
                    className="event-registration-next-button"
                    onClick={(e) => setEventRegistrationProgress(3)}
                  >
                    Next
                    <ChevronRight />
                  </button>
                </div>
              </div>
            )}
            {eventRegistrationProgress === 3 && (
              <div className="event-registration-form-item">
                <h1 className="event-form-title">
                  When do you wanna hold the event?
                </h1>
                <p className="event-form-description">
                  This is required to let the event supporter to show up on the
                  event on the date you specified
                </p>
                <div className="event-form-date-picker">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                  />
                </div>
                <div className="event-registration-next-button-container">
                  <button
                    type="button"
                    className="event-registration-next-button"
                    onClick={(e) => setEventRegistrationProgress(4)}
                  >
                    Next
                    <ChevronRight />
                  </button>
                </div>
              </div>
            )}
            {eventRegistrationProgress === 4 && (
              <div className="event-registration-form-item">
                <h1 className="event-form-title">
                  Minimum number of people is required to start the event?
                </h1>
                <p className="event-form-description">
                  This is required to let the event supporter to fulfil the
                  quota for starting event and let them know where the event is
                  organized when the minimum number is reached
                </p>
                <input
                  type="number"
                  className="form-control-input"
                  placeholder="Minimum people you expect to attend"
                  value={eventMinParticipant}
                  onChange={(e) => setEventMinParticipant(e.target.value)}
                />
                <div className="event-registration-next-button-container">
                  <button
                    type="button"
                    className="event-registration-next-button"
                    onClick={(e) => setEventRegistrationProgress(5)}
                  >
                    Next
                    <ChevronRight />
                  </button>
                </div>
              </div>
            )}
            {eventRegistrationProgress === 5 && (
              <div className="event-registration-form-item">
                <h1 className="event-form-title">
                  Where do you wanna hold the event?
                </h1>
                <p className="event-form-description">
                  This is required to let the event supporter know where the
                  event is being held. But don't worry this won't be revealed
                  until the event minimum member reached the quota.
                </p>
                <div className="event-form-date-picker">
                  <PlacesAutocomplete
                    value={eventAddress}
                    onChange={handleChange}
                    onSelect={handleSelect}
                  >
                    {({
                      getInputProps,
                      suggestions,
                      getSuggestionItemProps,
                      loading,
                    }) => (
                      <div>
                        <input
                          {...getInputProps({
                            placeholder: "Search Places ...",
                            className: "location-search-input",
                          })}
                        />
                        <div className="autocomplete-dropdown-container">
                          {loading && <div>Loading...</div>}
                          {suggestions.map((suggestion) => {
                            const className = suggestion.active
                              ? "suggestion-item--active"
                              : "suggestion-item";
                            // inline style for demonstration purpose
                            const style = suggestion.active
                              ? {
                                  backgroundColor: "#fafafa",
                                  cursor: "pointer",
                                  padding: "12px 8px",
                                  borderBottom: "1px solid #c7c7c7",
                                }
                              : {
                                  backgroundColor: "#ffffff",
                                  cursor: "pointer",
                                  padding: "12px 8px",
                                  borderBottom: "1px solid #c7c7c7",
                                };
                            return (
                              <div
                                {...getSuggestionItemProps(suggestion, {
                                  className,
                                  style,
                                })}
                              >
                                <span>{suggestion.description}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </PlacesAutocomplete>
                </div>
                <div className="event-registration-next-button-container">
                  <button
                    type="button"
                    className="event-registration-next-button"
                    onClick={submitEvent}
                  >
                    {loader ? (
                      <Loader
                        type="Oval"
                        color="#FFF"
                        height={16}
                        width={16}
                        style={{ display: "flex" }}
                      />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>Please login to create a new event</div>
        )}

        {/* {!!events.length && (
          <>
            <h2>Events</h2>
            {events.map((event, i) => (
              // TODO: format as cards, add timestamp
              <p key={i} className="is-premium">
                <strong>{event.sender}</strong>:<br />
                Title: {event.title}
                <br />
                Purpose: {event.purpose}
              </p>
            ))}
          </>
        )} */}
      </div>
    </main>
  );
};

export default EventRegistration;
