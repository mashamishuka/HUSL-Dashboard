import * as momentTz from 'moment-timezone';

const tz = process.env.DEFAULT_TIMEZONE || 'UTC';
const moment = (date?: Date | string, timezone = tz) => {
  return momentTz(date).tz(timezone);
};

export default moment;
