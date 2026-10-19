export interface CreateChildPayload {
  firstName: string;
  birthYear: number;
  birthMonth: number;
  gender: string;
  interests: string[];
}

/** Unique child payload for POST /api/v1/children (catalog fields). */
export function buildCreateChildPayload(
  overrides: Partial<CreateChildPayload> = {},
): CreateChildPayload {
  return {
    firstName: `ApiChild${Date.now()}`,
    birthYear: 2019,
    birthMonth: 6,
    gender: 'girl',
    interests: [],
    ...overrides,
  };
}
