import React, { createContext, useMemo } from "react";

export const ActionContext = createContext();
export const StateContext = createContext();

export const AppProvider = (props) => {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case "LOAD_NEAR":
          return {
            ...prevState,
            contract: action.contract,
            currentUser: action.currentUser,
            nearConfig: action.nearConfig,
            wallet: action.wallet,
          };
        case "TOGGLE_MODAL":
          return {
            ...prevState,
            openModal: action.openModal,
            modalConfig: action.modalConfig,
          };
        case "SET_USER_ENCRYPTION_CREDS":
          return {
            ...prevState,
            userEncryptionCreds: action.userEncryptionCreds,
          };
        case "SET_USER_DETAILS":
          return {
            ...prevState,
            userDetails: action.userDetails,
          };
        case "SET_DECRYPT_LOCATION_EVENT_UUID":
          return {
            ...prevState,
            decryptLocationEventUuid: action.decryptLocationEventUuid,
          };
        case "SET_EVENTS":
          return {
            ...prevState,
            events: action.events,
          };
        case "SET_DONATION_EVENTS":
          return {
            ...prevState,
            donationEvents: action.donationEvents,
          };
        case "SET_SELECTED_EVENT":
          return {
            ...prevState,
            selectedEvent: action.selectedEvent,
          };
        case "SET_SELECTED_DONATION":
          return {
            ...prevState,
            selectedDonation: action.selectedDonation,
          };
        default:
      }
    },
    {
      contract: null,
      currentUser: null,
      nearConfig: null,
      wallet: null,
      openModal: false,
      modalConfig: { type: "" },
      userEncryptionCreds: null,
      userDetails: null,
      decryptLocationEventUuid: "",
      events: [],
      donationEvents: [],
      selectedEvent: null,
      selectedDonation: null,
    }
  );

  const actionContext = useMemo(
    () => ({
      loadNearConfig: async (contract, currentUser, nearConfig, wallet) => {
        dispatch({
          type: "LOAD_NEAR",
          contract,
          currentUser,
          nearConfig,
          wallet,
        });
      },
      setModalConfig: (openModal, modalConfig) => {
        dispatch({ type: "TOGGLE_MODAL", openModal, modalConfig });
      },
      setEvents: (events) => {
        dispatch({ type: "SET_EVENTS", events });
      },
      setDonationEvents: (donationEvents) => {
        dispatch({ type: "SET_DONATION_EVENTS", donationEvents });
      },
      setSelectedEvent: (selectedEvent) => {
        dispatch({ type: "SET_SELECTED_EVENT", selectedEvent });
      },
      setSelectedDonation: (selectedDonation) => {
        dispatch({ type: "SET_SELECTED_DONATION", selectedDonation });
      },
      setUserDetails: (userDetails) => {
        dispatch({ type: "SET_USER_DETAILS", userDetails });
      },
      setUserEncryptionCreds: (userEncryptionCreds) => {
        dispatch({ type: "SET_USER_ENCRYPTION_CREDS", userEncryptionCreds });
      },
      setDecryptLocationEventUuid: (decryptLocationEventUuid) => {
        dispatch({
          type: "SET_DECRYPT_LOCATION_EVENT_UUID",
          decryptLocationEventUuid,
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return (
    <ActionContext.Provider value={actionContext}>
      <StateContext.Provider value={state}>
        {props.children}
      </StateContext.Provider>
    </ActionContext.Provider>
  );
};
