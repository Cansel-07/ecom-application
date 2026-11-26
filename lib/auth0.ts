import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  // useUser() treats 204 as "logged out"; without this, /auth/profile returns 401 and surfaces as an error.
  noContentProfileResponseWhenUnauthenticated: true,
});
