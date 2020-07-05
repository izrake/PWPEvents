import {
  context,
  u128,
  PersistentVector,
  PersistentMap,
  PersistentSet,
} from "near-sdk-as";

// /**
//  * collections.vector is a persistent collection. Any changes to it will
//  * be automatically saved in the storage.
//  * The parameter to the constructor needs to be unique across a single contract.
//  * It will be used as a prefix to all keys required to store data in the storage.
//  */

// export const events = new PersistentVector<EventModel>("m");

/**
 * Register user details once new user logs into the application
 * this maintains the state of the current logged users
 */

@nearBindgen
export class User {
  constructor(
    public uuid: string,
    public firstName: string,
    public lastName: string,
    public dateOfBirth: string,
    public emailId: string,
    public phoneNumber: string,
    public isRegistered: bool,
    public username: string,
    public publicEncKey: string,
    public publicSigKey: string
  ) {}
}

@nearBindgen
export class EventRegistration {
  isActive: bool;
  constructor(
    public uuid: string,
    public title: string,
    public purpose: string,
    public date: string,
    public minSubscribers: string,
    public subscriber: string[],
    public donationEvents: string[],
    public owner: string
  ) {
    this.isActive = true;
  }
}

@nearBindgen
export class DonationEventRegistration {
  isActive: bool;
  constructor(
    public uuid: string,
    public mainEventUUID: string,
    public title: string,
    public purpose: string,
    public date: string,
    public validDate: string,
    public minAmount: string,
    public donations: string[],
    public receiverAddress: string,
    public owner: string
  ) {
    this.isActive = true;
  }
}

@nearBindgen
export class Donation {
  constructor(
    public uuid: string,
    public donationEventUUID: string,
    public donorsAddress: string,
    public amount: string
  ) {}
}

export const userMap = new PersistentMap<string, User>("a");

export const eventsMap = new PersistentMap<string, EventRegistration>("b");

export const donationEventMap = new PersistentMap<
  string,
  DonationEventRegistration
>("c");

export const donationMap = new PersistentMap<string, Donation>("d");

export const users = new PersistentVector<User>("e");

export const events = new PersistentVector<EventRegistration>("f");

export const localities = new PersistentVector<string>("g");

export const donationEvents = new PersistentVector<DonationEventRegistration>(
  "h"
);

export const donations = new PersistentVector<Donation>("i");

export const localityToEventMap = new PersistentMap<string, string[]>("j");

export const mainEventToDonationEventMap = new PersistentMap<string, string[]>(
  "k"
);

export const donationToDonationEventMap = new PersistentMap<string, string[]>(
  "l"
);

export const subscribers = new PersistentMap<string, string[]>("m");
