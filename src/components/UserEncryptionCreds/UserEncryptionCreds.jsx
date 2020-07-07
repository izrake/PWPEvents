import "regenerator-runtime/runtime";
import React, { useCallback, useContext } from "react";
import { StateContext, ActionContext } from "../../hooks";
import { Check, Download } from "react-feather";
import "./UserEncryptionCreds.scss";

const UserEncryptionCreds = () => {
  const { userEncryptionCreds, currentUser } = useContext(StateContext);
  // Download mnemonic file
  let downloadMnemonicFile = () => {
    var dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(userEncryptionCreds));
    var downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `${currentUser.accountId}_encryption_keys.json`
    );
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    localStorage.removeItem("userEncCreds");
  };
  return (
    <div className="user-encryption-creds">
      <div className="user-encryption-creds-success-container">
        <img
          src={require("../../assets/success.png")}
          alt="success"
          className="user-encryption-creds-success"
        />
      </div>
      <h1 className="user-encryption-creds-title">Awesome.</h1>
      <div className="align-center bottom-margin-set user-encryption-creds-desc">
        You are ready to proceed using enChange!
      </div>
      <div className="align-center bottom-margin-set user-encryption-creds-desc">
        Download the keyfile and store it safely. This will be needed for
        viewing the location.
      </div>
      <button
        className="download-file-buttons bottom-margin-set"
        onClick={downloadMnemonicFile}
      >
        <Download /> Download
      </button>
    </div>
  );
};

export default UserEncryptionCreds;
