import "regenerator-runtime/runtime";
import React, { useState, useContext, useEffect } from "react";
import { StateContext, ActionContext } from "../../hooks";
import { useParams, useHistory } from "react-router-dom";
import "./DonationSingle.scss";
import { Calendar, Users } from "react-feather";
import Big from "big.js";
import {
  isJoined,
  isQuotaFilled,
  isDonationNeeded,
  convertTwoDigits,
} from "../../utils";
import Loader from "react-loader-spinner";
import Countdown from "react-countdown";

const DonationSingle = () => {
  let { id } = useParams();
  const history = useHistory();

  const { contract, currentUser, userDetails, selectedDonation } = useContext(
    StateContext
  );
  const {
    setSelectedDonation,
    setModalConfig,
    setSelectedDonationForDonate,
  } = useContext(ActionContext);

  const [readMore, setReadMore] = useState(false);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (id && contract) {
      contract
        .getDonationEventByUUID({ donationEventUUID: id })
        .then((donationEvent) => {
          Promise.all(
            donationEvent.donations.map((donation) =>
              contract.getDonationByUUID({
                donationUUID: donation,
              })
            )
          ).then((donations) => {
            console.log(donations);
            donationEvent.donations = donations;
            console.log(donationEvent);
            setSelectedDonation(donationEvent);
          });
        });
    }
  }, [contract, id]);

  const donateHere = (donation) => {
    setSelectedDonationForDonate(donation);
    setModalConfig(true, { type: "donate" });
    // setLoader(true);
    // const randomID = (Math.random() * 1e32).toString(36).substring(0, 10);
    // contract
    //   .donateEvent(
    //     {
    //       donationUUID: randomID,
    //       donationEventUUID: donation.uuid,
    //       donorsAddress: "0x7437461F372bEc2B1106EB87Fac96B93afEf791d",
    //       amount: "1",
    //     },
    //     BOATLOAD_OF_GAS
    //   )
    //   .then((data) => {
    //     contract
    //       .getDonationEventByUUID({ donationEventUUID: id })
    //       .then((donationEvent) => {
    //         Promise.all(
    //           donationEvent.donations.map((donation) =>
    //             contract.getDonationByUUID({
    //               donationUUID: donation,
    //             })
    //           )
    //         ).then((donations) => {
    //           console.log(donations);
    //           donationEvent.donations = donations;
    //           console.log(donationEvent);
    //           setSelectedDonation(donationEvent);
    //           setLoader(false);
    //         });
    //       });
    //   });
  };

  const createDonation = () => {
    history.push(`/events/${selectedDonation.mainEventUUID}/create-donation`);
  };

  return (
    <main className="event-single">
      {selectedDonation && (
        <div className="event-single-container">
          <h1 className="event-single-title">{selectedDonation.title}</h1>
          {selectedDonation.owner === currentUser.accountId && (
            <div className="top-margin-set event-single-owner-container">
              <p className="event-owner-content">
                You are the{" "}
                <span className="highlight-owner-content">owner</span> of this
                donation, Need more donations for your event!
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
                  (Number.parseFloat(
                    selectedDonation.donations
                      .map((donation) => Number.parseFloat(donation.amount))
                      .reduce((prev, curr) => prev + curr)
                  ) /
                    Number.parseFloat(selectedDonation.minAmount)) *
                    100 +
                  "%",
              }}
            ></div>
          </div>
          <div className="event-single-progress-labels-container">
            <span className="event-single-progress-label">
              $
              {Number.parseFloat(
                selectedDonation.donations
                  .map((donation) => Number.parseFloat(donation.amount))
                  .reduce((prev, curr) => prev + curr)
              )}{" "}
              donated
            </span>
            <span className="event-single-progress-label">
              ${selectedDonation.minAmount} goal
            </span>
          </div>
          <div className="event-single-event-details-container top-margin-set-more">
            <div className="event-single-event-details">
              <div className="top-margin-set event-single-date">
                <span className="event-single-date-icon">
                  <Calendar />
                </span>
                {/* <span>Valid till {selectedDonation.validDate}</span> */}
                <span>
                  <Countdown
                    date={new Date(selectedDonation.validDate)}
                    intervalDelay={0}
                    precision={0}
                    renderer={(props) => (
                      <div>
                        {props.days} Days {convertTwoDigits(props.hours)}:
                        {convertTwoDigits(props.minutes)}:
                        {convertTwoDigits(props.seconds)} Left
                      </div>
                    )}
                  />
                </span>
              </div>
              <div className="top-margin-set event-single-date">
                <span className="event-single-date-icon">
                  <Users />
                </span>
                <span>{selectedDonation.donations.length} contributed</span>
              </div>
            </div>
            <div className="event-single-join-button-container top-margin-set">
              <button
                className="event-single-join-button"
                disabled={
                  !isDonationNeeded(selectedDonation) ||
                  selectedDonation.owner === currentUser.accountId
                }
                onClick={(e) => donateHere(selectedDonation)}
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
                  "Donate"
                )}
              </button>
            </div>
          </div>
          <h2 className="top-margin-set-more event-single-purpose-title">
            Purpose of this donation
          </h2>
          <div
            dangerouslySetInnerHTML={{ __html: selectedDonation.purpose }}
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
        </div>
      )}
    </main>
  );
};

export default DonationSingle;
