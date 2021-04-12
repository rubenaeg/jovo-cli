import chalk from 'chalk';
import { ERROR } from './utils/Constants';

export class JovoCliError extends Error {
  private error: string[] = [];

  constructor(readonly message: string, readonly module: string, readonly hint?: string) {
    super();
  }

  logError() {
    this.error.push(`${ERROR} ${chalk.bgRed.bold(`${this.message}\n`)}`);
  }

  logProperty(key: string, value: string) {
    key = `${key}:`.padEnd(10);
    this.error.push(`${chalk.bold(key)}${value}`);
  }

  toString() {
    this.logError();
    this.logProperty('Module', this.module);

    if (this.hint) {
      this.logProperty('Hint', this.hint);
    }

    this.error.push(
      chalk.grey(
        '\nIf you think this is not on you, you can submit an issue here: https://github.com/jovotech/jovo-cli/issues.',
      ),
    );

    return `\n${this.error.join('\n')}\n`;
  }
}