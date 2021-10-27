import dotenv from 'dotenv';
dotenv.config();

function validate(key: keyof NodeJS.ProcessEnv, defaultValue?: any) {
  const value = process.env[key];

  if (!value) {
    if (typeof defaultValue !== 'undefined') {
      return defaultValue;
    }

    throw new Error(`${key} is not defined in environment variables`);
  }

  return value;
}

export const config = {
  calendarName: validate('CALENDAR_NAME', 'MagSync'),
  notifications: validate('NOTIFICATIONS', true),

  tenant: validate('TENANT'),
  username: validate('MAGISTER_USERNAME'),
  password: validate('MAGISTER_PASSWORD'),

  clientId: validate('GOOGLE_CLIENT_ID'),
  clientSecret: validate('GOOGLE_CLIENT_SECRET'),

  interval: validate('SYNC_INTERVAL', 60),
  weeksAhead: validate('WEEKS_AHEAD', 2)
};
