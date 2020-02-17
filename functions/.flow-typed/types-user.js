// @flow
export class User {
  id: string;
  phone: string;
  referralCode: string;
  stripeCustomer: string;
  card: any;
  spent: number;
  referredByCode: string;
  tokens: number;
  aliasedTo: string;
  lifetimeSpent: number;
  lifetimeMinutes: number;
  lifetimeZaps: number;
  lifetimeTokens: number;
  lifetimeTokenValue: number;
}
