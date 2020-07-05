export const isJoined = (event, currentUser) => {
  if (currentUser) {
    return (
      event.subscriber.filter((sub) => sub === currentUser.accountId).length !==
      0
    );
  }
  return false;
};

export const isQuotaFilled = (event) => {
  return event.subscriber.length >= Number.parseInt(event.minSubscribers);
};

export const isDonationNeeded = (donationEvent) => {
  const donationAmtDone =
    donationEvent.donations.length === 0
      ? 0
      : Number.parseFloat(
          donationEvent.donations
            .map((donation) => Number.parseFloat(donation.amount))
            .reduce((prev, curr) => prev + curr)
        );
  return Number.parseFloat(donationEvent.minAmount) !== donationAmtDone;
};

export const convertTwoDigits = (pValue) => {
  if (pValue < 10) return `0${pValue}`;
  return pValue;
};
