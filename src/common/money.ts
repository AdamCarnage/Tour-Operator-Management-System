import type { ValueTransformer } from 'typeorm';

export const moneyTransformer: ValueTransformer = {
  to: (value?: number | null) => value ?? 0,
  from: (value?: string | number | null) =>
    value == null || value === '' ? 0 : Number(value),
};

export const rateTransformer: ValueTransformer = {
  to: (value?: string | null) => value ?? '1.00000000',
  from: (value?: string | null) => value ?? '1.00000000',
};
