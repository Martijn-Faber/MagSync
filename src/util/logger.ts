import dayjs from 'dayjs';
import chalk, { Chalk } from 'chalk';

export type LogLevel = 'log' | 'error' | 'warn';

export default class Logger {
  constructor(private context: string) {
    this.colors = new Map<LogLevel, Chalk>([
      ['log', chalk.greenBright.bold],
      ['warn', chalk.yellow.bold],
      ['error', chalk.redBright.bold]
    ]);
  }

  private readonly colors: Map<LogLevel, Chalk>;

  private logMessage(message: string, level: LogLevel) {
    const timestamp = dayjs().format('HH:mm:ss');
    const levelColorFn = this.colors.get(level) || chalk.gray.bold;

    console.log(
      [
        chalk.blueBright.bold(timestamp),

        chalk.gray(`(${levelColorFn(level.toUpperCase())})`),
        chalk.gray(this.context),
        message
      ]
        .filter((i) => i)
        .join(' ')
    );
  }

  log(message: string): void {
    this.logMessage(message, 'log');
  }

  error(message: string): void {
    this.logMessage(message, 'error');
  }

  warn(message: string): void {
    this.logMessage(message, 'warn');
  }
}
