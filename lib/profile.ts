// Shared profile schema + validation (client form and /api/profile route).

export interface Address {
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface ProfileSettings {
  name: string;
  phone: string;
  address: Address | null;
  newsletter: boolean;
  orderUpdates: boolean;
}

export type ProfileField = "name" | "phone" | "line1" | "line2" | "city" | "postalCode" | "country";
export type ProfileErrors = Partial<Record<ProfileField, string>>;

export interface ProfileFormValues {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
  newsletter: boolean;
  orderUpdates: boolean;
}

export function validateProfile(
  raw: unknown
): { ok: true; data: ProfileSettings } | { ok: false; errors: ProfileErrors } {
  const body = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const errors: ProfileErrors = {};

  const name = str(body.name);
  if (!name) errors.name = "Name is required";
  else if (name.length > 80) errors.name = "Name must be at most 80 characters";

  const phone = str(body.phone);
  if (phone && !/^\+?[0-9 ()-]{7,20}$/.test(phone)) errors.phone = "Please enter a valid phone number";

  const line1 = str(body.line1);
  const line2 = str(body.line2);
  const city = str(body.city);
  const postalCode = str(body.postalCode);
  const country = str(body.country);

  // The address is optional, but if any part is filled in, the required parts must be complete.
  const anyAddress = [line1, line2, city, postalCode, country].some(Boolean);
  if (anyAddress) {
    if (!line1) errors.line1 = "Address line 1 is required";
    if (!city) errors.city = "City is required";
    if (!postalCode) errors.postalCode = "Postal code is required";
    else if (!/^[A-Za-z0-9 -]{3,10}$/.test(postalCode)) errors.postalCode = "Invalid postal code";
    if (!country) errors.country = "Country is required";
  }
  for (const [k, v] of Object.entries({ line1, line2, city, country }) as [ProfileField, string][]) {
    if (v.length > 100 && !errors[k]) errors[k] = "Must be at most 100 characters";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name,
      phone,
      address: anyAddress ? { line1, line2, city, postalCode, country } : null,
      newsletter: body.newsletter === true,
      orderUpdates: body.orderUpdates !== false,
    },
  };
}
