"use client";

import { useEffect, useState } from "react";
import Alert from "../components/Alert";
import Field from "../components/Field";
import { Avatar } from "../components/Navbar";
import {
  validateProfile,
  type ProfileErrors,
  type ProfileField,
  type ProfileFormValues,
  type ProfileSettings,
} from "@/lib/profile";

type Account = {
  name: string;
  email: string;
  emailVerified: boolean;
  picture: string | null;
  provider: string;
  updatedAt: string | null;
};

const toForm = (p: ProfileSettings): ProfileFormValues => ({
  name: p.name,
  phone: p.phone,
  line1: p.address?.line1 ?? "",
  line2: p.address?.line2 ?? "",
  city: p.address?.city ?? "",
  postalCode: p.address?.postalCode ?? "",
  country: p.address?.country ?? "",
  newsletter: p.newsletter,
  orderUpdates: p.orderUpdates,
});

export default function ProfileView({ account }: { account: Account }) {
  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileFormValues | null>(null);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.profile) throw new Error(data?.message ?? `Request failed (${res.status})`);
        if (!cancelled) setProfile(data.profile);
      })
      .catch((err: Error) => !cancelled && setLoadError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const startEditing = () => {
    if (!profile) return;
    setForm(toForm(profile));
    setErrors({});
    setStatus(null);
    setEditing(true);
  };

  const update = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Client-side validation (same rules the server uses)
    const check = validateProfile(form);
    if (!check.ok) {
      setErrors(check.errors);
      setStatus({ type: "error", message: "Please fix the highlighted fields." });
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        // /auth/login is handled by the Auth0 SDK (not a Next.js page), so a full navigation is required.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/auth/login?returnTo=/profile";
        return;
      }
      if (!res.ok) {
        if (data?.errors) setErrors(data.errors);
        throw new Error(data?.message ?? `Server error (${res.status})`);
      }

      setProfile(data.profile);
      setEditing(false);
      setStatus({ type: "success", message: "Your profile has been saved." });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Could not save your profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const input = (field: ProfileField, props: React.InputHTMLAttributes<HTMLInputElement> = {}) =>
    form && (
      <input
        id={field}
        name={field}
        className="input"
        value={form[field]}
        onChange={(e) => update(field, e.target.value)}
        aria-invalid={!!errors[field]}
        aria-describedby={errors[field] ? `${field}-error` : undefined}
        {...props}
      />
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile &amp; Settings</h1>
        <p className="mt-1 text-muted">Manage your account information, shipping address and preferences.</p>
      </header>

      {status && <Alert variant={status.type}>{status.message}</Alert>}

      {/* Account summary (from Auth0) */}
      <section className="card mb-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <Avatar name={account.name || account.email} picture={account.picture} size={72} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-semibold">{profile?.name || account.name}</h2>
          <p className="flex flex-wrap items-center gap-2 text-muted">
            <span className="truncate">{account.email}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                account.emailVerified ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
              }`}
            >
              {account.emailVerified ? "Verified" : "Not verified"}
            </span>
          </p>
          <p className="mt-1 text-xs text-subtle">
            Signed in with {account.provider}
            {account.updatedAt && ` · last updated ${new Date(account.updatedAt).toLocaleDateString()}`}
          </p>
        </div>
        {!editing && (
          <button type="button" className="btn btn-primary" onClick={startEditing} disabled={!profile}>
            Edit profile
          </button>
        )}
      </section>

      {loadError && <Alert variant="error">Could not load your saved settings: {loadError}</Alert>}

      {!profile && !loadError && (
        <div className="card animate-pulse p-6" aria-busy="true">
          <div className="mb-3 h-4 w-40 rounded bg-surface-muted" />
          <div className="h-4 w-64 rounded bg-surface-muted" />
        </div>
      )}

      {/* Read-only view */}
      {profile && !editing && (
        <div className="grid gap-6 md:grid-cols-2">
          <section className="card p-6">
            <h3 className="mb-4 text-lg font-semibold">Personal information</h3>
            <dl className="space-y-3 text-sm">
              <Row label="Full name" value={profile.name} />
              <Row label="Email" value={account.email} />
              <Row label="Phone" value={profile.phone} />
            </dl>
          </section>

          <section className="card p-6">
            <h3 className="mb-4 text-lg font-semibold">Shipping address</h3>
            {profile.address ? (
              <address className="text-sm not-italic leading-6">
                {profile.address.line1}
                {profile.address.line2 && <><br />{profile.address.line2}</>}
                <br />
                {profile.address.postalCode} {profile.address.city}
                <br />
                {profile.address.country}
              </address>
            ) : (
              <p className="text-sm text-muted">
                No shipping address yet.{" "}
                <button type="button" onClick={startEditing} className="font-semibold text-primary hover:underline">
                  Add one
                </button>
              </p>
            )}
          </section>

          <section className="card p-6 md:col-span-2">
            <h3 className="mb-4 text-lg font-semibold">Preferences</h3>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Row label="Order status emails" value={profile.orderUpdates ? "On" : "Off"} />
              <Row label="Newsletter" value={profile.newsletter ? "Subscribed" : "Not subscribed"} />
            </dl>
          </section>
        </div>
      )}

      {/* Edit form */}
      {editing && form && (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <fieldset className="card p-6">
            <legend className="sr-only">Personal information</legend>
            <h3 className="mb-4 text-lg font-semibold">Personal information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Full name" required error={errors.name}>
                {input("name", { autoComplete: "name", maxLength: 80 })}
              </Field>
              <Field id="email" label="Email" hint="Managed by your login provider">
                <input id="email" className="input opacity-70" value={account.email} readOnly />
              </Field>
              <Field id="phone" label="Phone" error={errors.phone} hint="Optional, e.g. +90 555 123 45 67">
                {input("phone", { type: "tel", autoComplete: "tel" })}
              </Field>
            </div>
          </fieldset>

          <fieldset className="card p-6">
            <legend className="sr-only">Shipping address</legend>
            <h3 className="mb-1 text-lg font-semibold">Shipping address</h3>
            <p className="mb-4 text-sm text-muted">Optional — leave all fields empty to remove your address.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="line1" label="Address line 1" required error={errors.line1} className="sm:col-span-2">
                {input("line1", { autoComplete: "address-line1" })}
              </Field>
              <Field id="line2" label="Address line 2" error={errors.line2} className="sm:col-span-2">
                {input("line2", { autoComplete: "address-line2" })}
              </Field>
              <Field id="city" label="City" required error={errors.city}>
                {input("city", { autoComplete: "address-level2" })}
              </Field>
              <Field id="postalCode" label="Postal code" required error={errors.postalCode}>
                {input("postalCode", { autoComplete: "postal-code" })}
              </Field>
              <Field id="country" label="Country" required error={errors.country}>
                {input("country", { autoComplete: "country-name" })}
              </Field>
            </div>
          </fieldset>

          <fieldset className="card space-y-3 p-6">
            <legend className="sr-only">Preferences</legend>
            <h3 className="mb-1 text-lg font-semibold">Preferences</h3>
            <Toggle
              label="Email me about my order status"
              checked={form.orderUpdates}
              onChange={(v) => update("orderUpdates", v)}
            />
            <Toggle
              label="Subscribe to the newsletter"
              checked={form.newsletter}
              onChange={(v) => update("newsletter", v)}
            />
          </fieldset>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="btn btn-primary flex-1 py-3" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              className="btn btn-secondary py-3"
              disabled={saving}
              onClick={() => {
                setEditing(false);
                setErrors({});
                setStatus(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-2 last:border-0 last:pb-0">
      <dt className="text-muted">{label}</dt>
      <dd className="truncate text-right font-medium">{value || "—"}</dd>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary"
      />
      {label}
    </label>
  );
}
