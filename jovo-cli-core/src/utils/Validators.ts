import { JovoCliError } from '../JovoCliError';

/**
 * Checks validity of a provided locale.
 * @param {string} locale - The locale to check.
 * @throws JovoCliError, if locale is not valid.
 */
export function validateLocale(locale?: string) {
  const localeRegexp: RegExp = /^[a-z]{2}-?([A-Z]{2})?$/;
  if (locale && !localeRegexp.test(locale)) {
    throw new JovoCliError(
      `Locale ${locale} is not valid.`,
      '@jovotech/cli-core',
      'Valid locales are en, en-US, ...',
    );
  }
}
