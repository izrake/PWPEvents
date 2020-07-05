import "regenerator-runtime/runtime";
import React, { useCallback, useContext } from "react";
import { StateContext, ActionContext } from "../../hooks";
import { Heart } from "react-feather";
import "./DonateWidget.scss";

const DonateWidget = () => {
  const { selectedDonationForDonate, currentUser } = useContext(StateContext);
  // Download mnemonic file

  return (
    <div className="donate-widget">
      <h1 className="donate-widget-title">{selectedDonationForDonate.title}</h1>
      <div className="donate-widget-progress-container">
        <div
          className="donate-widget-progress"
          style={{
            width:
              (Number.parseFloat(
                selectedDonationForDonate.donations
                  .map((donation) => Number.parseFloat(donation.amount))
                  .reduce((prev, curr) => prev + curr)
              ) /
                Number.parseFloat(selectedDonationForDonate.minAmount)) *
                100 +
              "%",
          }}
        ></div>
      </div>
      <div className="donate-widget-progress-labels-container">
        <span className="donate-widget-progress-label">
          $
          {Number.parseFloat(
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
      />
      <button className="donate-buttons bottom-margin-set">
        <Heart /> Donate
      </button>
    </div>
  );
};

export default DonateWidget;
