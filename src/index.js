import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import getConfig from "./config.js";
import * as nearAPI from "near-api-js";
import { AppProvider } from "./hooks";

// Initializing contract
async function initContract() {
  const nearConfig = getConfig(process.env.NODE_ENV || "development");

  // Initializing connection to the NEAR DevNet
  console.log(new nearAPI.keyStores.BrowserLocalStorageKeyStore());
  const near = await nearAPI.connect({
    deps: {
      keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(),
    },
    ...nearConfig,
  });

  // Needed to access wallet
  const walletConnection = new nearAPI.WalletConnection(near);

  // Load in account data
  let currentUser;
  if (walletConnection.getAccountId()) {
    currentUser = {
      accountId: walletConnection.getAccountId(),
      balance: (await walletConnection.account().state()).amount,
    };
  }

  // Initializing our contract APIs by contract name and configuration
  const contract = new nearAPI.Contract(
    walletConnection.account(),
    nearConfig.contractName,
    {
      // View methods are read-only – they don't modify the state, but usually return some value
      viewMethods: [
        "getUsers",
        "getUserBySender",
        "getEvents",
        "getEventsByLocality",
        "getEventByUUID",
        "getDonationEvents",
        "getDonationEventByUUID",
        "getDonationByUUID",
        "getPolicy",
      ],
      // Change methods can modify the state, but you don't receive the returned value when called
      changeMethods: [
        "addUser",
        "addEvent",
        "addDonationEvent",
        "subscribeEvent",
        "donateEvent",
      ],
      // Sender is the account ID to initialize transactions.
      // getAccountId() will return empty string if user is still unauthorized
      sender: walletConnection.getAccountId(),
    }
  );

  return { contract, currentUser, nearConfig, walletConnection };
}
window.nearInitPromise = initContract().then(
  ({ contract, currentUser, nearConfig, walletConnection }) => {
    ReactDOM.render(
      <AppProvider>
        <App
          contract={contract}
          currentUser={currentUser}
          nearConfig={nearConfig}
          wallet={walletConnection}
        />
      </AppProvider>,
      document.getElementById("root")
    );
  }
);
