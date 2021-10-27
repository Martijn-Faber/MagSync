import { calendar_v3, google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { join } from 'path';
import { readFileSync, writeFile } from 'fs';
import { createInterface } from 'readline';
import Logger from './util/logger';
import { config } from './util/config';
import dayjs from 'dayjs';

const logger = new Logger('google');

const scopes = ['https://www.googleapis.com/auth/calendar'];
const tokenPath = join(__dirname, 'token.json');

export class Google {
  private logger: Logger;

  private client: OAuth2Client;
  private calendar: calendar_v3.Calendar;

  constructor() {
    this.logger = new Logger('google');
  }

  authorize(clientId: string, clientSecret: string, redirectUri: string) {
    const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    this.client = client;

    let credentials = null;

    try {
      credentials = readFileSync(tokenPath);
      client.setCredentials(JSON.parse(credentials));
    } catch (err) {
      this.getOAuthCredentials();
    }

    this.calendar = google.calendar({ version: 'v3', auth: client });
  }

  async events(
    calendarId: string,
    from?: string,
    to?: string
  ): Promise<calendar_v3.Schema$Event[]> {
    const events = await this.calendar.events.list({
      calendarId,
      timeMin: from,
      timeMax: to
    });

    return events.data.items;
  }

  async insertEvent(
    calendarId: string,
    summary: string,
    start: string,
    end: string,
    location: string,
    description: string,
    colorId: number
  ) {
    await this.calendar.events.insert({
      calendarId,
      sendNotifications: config.notifications,
      requestBody: {
        summary,
        start: { dateTime: dayjs(start).toISOString() },
        end: { dateTime: dayjs(end).toISOString() },
        location,
        description,
        colorId: colorId.toString()
      }
    });
  }

  async deleteEvent(id: string) {
    await this.calendar.events.delete({
      eventId: id
    });
  }

  async createCalendar(
    summary: string,
    description: string,
    timeZone: string
  ): Promise<calendar_v3.Schema$Calendar> {
    const calendar = await this.calendar.calendars.insert({
      requestBody: {
        description,
        summary,
        timeZone
      }
    });

    return calendar.data;
  }

  async calendars(): Promise<calendar_v3.Schema$CalendarListEntry[]> {
    const calendars = await this.calendar.calendarList.list();
    return calendars.data.items;
  }

  getOAuthCredentials() {
    const authUrl = this.client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes
    });

    logger.log(`authorize this app by visiting this url: ${authUrl}`);

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('enter the code from that page here: ', async (code) => {
      rl.close();
      const token = await this.client.getToken(code);
      this.client.setCredentials(token.tokens);

      writeFile(tokenPath, JSON.stringify(token.tokens), (err) => {
        if (err) return logger.error(err.message);
      });
    });
  }
}
