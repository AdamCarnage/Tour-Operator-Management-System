import { Matches } from 'class-validator';

export function IsIsoDate(): PropertyDecorator {
  return Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be YYYY-MM-DD',
  });
}

export function IsCurrencyCode(): PropertyDecorator {
  return Matches(/^[A-Z]{3}$/, {
    message: 'currency must be a 3-letter ISO code',
  });
}
