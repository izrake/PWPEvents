import "regenerator-runtime/runtime";
import React, { useState, useContext } from "react";
import { StateContext, ActionContext } from "../../hooks";
import { Heart } from "react-feather";
import Loader from "react-loader-spinner";
import "./DonateWidget.scss";

const DonateWidget = () => {
  const { selectedDonationForDonate, currentUser } = useContext(StateContext);
  // Download mnemonic file

  const [amount, setAmount] = useState("");
  const [loader, setLoader] = useState(false);

  const donate = () => {
    setLoader(true);
    const randomID = (Math.random() * 1e32).toString(36).substring(0, 10);
    contract
      .donateEvent(
        {
          donationUUID: randomID,
          donationEventUUID: donation.uuid,
          donorsAddress: "0x7437461F372bEc2B1106EB87Fac96B93afEf791d",
          amount,
        },
        BOATLOAD_OF_GAS
      )
      .then((data) => {
        console.log(data);
        setDonationLoader(false);
        setModalConfig(false, { type: "" });
      });
  };
  return (
    <div className="donate-widget">
      <h1 className="donate-widget-title">{selectedDonationForDonate.title}</h1>
      <div className="donate-widget-progress-container">
        <div
          className="donate-widget-progress"
          style={{
            width: selectedDonationForDonate.donations.length
              ? (Number.parseFloat(
                  selectedDonationForDonate.donations
                    .map((donation) => Number.parseFloat(donation.amount))
                    .reduce((prev, curr) => prev + curr)
                ) /
                  Number.parseFloat(selectedDonationForDonate.minAmount)) *
                  100 +
                "%"
              : "0%",
          }}
        ></div>
      </div>
      <div className="donate-widget-progress-labels-container">
        <span className="donate-widget-progress-label">
          $
          {selectedDonationForDonate.donations.length === 0
            ? 0
            : Number.parseFloat(
                selectedDonationForDonate.donations
                  .map((donation) => Number.parseFloat(donation.amount))
                  .reduce((prev, curr) => prev + curr)
              )}{" "}
          donated
        </span>
        <span className="donate-widget-progress-label">
          ${selectedDonationForDonate.minAmount} goal
        </span>
      </div>
      <input
        type="number"
        className="donate-widget-input"
        placeholder="5 (Dai)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button className="donate-buttons bottom-margin-set" onClick={donate}>
        {loader ? (
          <Loader
            type="Oval"
            color="#FFF"
            height={16}
            width={16}
            style={{ display: "flex" }}
          />
        ) : (
          <>
            <Heart /> Donate
          </>
        )}
      </button>
    </div>
  );
};

export default DonateWidget;
