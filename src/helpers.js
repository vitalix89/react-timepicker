import moment from "moment";
export const timeToMoment = time => moment(time, "HH:mm").format();
