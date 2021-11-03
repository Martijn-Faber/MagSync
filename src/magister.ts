import { config } from './util/config';
import { AuthManager } from 'magister-openid';
import Logger from './util/logger';
import Account from './interfaces/account';
import fetch, { RequestInfo, RequestInit } from 'node-fetch';
import { Appointment, Kwt } from './interfaces';
import { URLSearchParams } from 'url';
import dayjs from 'dayjs';

export class Magister {
  private logger: Logger;

  private accessToken: string;
  private refreshToken: string;
  private tokenExpire: dayjs.Dayjs;

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
    this.refreshToken = tokens.refresh_token;
    this.accessToken = tokens.access_token;
    this.tokenExpire = dayjs().add(tokens.expires_in, 'seconds');
  }

  async refreshAccessToken(): Promise<string> {
    const res = await fetch('https://accounts.magister.net/connect/token', {
      method: 'POST',
      headers: {
        'cache-control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        refresh_token: this.refreshToken,
        client_id: 'M6LOAPP',
        grant_type: 'refresh_token'
      })
    }).then((res) => res.json());

    this.refreshToken = res.refresh_token;
    this.accessToken = res.access_token;
    this.tokenExpire = dayjs().add(res.expires_in, 'seconds');

    return res.access_token;
  }

  private async handleAuth(): Promise<string> {
    if (this.accessToken) {
      // check if token is expired
      if (dayjs() >= this.tokenExpire) {
        return await this.refreshAccessToken(); // refresh token
      }

      return this.accessToken;
    }
  }

  private async fetch(url: RequestInfo, init?: RequestInit): Promise<any> {
    init = {
      ...init,
      headers: {
        Authorization: `Bearer ${await this.handleAuth()}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...init?.headers
      }
    };

    let res = await fetch(url, init);

    if (res.status == 401) {
      this.handleAuth();
    }

    if (res.status !== 200) {
      this.logger.log(`request failed with a ${res.status} ${res.statusText}`);
    }

    return await res.json();
  }

  async account(): Promise<Account> {
    this.logger.log('fetching Magister account');

    const account = await this.fetch(`https://${config.tenant}/api/account?noCache=0`);

    this.logger.log('successfully fetched account');
    return await account;
  }

  async appointments(from: string, to: string): Promise<Appointment[]> {
    this.logger.log('fetching Magister appointments');

    const appointments = await this.fetch(
      `https://${this.tenant}/api/personen/${
        (
          await this.account()
        ).Persoon.Id
      }/afspraken?status=1&tot=${to}&van=${from}`
    );

    this.logger.log('successfully fetched appointments');
    return appointments.Items;
  }

  async kwt(from: string, to: string): Promise<Kwt> {
    this.logger.log('fetching kwt hour');

    const kwt = await this.fetch(
      `https://${this.tenant}/api/leerlingen/${
        (
          await this.account()
        ).Persoon.Id
      }/keuzewerktijd/keuzes?tot=${to}&van=${from}`
    );

    this.logger.log('successfully fetched kwt hour');
    return kwt.Items[0];
  }
}
