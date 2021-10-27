# MagiSync

A NodeJS based syncing tool for Magister and Google Calendar.

### Usage

1. Configure your env variables - See below
2. Run `yarn` to install dependencies
3. [Obtain OAuth credentials](https://developers.google.com/identity/protocols/oauth2) from Google, replace the values of the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` env variables with the client id and client secret shown in your Google cloud console.
   > Note: Ensure the credentials are for the application type: "Desktop"
4. Run `yarn compile && node dist` to build and run the program.
5. Authenticate the app following the terminal prompts (You will only have to do this once)
6. You're ready to go, your calendar is synced with you Magister schedule.

### Env variables

```dotenv
NOTIFICATIONS
```

If Google Calendar needs to send a notification.

```dotenv
TENANT
```

The string that precedes `.magister.net` in the domain.

```dotenv
USERNAME
```

Your Magister username.

```dotenv
PASSWORD
```

Your Magister password.

```dotenv
SYNC_INTERVAL
```

How often your schedule should be synced in minutes.

```dotenv
WEEKS_AHEAD
```

How many weeks ahead to sync.

## Contributing

feel free to contribute to this project
please check [CONTRIBUTING](./CONTRIBUTING.md) before commiting.

## Author

[@Martijn-Faber](https://github.com/Martijn-Faber)

## License

this project is licensed under the [MIT license](./LICENSE)

### Disclaimer

Obligatory "I am not responsible for any damage caused by using this program. I am not responsible if you miss your classes, mess up your calendar or cause thermonuclear war by using this software."
