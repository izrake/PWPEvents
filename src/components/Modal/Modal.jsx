import React, { useContext } from "react";
import "./Modal.scss";
import { X } from "react-feather";
import { ActionContext, StateContext } from "../../hooks";
import UserRegistration from "../UserRegistration";
import UserEncryptionCreds from "../UserEncryptionCreds";
import UploadEncryptionCreds from "../UploadEncryptionCreds";

function Modal() {
  const { setModalConfig } = useContext(ActionContext);
  const { openModal, modalConfig } = useContext(StateContext);
  return (
    <div className="login-modal">
      <div
        className={`modal-overlay ${!openModal ? "closed" : ""}`}
        id="modal-overlay"
        onClick={(e) => {
          if (modalConfig.type !== "registration") setModalConfig(false, {});
        }}
      ></div>

      <div className={`modal ${!openModal ? "closed" : ""}`} id="modal">
        <button
          className="close-button"
          id="close-button"
          onClick={(e) => {
            if (modalConfig.type !== "registration") setModalConfig(false, {});
          }}
        >
          <X />
        </button>
        <div className="modal-guts">
          {modalConfig.type === "registration" && (
            <UserRegistration></UserRegistration>
          )}
          {modalConfig.type === "user-encryption" && (
            <UserEncryptionCreds></UserEncryptionCreds>
          )}
          {modalConfig.type === "upload-encryption" && (
            <UploadEncryptionCreds></UploadEncryptionCreds>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
