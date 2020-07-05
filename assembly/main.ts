// import {EventModel, events } from "./model";

import {
  User,
  users,
  userMap,
  EventRegistration,
  events,
  eventsMap,
  subscribers,
  DonationEventRegistration,
  donationEvents,
  mainEventToDonationEventMap,
  donationEventMap,
  donationToDonationEventMap,
  Donation,
  donationMap,
  donations,
} from "./model";
import { storage, context, logging } from "near-sdk-as";

// --- contract code goes below

// The maximum number of latest messages the contract returns.
const MESSAGE_LIMIT = 1000;

export function addUser(
  uuid: string,
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  emailId: string,
  phoneNumber: string,
  sender: string,
  senderPublicEncKey: string,
  senderPublicSigKey: string
): void {
  let updateValue = new User(
    uuid,
    firstName,
    lastName,
    dateOfBirth,
    emailId,
    phoneNumber,
    true,
    sender,
    senderPublicEncKey,
    senderPublicSigKey
  );
  users.push(updateValue);
  userMap.set(context.sender, updateValue);
}

export function addEvent(
  uuid: string,
  title: string,
  purpose: string,
  date: string,
  minSubscribers: string,
  sender: string
): boolean {
  let getEvent = eventsMap.get(uuid);
  if (getEvent !== null) {
    // updaye subscrieber for specific uuid
    let val = subscribers.get(uuid);
    if (val !== null) {
      val.push(sender);
      subscribers.set(uuid, val);
      getEvent.subscriber = val;
      eventsMap.set(uuid, getEvent);
    } else {
      let arr = new Array<string>();
      arr.push(sender);
      subscribers.set(uuid, arr);
      getEvent.subscriber = arr;
      eventsMap.set(uuid, getEvent);
    }
    return true;
  } else {
    let sub = new Array<string>();
    let donationEvents = new Array<string>();
    sub.push(context.sender);
    let eventRegistration = new EventRegistration(
      uuid,
      title,
      purpose,
      date,
      minSubscribers,
      sub,
      donationEvents,
      sender
    );
    eventsMap.set(uuid, eventRegistration);
    events.push(eventRegistration);
    return true;
  }
}

export function addDonationEvent(
  donationEventUUID: string,
  mainEventUUID: string,
  title: string,
  purpose: string,
  date: string,
  validDate: string,
  minAmount: string,
  receiverAddress: string,
  sender: string
): boolean {
  let donations = new Array<string>();
  let donationEvent = new DonationEventRegistration(
    donationEventUUID,
    mainEventUUID,
    title,
    purpose,
    date,
    validDate,
    minAmount,
    donations,
    receiverAddress,
    sender
  );
  donationEventMap.set(donationEventUUID, donationEvent);
  donationEvents.push(donationEvent);
  let donationEventsNew = mainEventToDonationEventMap.get(mainEventUUID);
  if (donationEventsNew !== null && donationEventsNew.length) {
    donationEventsNew.push(donationEventUUID);
    mainEventToDonationEventMap.set(mainEventUUID, donationEventsNew);
  } else {
    mainEventToDonationEventMap.set(mainEventUUID, [donationEventUUID]);
  }
  return true;
}

export function getUsers(): User[] {
  const numMessages = min(MESSAGE_LIMIT, users.length);
  const startIndex = users.length - numMessages;
  const result = new Array<User>(numMessages);
  for (let i = 0; i < numMessages; i++) {
    result[i] = users[i + startIndex];
  }
  return result;
}

export function getUserBySender(currentUser: string): User {
  let getUserByName = userMap.get(currentUser);
  if (getUserByName != null) {
    return getUserByName;
  }
  return new User("", "", "", "", "", "", false, currentUser, "", "");
}

export function getEvents(): EventRegistration[] {
  const numMessages = min(MESSAGE_LIMIT, events.length);
  const startIndex = events.length - numMessages;
  const result = new Array<EventRegistration>(numMessages);
  for (let i = 0; i < numMessages; i++) {
    result[i] = events[i + startIndex];
    // update subsribers
    let subscribedUsers = subscribers.get(result[i].uuid);
    if (subscribedUsers !== null) {
      result[i].subscriber = subscribedUsers;
    }
    let donationEvents = mainEventToDonationEventMap.get(result[i].uuid);
    if (donationEvents !== null) {
      result[i].donationEvents = donationEvents;
    } else {
      result[i].donationEvents = [];
    }
  }
  return result;
}

export function getEventByUUID(uuid: string): EventRegistration {
  let getEvent = eventsMap.get(uuid);

  if (getEvent != null) {
    let donationEvents = mainEventToDonationEventMap.get(uuid);
    if (donationEvents !== null) {
      getEvent.donationEvents = donationEvents;
    } else {
      getEvent.donationEvents = [];
    }
    return getEvent;
  }
  return new EventRegistration("", "", "", "", "", [], [], "");
}

export function getDonationEvents(): DonationEventRegistration[] {
  const numMessages = min(MESSAGE_LIMIT, donationEvents.length);
  const startIndex = donationEvents.length - numMessages;
  const result = new Array<DonationEventRegistration>(numMessages);
  for (let i = 0; i < numMessages; i++) {
    result[i] = donationEvents[i + startIndex];
    let donations = donationToDonationEventMap.get(result[i].uuid);
    if (donations != null) {
      result[i].donations = donations;
    } else {
      result[i].donations = [];
    }
  }
  return result;
}

export function getDonationEventByUUID(
  donationEventUUID: string
): DonationEventRegistration {
  let donationEvent = donationEventMap.get(donationEventUUID);
  if (donationEvent != null) {
    let donations = donationToDonationEventMap.get(donationEventUUID);
    if (donations != null) {
      donationEvent.donations = donations;
    } else {
      donationEvent.donations = [];
    }
    return donationEvent;
  }
  return new DonationEventRegistration("", "", "", "", "", "", "", [], "", "");
}

export function getDonationByUUID(donationUUID: string): Donation {
  let donation = donationMap.get(donationUUID);
  if (donation != null) {
    return donation;
  }
  return new Donation("", "", "", "");
}

export function subscribeEvent(uuid: string, sender: string): boolean {
  let getEvent = eventsMap.get(uuid);
  if (getEvent != null) {
    getEvent.subscriber.push(sender);
    subscribers.set(uuid, getEvent.subscriber);
    eventsMap.set(uuid, getEvent);
    return true;
  }
  return false;
}

export function donateEvent(
  donationUUID: string,
  donationEventUUID: string,
  donorsAddress: string,
  amount: string
): boolean {
  let donation = new Donation(
    donationUUID,
    donationEventUUID,
    donorsAddress,
    amount
  );
  donationMap.set(donationUUID, donation);
  donations.push(donation);
  let donationsDone = donationToDonationEventMap.get(donationEventUUID);
  if (donationsDone !== null && donationsDone.length) {
    donationsDone.push(donationUUID);
    donationToDonationEventMap.set(donationEventUUID, donationsDone);
  } else {
    donationToDonationEventMap.set(donationEventUUID, [donationUUID]);
  }
  return true;
}
