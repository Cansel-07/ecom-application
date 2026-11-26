import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { validateProfile, type ProfileSettings } from "@/lib/profile";
import { store } from "@/lib/store";

const fail = (status: number, message: string, errors?: Record<string, string>) =>
  NextResponse.json({ success: false, message, ...(errors ? { errors } : {}) }, { status });

/** Returns the saved settings of the logged-in user (falls back to Auth0 data). */
export async function GET() {
  const session = await auth0.getSession();
  if (!session) return fail(401, "You must be logged in.");

  const { user } = session;
  const saved = store.profiles.get(user.sub);
  const profile: ProfileSettings = saved ?? {
    name: user.name ?? user.nickname ?? "",
    phone: "",
    address: null,
    newsletter: false,
    orderUpdates: true,
  };
  return NextResponse.json({ success: true, profile });
}

/** Updates the logged-in user's settings. */
export async function PUT(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session) return fail(401, "You must be logged in.");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(400, "Request body is not valid JSON.");
    }

    const result = validateProfile(body);
    if (!result.ok) return fail(422, "Please fix the highlighted fields.", result.errors);

    store.profiles.set(session.user.sub, result.data);
    return NextResponse.json({ success: true, message: "Profile saved.", profile: result.data });
  } catch (error) {
    console.error("PUT /api/profile failed:", error);
    return fail(500, "Could not save your profile. Please try again later.");
  }
}
