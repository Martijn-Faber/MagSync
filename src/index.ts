import dayjs from 'dayjs';
import { Google } from './google';
import { sleep } from './util/sleep';
import Logger from './util/logger';
import { minutesToMilliSeconds } from './util/transform';
import { config } from './util/config';
import { Magister } from './magister';
import { hash } from './util/hash';
import { parseBoolean } from './util/parser';

let hashes = new Map();
const logger = new Logger('index');

// ┌───────────┬────────────┬──────────┐
// │ Color ID  │ Color Name │ Hex Code │
// ├───────────┼────────────┼──────────┤
// │ 1         │ Lavender   │ #7986cb  │
// │ 2         │ Sage       │ #33b679  │
// │ 3         │ Grape      │ #8e24aa  │
// │ 4         │ Flamingo   │ #e67c73  │
// │ 5         │ Banana     │ #f6c026  │
// │ 6         │ Tangerine  │ #f5511d  │
// │ 7         │ Peacock    │ #039be5  │
// │ 8         │ Graphite   │ #616161  │
// │ 9         │ Blueberry  │ #3f51b5  │
// │ 10        │ Basil      │ #0b8043  │
// │ 11        │ Tomato     │ #d60000  │
// └───────────┴────────────┴──────────┘

function getInfoType(type: number): { type: string; colorId: number } {
  switch (type) {
    // test
    case 2:
      return {
        type: 'Proefwerk',
        colorId: 5
      };
    // written exam
    case 4:
      return {
        type: 'Schriftelijke overhoring',
        colorId: 5
      };
    // oral exam
    case 5:
      return {
        type: 'Mondelinge overhoring',
        colorId: 5
      };
    // information
    case 6:
      return {
        type: 'Informatie',
        colorId: 8
      };
    default:
      return {
        type: null,
        colorId: 7
      };
  }
}

async function syncTimeTable(google: Google, magister: Magister) {
  logger.log('syncing calendar...');

  const calendars = await google.calendars();
  const exists = calendars.find((calendar) => calendar.summary === config.calendarName);
  let calendarId: string;

  if (!exists) {
    logger.log("calendar doesn't exists, creating a new one");

    const calendar = await google.createCalendar(
      config.calendarName,
      'See all your Magister appointments in Google calendar',
      'Europe/Amsterdam'
    );
    calendarId = calendar.id;
  } else {
    calendarId = exists.id;
  }

  const magisterDateFormat = 'YYYY-MM-D';
  const from = dayjs(); // today
  const to = dayjs().add(parseInt(config.weeksAhead), 'week'); // x weeks ahead

  const appointments = await magister.appointments(
    from.format(magisterDateFormat),
    to.format(magisterDateFormat)
  );

  const events = await google.events(calendarId, from.format(), to.format()); // only get events in timeframe

  // clear the old hashes
  hashes.clear();

  for (const event of events) {
    const eventHash = hash(
      event.summary,
      event.start.dateTime,
      event.end.dateTime,
      event.location,
      event.description
    );

    hashes.set(eventHash, event);
  }

  for (const appointment of appointments) {
    // hour? - subject(s) - teacher(s)
    const summary = `${
      parseBoolean(config.showHourInSummary)
        ? appointment.LesuurVan
          ? appointment.LesuurVan + ' - '
          : '' ?? ''
        : ''
    }${
      appointment.Vakken.length > 0
        ? `${getInfoType(appointment.InfoType).type ?? ''} ${appointment.Vakken.map(
            (subject) => subject.Naam
          ).join(', ')} - ${appointment.Docenten.map((teacher) => teacher.Docentcode).join(', ')}`
        : appointment.Omschrijving
    }`;

    let homework = appointment.Inhoud;

    // kwt hours
    if (appointment.Type == 7) {
      const kwt = await magister.kwt(appointment.Start, appointment.Einde);

      const html = `
      ${kwt.Keuzes.map((choise) => {
        return `<h2><a href="https://${config.tenant}/magister/#/agenda/huiswerk/${
          appointment.Id
        }">${choise.Omschrijving}</a></h2>
      ${
        choise.Lokalen
          ? `<span>lokalen: ${choise.Lokalen.map((classroom) => classroom.Naam).join(', ')}</span>`
          : ''
      }
      ${
        choise.Docenten
          ? `<span>docenten: ${choise.Docenten.map((teacher) => teacher.Docentcode).join(
              ', '
            )}</span>`
          : ''
      }
      ${
        choise.MaxDeelnemers
          ? `<span>deelnemers: ${`${choise.AantalDeelnemers} / ${choise.MaxDeelnemers}`}</span>`
          : '<span>deelnemers: geen limit</span>'
      }
      ${choise.Inhoud ? `<span>inhoud: ${choise.Inhoud}</span>` : ''}`;
      })}`;

      homework = kwt.MagInschrijven
        ? html
        : 'Helaas kun je niet meer inschrijven voor dit keuzewerktijd uur';
    }

    const appointmentHash = hash(
      summary,
      appointment.Start,
      appointment.Einde,
      appointment.Lokatie,
      homework
    );

    if (!hashes.has(appointmentHash)) {
      logger.log(`adding appointment ${appointment.Id}`);

      await google.insertEvent(
        calendarId,
        summary,
        appointment.Start,
        appointment.Einde,
        appointment.Lokatie,
        homework,
        getInfoType(appointment.InfoType).colorId
      );
    } else {
      logger.log(`appointment ${appointment.Id} already exists, removing hash ${appointmentHash}`);
      hashes.delete(appointmentHash);
    }

    await sleep(500); // rate limit
  }

  // remove canceled appointments from google
  for (const [key, value] of hashes) {
    logger.log(`remove canceled appointment ${key}`);
    await google.deleteEvent(value.id, calendarId);
    await sleep(500); // rate limit
  }

  logger.log(
    `successfully synced from ${from.format()} to ${to.format()}, syncing again in ${
      config.interval
    } minutes`
  );
}

async function sync() {
  logger.log('starting...');

  const google = new Google();
  google.authorize(config.clientId, config.clientSecret, 'urn:ietf:wg:oauth:2.0:oob'); // desktop redirect uri

  const magister = new Magister();
  await magister.login(config.tenant, config.username, config.password);

  // TODO: improve this bad code
  await syncTimeTable(google, magister);
  setInterval(
    async () => await syncTimeTable(google, magister),
    minutesToMilliSeconds(parseInt(config.interval))
  );
}

sync();
