import "regenerator-runtime/runtime";
import React, { useState, useContext, useEffect } from "react";
import { StateContext, ActionContext } from "../../hooks";
import { useParams, useHistory, Link } from "react-router-dom";
import "./EventSingle.scss";
import { Calendar, MapPin, Users } from "react-feather";
import Big from "big.js";
import textVersion from "textversionjs";
import {
  isJoined,
  isQuotaFilled,
  isDonationNeeded,
  convertTwoDigits,
} from "../../utils";
import { NuCypherService } from "../../services";
import Loader from "react-loader-spinner";
import Countdown from "react-countdown";

const BOATLOAD_OF_GAS = Big(1)
  .times(10 ** 16)
  .toFixed();

const EventSingle = () => {
  let { id } = useParams();
  const history = useHistory();

  const {
    contract,
    currentUser,
    userDetails,
    selectedEvent,
    events,
  } = useContext(StateContext);
  const {
    setSelectedEvent,
    setDecryptLocationEventUuid,
    setModalConfig,
  } = useContext(ActionContext);

  const [readMore, setReadMore] = useState(false);
  const [joinLoader, setJoinLoader] = useState(false);
  const [donationLoader, setDonationLoader] = useState("");

  useEffect(() => {
    if (id && contract) {
      reloadEvent();
    }
  }, [contract, id]);

  const joinEvent = (event) => {
    setJoinLoader(true);
    NuCypherService.assignPolicy(
      currentUser.accountId,
      userDetails.uuid,
      event.uuid,
      userDetails.publicEncKey,
      userDetails.publicSigKey
    )
      .then((data) => {
        console.log(data);
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
            reloadEvent();
            setJoinLoader(false);
          });
      })
      .catch((error) => console.log(error));
  };

  const reloadEvent = () => {
    if (events.length) {
      const selectedEvent = events.filter((event) => event.uuid === id)[0];
      Promise.all(
        selectedEvent.donationEvents.map((event) =>
          contract.getDonationEventByUUID({ donationEventUUID: event })
        )
      ).then((donationEvents) => {
        Promise.all(
          donationEvents.map((donationEvent) =>
            Promise.all(
              donationEvent.donations.map((donation) =>
                contract.getDonationByUUID({
                  donationUUID: donation,
                })
              )
            )
          )
        ).then((data) => {
          donationEvents.forEach((donationEvent, index) => {
            donationEvent.donations = data[index];
          });
          selectedEvent.donationEvents = donationEvents;
          setSelectedEvent(selectedEvent);
        });
        selectedEvent.donationEvents = donationEvents;
        console.log(selectedEvent);
        setSelectedEvent(selectedEvent);
      });
    } else {
      contract.getEventByUUID({ uuid: id }).then((event) => {
        Promise.all(
          event.donationEvents.map((donationsUUID) =>
            contract.getDonationEventByUUID({
              donationEventUUID: donationsUUID,
            })
          )
        ).then((donationEvents) => {
          Promise.all(
            donationEvents.map((donationEvent) =>
              Promise.all(
                donationEvent.donations.map((donation) =>
                  contract.getDonationByUUID({
                    donationUUID: donation,
                  })
                )
              )
            )
          ).then((data) => {
            donationEvents.forEach((donationEvent, index) => {
              donationEvent.donations = data[index];
            });
            event.donationEvents = donationEvents;
            console.log(event);
            setSelectedEvent(event);
          });
        });
      });
    }
  };

  const donateHere = (donation) => {
    setDonationLoader(donation.uuid);
    const randomID = (Math.random() * 1e32).toString(36).substring(0, 10);
    contract
      .donateEvent(
        {
          donationUUID: randomID,
          donationEventUUID: donation.uuid,
          donorsAddress: "0x7437461F372bEc2B1106EB87Fac96B93afEf791d",
          amount: "1",
        },
        BOATLOAD_OF_GAS
      )
      .then((data) => {
        console.log(data);
        setDonationLoader("");
        reloadEvent();
      });
  };

  const createDonation = () => {
    history.push(`/events/${selectedEvent.uuid}/create-donation`);
  };

  const openDonation = (donation) => {
    history.push(`/donations/${donation.uuid}`);
  };
  return (
    <main className="event-single">
      {selectedEvent && (
        <div className="event-single-container">
          <h1 className="event-single-title">{selectedEvent.title}</h1>
          {currentUser && selectedEvent.owner === currentUser.accountId && (
            <div className="top-margin-set event-single-owner-container">
              <p className="event-owner-content">
                You are the{" "}
                <span className="highlight-owner-content">owner</span> of this
                event, Need donations for your event!
              </p>
              <div className="event-single-create-donation-button-container">
                <button
                  className="event-single-create-donation-button"
                  onClick={(e) => createDonation()}
                >
                  Create Donation
                </button>
              </div>
            </div>
          )}
          <div className="event-single-progress-container">
            <div
              className="event-single-progress"
              style={{
                width:
                  ((selectedEvent.subscriber.length /
                    selectedEvent.minSubscribers) *
                    100 >
                  100
                    ? 100
                    : (selectedEvent.subscriber.length /
                        selectedEvent.minSubscribers) *
                      100) + "%",
              }}
            ></div>
          </div>
          <div className="event-single-progress-labels-container">
            <span className="event-single-progress-label">
              {selectedEvent.subscriber.length} joined
            </span>
            <span className="event-single-progress-label">
              {selectedEvent.minSubscribers} member goal
            </span>
          </div>
          <div className="event-single-event-details-container top-margin-set-more">
            <div className="event-single-event-details">
              <div className="top-margin-set event-single-date">
                <span className="event-single-date-icon">
                  <Calendar />
                </span>
                <span>{selectedEvent.date}</span>
              </div>
              <div className="top-margin-set event-single-date">
                <span className="event-single-date-icon">
                  <MapPin />
                </span>
                <span>
                  {selectedEvent.address ? (
                    selectedEvent.address
                  ) : !isJoined(selectedEvent, currentUser) ? (
                    "Visible to only joined member and after the quota is reached"
                  ) : !isQuotaFilled(selectedEvent) ? (
                    "Visible only after member goal is reached"
                  ) : (
                    <a
                      onClick={(e) => {
                        setDecryptLocationEventUuid(selectedEvent.uuid);
                        setModalConfig(true, { type: "upload-encryption" });
                      }}
                    >
                      Show Location
                    </a>
                  )}
                  {/* Los Angeles, CA, USA */}
                </span>
              </div>
            </div>
            <div className="event-single-join-button-container top-margin-set">
              <button
                className="event-single-join-button"
                disabled={isJoined(selectedEvent, currentUser) || !currentUser}
                onClick={(e) => joinEvent(selectedEvent)}
              >
                {joinLoader ? (
                  <Loader
                    type="Oval"
                    color="#FFF"
                    height={16}
                    width={16}
                    style={{ display: "flex" }}
                  />
                ) : isJoined(selectedEvent, currentUser) ? (
                  "Joined"
                ) : (
                  "Join"
                )}
              </button>
            </div>
          </div>
          <h2 className="top-margin-set-more event-single-purpose-title">
            Purpose of this event
          </h2>
          <div
            dangerouslySetInnerHTML={{ __html: selectedEvent.purpose }}
            className={`event-single-purpose ${
              readMore ? "event-single-purpose-read-more" : ""
            }`}
          />
          <div className="event-single-read-more-container top-margin-set">
            <span
              className="event-single-read-more-button"
              onClick={(e) => setReadMore(!readMore)}
            >
              {readMore ? "Read less" : "Read more"}
            </span>
          </div>
          {selectedEvent.donationEvents.length > 0 && (
            <>
              <h2 className="event-single-donation-list-title">
                Donations for this event
              </h2>
              <div className="event-single-donation-list-container">
                {selectedEvent.donationEvents.map((donationEvent, i) => (
                  <li className="donation-list-item" key={i}>
                    <div onClick={(e) => openDonation(donationEvent)}>
                      <h3 className="donation-list-item-title">
                        {donationEvent.title}
                      </h3>
                      <p className="donation-list-item-description">
                        {textVersion(donationEvent.purpose).substring(0, 128)}
                        ...{" "}
                        <Link to={`/donations/${donationEvent.uuid}`}>
                          [Read More]
                        </Link>
                      </p>
                      <div className="donation-list-item-progress-container">
                        <div
                          className="donation-list-item-progress"
                          style={{
                            width:
                              donationEvent.donations.length === 0
                                ? "0%"
                                : (Number.parseFloat(
                                    donationEvent.donations
                                      .map((donation) =>
                                        Number.parseFloat(donation.amount)
                                      )
                                      .reduce((prev, curr) => prev + curr)
                                  ) /
                                    Number.parseFloat(
                                      donationEvent.minAmount
                                    )) *
                                    100 +
                                  "%",
                          }}
                        ></div>
                      </div>
                      <div className="donation-list-item-progress-labels-container">
                        <span className="donation-list-item-progress-label">
                          $
                          {donationEvent.donations.length === 0
                            ? 0
                            : Number.parseFloat(
                                donationEvent.donations
                                  .map((donation) =>
                                    Number.parseFloat(donation.amount)
                                  )
                                  .reduce((prev, curr) => prev + curr)
                              )}{" "}
                          donated
                        </span>
                        <span className="donation-list-item-progress-label">
                          ${donationEvent.minAmount} goal
                        </span>
                      </div>
                      <div className="top-margin-set donation-list-item-date">
                        <span className="donation-list-item-date-icon">
                          <Calendar />
                        </span>
                        {/* <span>Valid till {donationEvent.validDate}</span> */}
                        <span>
                          {new Date(donationEvent.validDate).getTime() >
                          new Date().getTime() ? (
                            <Countdown
                              date={new Date(donationEvent.validDate)}
                              intervalDelay={0}
                              precision={0}
                              renderer={(props) => (
                                <div>
                                  {props.days} Days{" "}
                                  {convertTwoDigits(props.hours)}:
                                  {convertTwoDigits(props.minutes)}:
                                  {convertTwoDigits(props.seconds)} Time Left
                                </div>
                              )}
                            />
                          ) : (
                            "Donation validity has been expired"
                          )}
                        </span>
                      </div>
                      <div className="top-margin-set donation-list-item-date">
                        <span className="donation-list-item-date-icon">
                          <Users />
                        </span>
                        <span>
                          {donationEvent.donations.length} contributed
                        </span>
                      </div>
                    </div>
                    <div className="donation-list-item-join-button-container top-margin-set">
                      <button
                        className="donation-list-item-join-button"
                        disabled={
                          !isDonationNeeded(donationEvent) ||
                          (currentUser &&
                            donationEvent.owner === currentUser.accountId)
                        }
                        onClick={(e) => donateHere(donationEvent)}
                      >
                        {donationLoader === donationEvent.uuid ? (
                          <Loader
                            type="Oval"
                            color="#FFF"
                            height={16}
                            width={16}
                            style={{ display: "flex" }}
                          />
                        ) : (
                          "Donate"
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
};

export default EventSingle;
