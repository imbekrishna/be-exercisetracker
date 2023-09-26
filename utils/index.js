const dateInMS = (string) => new Date(string).getTime();

const isValidDate = (string) => {
  return !Number.isNaN(dateInMS(string));
};

const toDateString = (string) =>
  (string ? new Date(string) : new Date()).toDateString();

const checkDate = {
  isBefore: (dateString, dateStringToCompare) => {
    return (
      dateInMS(dateStringToCompare) - dateInMS(toDateString(dateString)) >= 0
    );
  },
  isAfter: (dateString, dateStringToCompare) => {
    return (
      dateInMS(dateStringToCompare) - dateInMS(toDateString(dateString)) <= 0
    );
  }
};

module.exports = {
  dateInMS,
  isValidDate,
  toDateString,
  checkDate
};
