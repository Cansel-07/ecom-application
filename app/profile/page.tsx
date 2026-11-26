import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import ProfileView from "./ProfileView";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  // proxy.ts already redirects guests; this server-side check is defense in depth.
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login?returnTo=/profile");

  const { user } = session;
  return (
    <ProfileView
      account={{
        name: user.name ?? user.nickname ?? "",
        email: user.email ?? "",
        emailVerified: user.email_verified === true,
        picture: user.picture ?? null,
        provider: user.sub.split("|")[0],
        updatedAt: typeof user.updated_at === "string" ? user.updated_at : null,
      }}
    />
  );
}
