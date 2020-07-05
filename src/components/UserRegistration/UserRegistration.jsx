import "regenerator-runtime/runtime";
import React, { useCallback, useEffect, useState, useContext } from "react";
import { StateContext, ActionContext } from "../../hooks";
import "./UserRegistration.scss";
import Big from "big.js";
import { NuCypherService } from "../../services";
import Loader from "react-loader-spinner";

const BOATLOAD_OF_GAS = Big(1)
  .times(10 ** 16)
  .toFixed();

const UserRegistration = () => {
  const { contract, currentUser, nearConfig, wallet } = useContext(
    StateContext
  );
  const {
    setModalConfig,
    setUserEncryptionCreds,
    setUserDetails,
  } = React.useContext(ActionContext);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loader, setLoader] = useState(false);

  const onSubmit = async () => {
    setLoader(true);
    try {
      const randomID = (Math.random() * 1e32).toString(36).substring(0, 10);
      const res = await NuCypherService.getEncryptionKey(randomID);
      // console.log("Testing", res);
      contract
        .addUser(
          {
            uuid: randomID,
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth.toString(),
            emailId: email,
            phoneNumber: phoneNumber,
            sender: currentUser.accountId,
            senderPublicEncKey: res.pub.enc,
            senderPublicSigKey: res.pub.sig,
          },
          BOATLOAD_OF_GAS
        )
        .then((data) => {
          console.log(data);
          contract
            .getUserBySender({ currentUser: currentUser.accountId.toString() })
            .then((user) => {
              console.log(user);
              setUserDetails(user);
              setUserEncryptionCreds(res);
              setModalConfig(true, { type: "user-encryption" });
              setLoader(false);
            });
        });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="user-registration">
      <div className="user-registration-container">
        <h3>User Registration</h3>
        <p>
          {" "}
          Logged as <strong>{currentUser.accountId}</strong>! We need your
          details to see if you are human or not, but don't worry we will
          encrypt your data end to end!
        </p>
        <div className="login-input-container top-margin-set">
          <label className="login-input-label">First Name</label>
          <input
            type="text"
            placeholder="e.g. John"
            className="login-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="login-input-container top-margin-set">
          <label className="login-input-label">Last Name</label>
          <input
            type="text"
            placeholder="e.g. Doe"
            className="login-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="login-input-container top-margin-set">
          <label className="login-input-label">Email</label>
          <input
            type="email"
            placeholder="e.g. john.doe@gmail.com"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="login-input-container top-margin-set">
          <label className="login-input-label">Date Of Birth</label>
          <input
            type="date"
            className="login-input"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>
        <div className="login-input-container top-margin-set">
          <label className="login-input-label">Phone Number (Optional)</label>
          <input
            type="tel"
            className="login-input"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. +19999999999"
          />
        </div>
        <button className="login-submit-button" onClick={onSubmit}>
          {loader ? (
            <Loader
              type="Oval"
              color="#FFF"
              height={16}
              width={16}
              style={{ display: "flex" }}
            />
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </div>
  );
};

export default UserRegistration;
