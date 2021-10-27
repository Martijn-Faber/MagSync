import dayjs from 'dayjs';
import md5 from 'md5';

export function hash(
  summary: string,
  start: string,
  end: string,
  location: string,
  description: string
): string {
  if (!location || location == undefined) {
    location = null;
  }

  if (!description || description == undefined) {
    description = null;
  }

  return md5(`${summary}${dayjs(start).format()}${dayjs(end).format()}${location}${description}`);
}
