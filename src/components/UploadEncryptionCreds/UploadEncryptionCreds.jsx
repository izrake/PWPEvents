import "regenerator-runtime/runtime";
import React, { useCallback, useContext } from "react";
import { StateContext, ActionContext } from "../../hooks";
import { Upload } from "react-feather";
import "./UploadEncryptionCreds.scss";
import { NuCypherService } from "../../services";

const UploadEncryptionCreds = () => {
  const {
    currentUser,
    userDetails,
    decryptLocationEventUuid,
    events,
    selectedEvent,
    contract,
  } = useContext(StateContext);
  const { setEvents, setModalConfig, setSelectedEvent } = useContext(
    ActionContext
  );

  const importChartFlow = (evt) => {
    let fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(evt.target.files[0]);
  };

  const handleFileRead = async (evt) => {
    const encDetail = JSON.parse(evt.target.result);
    console.log(encDetail);
    if (contract) {
      contract
        .getPolicy({
          key: decryptLocationEventUuid + "_" + currentUser.accountId,
        })
        .then((policy) => {
          console.log(policy);
          NuCypherService.decryptData(
            currentUser.accountId,
            userDetails.uuid,
            decryptLocationEventUuid,
            encDetail.pvt.enc,
            encDetail.pvt.sig,
            policy.policyPubKey,
            policy.policySigKey,
            policy.label
          ).then((locationData) => {
            console.log(locationData);
            events.forEach((event) => {
              if (event.uuid === decryptLocationEventUuid) {
                Object.assign(event, {
                  ...JSON.parse(locationData.data),
                });
              }
            });
            setEvents(events);
            if (
              selectedEvent &&
              selectedEvent.uuid === decryptLocationEventUuid
            ) {
              Object.assign(selectedEvent, {
                ...JSON.parse(locationData.data),
              });
            }
            setSelectedEvent(selectedEvent);
            setModalConfig(false, { type: "" });
          });
        });
    }
  };

  return (
    <div className="upload-encryption-creds">
      <div className="upload-import-title">Import your credential file</div>
      <div className="upload-input-field">
        <input
          className="upload-file-import"
          type="file"
          id="file"
          accept="application/JSON"
          onChange={(e) => importChartFlow(e)}
        />
        <div>
          <div className="upload-upload-icon">
            <Upload />
          </div>
          <div className="upload-upload-icon-title">
            Drop a credential to import
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadEncryptionCreds;
