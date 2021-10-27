import { config } from './util/config';
import { AuthManager } from 'magister-openid';
import Logger from './util/logger';
import Account from './interfaces/account';
import fetch from 'node-fetch';
import { Appointment } from './interfaces';

export class Magister {
  private logger: Logger;

  private accesToken: string;
  private refreshToken: string;

  private tenant: string;

  constructor() {
    this.logger = new Logger('magister');
  }

  async login(tenant: string, username: string, password: string) {
    this.tenant = tenant;

    const manager = new AuthManager(tenant);
    const authCode = await fetch('https://argo-web.vercel.app/api/authCode').then((res) =>
      res.text()
    );

    const tokens = await manager.login(username, password, authCode);
    this.accesToken = tokens.access_token;
    // TODO: refresh token
    this.refreshToken = tokens.refresh_token;
  }

  async account(): Promise<Account> {
    this.logger.log('fetching Magister account');

    const res = await fetch(`https://${config.tenant}/api/account?noCache=0`, {
      headers: {
        Authorization: `Bearer ${this.accesToken}`
      }
    });

    if (!res.ok) {
      this.logger.error('fetching account failed');
      return;
    }

    this.logger.log('successfully fetched account');

    return await res.json();
  }

  async appointments(from: string, to: string): Promise<Appointment[]> {
    this.logger.log('fetching Magister appointments');

    const res = await fetch(
      `https://${this.tenant}/api/personen/${
        (
          await this.account()
        ).Persoon.Id
      }/afspraken?status=1&tot=${to}&van=${from}`,
      {
        headers: {
          Authorization: `Bearer ${this.accesToken}`
        }
      }
    );

    if (!res.ok) {
      this.logger.error('fetching appointments failed');
      return;
    }

    this.logger.log('successfully fetched appointments');

    const json = await res.json();
    return json.Items;
  }
}
