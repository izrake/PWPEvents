import "regenerator-runtime/runtime";
import React, { useState, useContext } from "react";
import { StateContext } from "../../hooks";
import "./DonationRegistration.scss";
import { ChevronRight, Check } from "react-feather";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useHistory, useParams } from "react-router-dom";
import Big from "big.js";
import Loader from "react-loader-spinner";
import { store } from "react-notifications-component";

const BOATLOAD_OF_GAS = Big(1)
  .times(10 ** 16)
  .toFixed();

const DonationRegistration = () => {
  let { id } = useParams();
  const history = useHistory();

  const { contract, currentUser } = useContext(StateContext);
  const [donationTitle, setDonationTitle] = useState("");
  const [donationPurpose, setDonationPurpose] = useState(
    EditorState.createEmpty()
  );
  const [validDate, setValidDate] = useState(new Date());
  const [donationMinAmount, setDonationMinAmount] = useState("");
  const [donationRecipientAddress, setDonationRecipientAddress] = useState("");
  const [
    donationRegistrationProgress,
    setDonationRegistrationProgress,
  ] = useState(1);
  const [loader, setLoader] = useState(false);

  const submitDonation = async () => {
    if (isNotEmptyField()) {
      if (id) {
        setLoader(true);
        try {
          const randomID = (Math.random() * 1e32).toString(36).substring(0, 10);
          contract
            .addDonationEvent(
              {
                donationEventUUID: randomID,
                mainEventUUID: id,
                title: donationTitle,
                purpose: draftToHtml(
                  convertToRaw(donationPurpose.getCurrentContent())
                ),
                date: new Date().toString(),
                validDate: validDate.toString(),
                minAmount: donationMinAmount.toString(),
                receiverAddress: donationRecipientAddress,
                sender: currentUser.accountId,
              },
              BOATLOAD_OF_GAS
            )
            .catch((err) => {
              console.log(err);
              store.addNotification({
                title: "Error!",
                message: err.message,
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
            })
            .then((data) => {
              console.log(data);
              history.push(`/events/${id}`);
              setLoader(false);
              store.addNotification({
                title: "Awesome!",
                message: "You have successfully created a donation!",
                type: "success",
                insert: "top",
                container: "top-right",
                animationIn: ["animated", "fadeIn"],
                animationOut: ["animated", "fadeOut"],
                dismiss: {
                  duration: 5000,
                  onScreen: true,
                },
              });
            });
        } catch (err) {
          console.error(err);
          store.addNotification({
            title: "Error!",
            message: err.message,
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

  const isNotEmptyField = () => {
    const blocks = convertToRaw(donationPurpose.getCurrentContent()).blocks;
    const donationPurposeValue = blocks
      .map((block) => (!block.text.trim() && "\n") || block.text)
      .join("\n")
      .trim();
    if (
      !!donationTitle &&
      !!donationPurposeValue &&
      !!donationMinAmount &&
      !!donationRecipientAddress
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
              {donationRegistrationProgress <= 1 ? (
                <div
                  className={`event-registration-progress-number ${
                    donationRegistrationProgress === 1 ? "active" : ""
                  }`}
                  onClick={(e) => setDonationRegistrationProgress(1)}
                >
                  1
                </div>
              ) : (
                <div
                  className="event-registration-progress-done"
                  onClick={(e) => setDonationRegistrationProgress(1)}
                >
                  <Check />
                </div>
              )}
              {donationRegistrationProgress <= 2 ? (
                <div
                  className={`event-registration-progress-number ${
                    donationRegistrationProgress === 2 ? "active" : ""
                  }`}
                  onClick={(e) => setDonationRegistrationProgress(2)}
                >
                  2
                </div>
              ) : (
                <div
                  className="event-registration-progress-done"
                  onClick={(e) => setDonationRegistrationProgress(2)}
                >
                  <Check />
                </div>
              )}
              {donationRegistrationProgress <= 3 ? (
                <div
                  className={`event-registration-progress-number ${
                    donationRegistrationProgress === 3 ? "active" : ""
                  }`}
                  onClick={(e) => setDonationRegistrationProgress(3)}
                >
                  3
                </div>
              ) : (
                <div
                  className="event-registration-progress-done"
                  onClick={(e) => setDonationRegistrationProgress(3)}
                >
                  <Check />
                </div>
              )}
              {donationRegistrationProgress <= 4 ? (
                <div
                  className={`event-registration-progress-number ${
                    donationRegistrationProgress === 4 ? "active" : ""
                  }`}
                  onClick={(e) => setDonationRegistrationProgress(4)}
                >
                  4
                </div>
              ) : (
                <div
                  className="event-registration-progress-done"
                  onClick={(e) => setDonationRegistrationProgress(4)}
                >
                  <Check />
                </div>
              )}
              {donationRegistrationProgress <= 5 ? (
                <div
                  className={`event-registration-progress-number ${
                    donationRegistrationProgress === 5 ? "active" : ""
                  }`}
                  onClick={(e) => setDonationRegistrationProgress(5)}
                >
                  5
                </div>
              ) : (
                <div
                  className="event-registration-progress-done"
                  onClick={(e) => setDonationRegistrationProgress(5)}
                >
                  <Check />
                </div>
              )}
            </div>
            {donationRegistrationProgress === 1 && (
              <div className="event-registration-form-item">
                <h1 className="event-form-title">Write your donation title</h1>
                <p className="event-form-description">
                  This is the first thing people will see about your donation
                  need. Get their attention with a short title that focusses on
                  the change you’d like them to support.
                </p>
                <input
                  type="text"
                  className="form-control-input"
                  placeholder="What do you want to do?"
                  value={donationTitle}
                  onChange={(e) => setDonationTitle(e.target.value)}
                />
                <div className="event-registration-next-button-container">
                  <button
                    type="button"
                    className="event-registration-next-button"
                    onClick={(e) => setDonationRegistrationProgress(2)}
                  >
                    Next
                    <ChevronRight />
                  </button>
                </div>
              </div>
            )}
            {donationRegistrationProgress === 2 && (
              <div className="event-registration-form-item">
                <h1 className="event-form-title">
                  Explain the purpose of your donation
                </h1>
                <p className="event-form-description">
                  People are more likely to donate if it’s clear why you want
                  the donation and where you are going to use it. Explain how
                  this donation will impact you, your family, or your community.
                </p>
                <Editor
                  editorState={donationPurpose}
                  wrapperClassName="event-purpose-wrapper"
                  editorClassName="event-purpose-editor"
                  onEditorStateChange={(e) => setDonationPurpose(e)}
                />
                <div className="event-registration-next-button-container">
                  <button
                    type="button"
                    className="event-registration-next-button"
                    onClick={(e) => setDonationRegistrationProgress(3)}
                  >
                    Next
                    <ChevronRight />
                  </button>
                </div>
              </div>
            )}
            {donationRegistrationProgress === 3 && (
              <div className="event-registration-form-item">
                <h1 className="event-form-title">
                  When do you want to stop receiving donation?
                </h1>
                <p className="event-form-description">
                  This is required to let the donor to know that you won't need
                  donation anymore after the specified date
                </p>
                <div className="event-form-date-picker">
                  <DatePicker
                    selected={validDate}
                    onChange={(date) => setValidDate(date)}
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
                    onClick={(e) => setDonationRegistrationProgress(4)}
                  >
                    Next
                    <ChevronRight />
                  </button>
                </div>
              </div>
            )}
            {donationRegistrationProgress === 4 && (
              <div className="event-registration-form-item">
                <h1 className="event-form-title">
                  How much amount do you need for this donation?
                </h1>
                <p className="event-form-description">
                  After the amount is filled, donor won't be able to donate so
                  please carefully enter the amount.
                </p>
                <input
                  type="number"
                  className="form-control-input"
                  placeholder="Minimum amount you need"
                  value={donationMinAmount}
                  onChange={(e) => setDonationMinAmount(e.target.value)}
                />
                <div className="event-registration-next-button-container">
                  <button
                    type="button"
                    className="event-registration-next-button"
                    onClick={(e) => setDonationRegistrationProgress(5)}
                  >
                    Next
                    <ChevronRight />
                  </button>
                </div>
              </div>
            )}
            {donationRegistrationProgress === 5 && (
              <div className="event-registration-form-item">
                <h1 className="event-form-title">
                  What's your wallet address?
                </h1>
                <p className="event-form-description">
                  We have to store your address for donor to send payment to you
                  directly without us need to collect tokens{" "}
                </p>
                <input
                  type="text"
                  className="form-control-input"
                  placeholder="Your wallet address"
                  value={donationRecipientAddress}
                  onChange={(e) => setDonationRecipientAddress(e.target.value)}
                />
                <div className="event-registration-next-button-container">
                  <button
                    type="button"
                    className="event-registration-next-button"
                    onClick={submitDonation}
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
          <div>Please login to create a new donation</div>
        )}
      </div>
    </main>
  );
};

export default DonationRegistration;
