import "regenerator-runtime/runtime";
import React, { useState, useContext, useEffect } from "react";
import { StateContext, ActionContext } from "../../hooks";
import { Calendar, Users } from "react-feather";
import { useHistory } from "react-router-dom";
import textVersion from "textversionjs";
import "./DonationHome.scss";
import Big from "big.js";
import { isDonationNeeded } from "../../utils";
import Loader from "react-loader-spinner";

const DonationHome = () => {
  const history = useHistory();
  const {
    contract,
    currentUser,
    wallet,
    userDetails,
    donationEvents,
  } = useContext(StateContext);
  const {
    setModalConfig,
    setSelectedDonationForDonate,
    setDonationEvents,
  } = useContext(ActionContext);

  const [loader, setLoader] = useState("");

  useEffect(() => {
    // TODO: don't just fetch once; subscribe!
    if (contract) {
      contract.getDonationEvents().then((donationEvents) => {
        console.log(donationEvents);
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
          console.log(donationEvents);
          setDonationEvents(donationEvents);
        });
      });
    }
  }, [contract]);

  const donateHere = (donation) => {
    setSelectedDonationForDonate(donation);
    setModalConfig(true, { type: "donate" });
    // setDonationLoader(donation.uuid);
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
    //     console.log(data);
    //     setDonationLoader("");
    //     reloadEvent();
    //   });
  };

  const openDonation = (donation) => {
    history.push(`/donations/${donation.uuid}`);
  };
  return (
    <main className="donation-home">
      <div className="home-container">
        <div>
          <h2>Discover Donations</h2>
        </div>
        <ul className="donation-list-container">
          {donationEvents.map((donationEvent, i) => (
            <li className="donation-list-item" key={i}>
              <div onClick={(e) => openDonation(donationEvent)}>
                <h3 className="donation-list-item-title">
                  {donationEvent.title}
                </h3>
                <p className="donation-list-item-description">
                  {textVersion(donationEvent.purpose).substring(0, 128)}
                  ... <a href="http://something.com">[Read More]</a>
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
                              Number.parseFloat(donationEvent.minAmount)) *
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
                  <span>Valid till {donationEvent.validDate}</span>
                </div>
                <div className="top-margin-set donation-list-item-date">
                  <span className="donation-list-item-date-icon">
                    <Users />
                  </span>
                  <span>{donationEvent.donations.length} contributed</span>
                </div>
              </div>
              <div className="donation-list-item-join-button-container top-margin-set">
                <button
                  className="donation-list-item-join-button"
                  disabled={
                    !isDonationNeeded(donationEvent) ||
                    donationEvent.owner === currentUser.accountId
                  }
                  onClick={(e) => donateHere(donationEvent)}
                >
                  {loader === donationEvent.uuid ? (
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
        </ul>
      </div>
    </main>
  );
};

export default DonationHome;
