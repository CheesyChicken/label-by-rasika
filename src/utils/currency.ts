import { CurrencyCode } from '../types';

/**
 * Indicative conversion only.
 *
 * These rates are frozen in source and there is no refresh mechanism, so they
 * drift. Non-INR prices are therefore rendered with a "≈" and the currency
 * code, never as a payable figure — and there is no checkout to pay one with.
 */
export const CURRENCIES: Record<CurrencyCode, { symbol: string; rate: number }> = {
  INR: { symbol: '₹', rate: 1 },
  USD: { symbol: '$', rate: 0.012 },
  GBP: { symbol: '£', rate: 0.0095 },
  EUR: { symbol: '€', rate: 0.011 },
  AED: { symbol: 'AED ', rate: 0.044 },
  CAD: { symbol: 'C$', rate: 0.016 },
};

export const formatPrice = (amountInInr: number, currencyCode: CurrencyCode = 'INR'): string => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const converted = amountInInr * currency.rate;

  if (currencyCode === 'INR') {
    return `₹${Math.round(converted).toLocaleString('en-IN')}`;
  }

  return `≈ ${currency.symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Price for display, or an enquiry prompt when we hold no verified price.
 *
 * Showing an invented number against a real garment misleads the customer and
 * lands on the boutique when they message to order it.
 */
export const displayPrice = (
  product: { price: number; priceOnRequest?: boolean; priceIsIndicative?: boolean },
  currency: CurrencyCode = 'INR'
): string =>
  product.priceOnRequest
    ? 'Price on request'
    : product.priceIsIndicative
    ? `From ${formatPrice(product.price, currency)}`
    : formatPrice(product.price, currency);
