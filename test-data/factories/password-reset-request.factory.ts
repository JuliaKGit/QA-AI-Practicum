import { faker } from '@faker-js/faker';

/** Payload for the `/forgot-password` **Email** field before **Send reset link**. */
export type PasswordResetRequestPayload = {
  /** Accessible label **Email**; live control is `input[type="email"]`, required. */
  email: string;
};

/** Story example email for AC3 (valid format, not registered). */
export function buildAc3UnregisteredPasswordResetRequest(): PasswordResetRequestPayload {
  return { email: 'nobody@example.com' };
}

/** Unique syntactically valid email for an unregistered reset request (AC3-style). */
export function buildUnregisteredPasswordResetRequest(): PasswordResetRequestPayload {
  return {
    email: `nobody-${Date.now()}@example.com`,
  };
}

/** Unique syntactically valid email from Faker for reset-link request tests. */
export function buildPasswordResetRequest(): PasswordResetRequestPayload {
  const local = `${faker.person.firstName().toLowerCase()}-${Date.now()}`;
  return {
    email: faker.internet.email({ firstName: local, provider: 'example.com' }),
  };
}

/** Wraps a known registered account email for reset-link success (AC4). */
export function buildRegisteredPasswordResetRequest(
  registeredEmail: string,
): PasswordResetRequestPayload {
  return { email: registeredEmail };
}
