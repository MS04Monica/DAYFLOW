"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import {
  getMyProfile,
  updateMyProfile,
} from "@/app/actions/profile";

type Profile = {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  department: string | null;
  designation: string | null;
  phone: string | null;
  address: string | null;
  joining_date: string | null;
  profile_image: string | null;
  role: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = async () => {
    setLoading(true);

    const result = await getMyProfile();

    if (result.success && result.data) {
      const data = result.data as Profile;

      setProfile(data);
      setPhone(data.phone ?? "");
      setAddress(data.address ?? "");
      setProfileImage(data.profile_image ?? "");

      setError("");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const startEditing = () => {
    if (!profile) return;

    setPhone(profile.phone ?? "");
    setAddress(profile.address ?? "");
    setProfileImage(profile.profile_image ?? "");

    setMessage("");
    setError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    if (!profile) return;

    setPhone(profile.phone ?? "");
    setAddress(profile.address ?? "");
    setProfileImage(profile.profile_image ?? "");

    setMessage("");
    setError("");
    setEditing(false);
  };

  const saveProfile = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const result = await updateMyProfile({
      phone: phone.trim(),
      address: address.trim(),
      profile_image: profileImage.trim(),
    });

    if (result.success && result.data) {
      setProfile(result.data as Profile);

      setMessage(
        result.message || "Profile updated successfully."
      );

      setEditing(false);
    } else {
      setError(result.message);
    }

    setSaving(false);
  };

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const formatJoiningDate = (
    value: string | null | undefined
  ) => {
    if (!value) return "Not available";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(date);
  };

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1400px]">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <button
              onClick={() => window.history.back()}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-600">
              Employee workspace
            </p>

            <h1 className="text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">
              My Profile
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Manage your personal information and view
              your employee details.
            </p>

          </div>

          {!loading && profile && !editing && (
            <button
              onClick={startEditing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Pencil size={16} />
              Edit profile
            </button>
          )}

        </header>

        {/* =====================================================
            FEEDBACK
        ====================================================== */}

        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={19} />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading ? (

          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">

            <div className="h-[430px] animate-pulse rounded-[30px] bg-slate-200" />

            <div className="h-[430px] animate-pulse rounded-[30px] bg-slate-200" />

          </div>

        ) : !profile ? (

          <div className="rounded-[30px] border border-slate-200 bg-white p-12 text-center shadow-sm">

            <User
              size={42}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-5 text-xl font-black text-slate-800">
              Profile unavailable
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              We couldn't load your employee profile.
            </p>

          </div>

        ) : (

          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">

            {/* =================================================
                PROFILE CARD
            ================================================== */}

            <section className="relative overflow-hidden rounded-[30px] bg-[#06101f] p-7 text-white shadow-[0_25px_60px_rgba(15,23,42,0.14)] sm:p-8">

              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative">

                {/* AVATAR */}

                <div className="flex items-center justify-between">

                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-cyan-300 to-cyan-600 text-3xl font-black text-slate-950 shadow-[0_12px_30px_rgba(34,211,238,0.2)]">

                    {profile.profile_image ? (
                      <img
                        src={profile.profile_image}
                        alt={profile.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}

                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black text-emerald-300">

                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    ACTIVE

                  </div>

                </div>

                {/* NAME */}

                <div className="mt-8">

                  <p className="text-3xl font-black tracking-[-0.04em]">
                    {profile.name}
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-400">
                    {profile.designation ||
                      "Employee"}
                  </p>

                </div>

                {/* EMPLOYEE ID */}

                <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.05] p-4">

                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Employee ID
                  </p>

                  <p className="mt-2 font-mono text-sm font-bold text-cyan-300">
                    {profile.employee_id ||
                      "Not assigned"}
                  </p>

                </div>

                {/* INFO */}

                <div className="mt-5 space-y-4">

                  <DarkInfo
                    icon={<Mail size={16} />}
                    label="Email"
                    value={profile.email}
                  />

                  <DarkInfo
                    icon={<BriefcaseBusiness size={16} />}
                    label="Department"
                    value={
                      profile.department ||
                      "Not assigned"
                    }
                  />

                  <DarkInfo
                    icon={<CalendarDays size={16} />}
                    label="Joined"
                    value={formatJoiningDate(
                      profile.joining_date
                    )}
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                DETAILS
            ================================================== */}

            <section className="rounded-[30px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">

              <div className="flex items-center justify-between border-b border-slate-100 p-6 sm:p-8">

                <div>

                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600">
                    Personal information
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
                    Profile details
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Keep your contact information up to date.
                  </p>

                </div>

                <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 sm:flex">
                  <User size={19} />
                </div>

              </div>

              {editing ? (

                /* =================================================
                   EDIT FORM
                ================================================== */

                <form
                  onSubmit={saveProfile}
                  className="p-6 sm:p-8"
                >

                  <div className="grid gap-6 sm:grid-cols-2">

                    {/* PHONE */}

                    <div>

                      <label className="mb-2 block text-xs font-bold text-slate-600">
                        Phone number
                      </label>

                      <div className="relative">

                        <Phone
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          value={phone}
                          onChange={(event) =>
                            setPhone(
                              event.target.value
                            )
                          }
                          maxLength={30}
                          placeholder="Enter phone number"
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                        />

                      </div>

                    </div>

                    {/* EMAIL - READ ONLY */}

                    <div>

                      <label className="mb-2 block text-xs font-bold text-slate-600">
                        Email
                      </label>

                      <div className="relative">

                        <Mail
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          value={profile.email}
                          disabled
                          className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-500 outline-none"
                        />

                      </div>

                      <p className="mt-2 text-[10px] text-slate-400">
                        Email is managed by your account.
                      </p>

                    </div>

                    {/* ADDRESS */}

                    <div className="sm:col-span-2">

                      <label className="mb-2 block text-xs font-bold text-slate-600">
                        Address
                      </label>

                      <div className="relative">

                        <MapPin
                          size={16}
                          className="absolute left-4 top-4 text-slate-400"
                        />

                        <textarea
                          value={address}
                          onChange={(event) =>
                            setAddress(
                              event.target.value
                            )
                          }
                          maxLength={500}
                          rows={4}
                          placeholder="Enter your address"
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm leading-6 text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                        />

                      </div>

                      <p className="mt-1 text-right text-[10px] text-slate-400">
                        {address.length}/500
                      </p>

                    </div>

                    {/* PROFILE IMAGE */}

                    <div className="sm:col-span-2">

                      <label className="mb-2 block text-xs font-bold text-slate-600">
                        Profile image URL
                      </label>

                      <input
                        value={profileImage}
                        onChange={(event) =>
                          setProfileImage(
                            event.target.value
                          )
                        }
                        placeholder="https://..."
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                      />

                      <p className="mt-2 text-[10px] text-slate-400">
                        Optional. Use a publicly accessible image URL.
                      </p>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      <X size={16} />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save size={16} />

                      {saving
                        ? "Saving..."
                        : "Save changes"}
                    </button>

                  </div>

                </form>

              ) : (

                /* =================================================
                   READ ONLY
                ================================================== */

                <div className="p-6 sm:p-8">

                  <div className="grid gap-4 sm:grid-cols-2">

                    <InfoCard
                      icon={<Phone size={18} />}
                      label="Phone"
                      value={
                        profile.phone ||
                        "Not provided"
                      }
                    />

                    <InfoCard
                      icon={<Mail size={18} />}
                      label="Email"
                      value={profile.email}
                    />

                    <InfoCard
                      icon={<BriefcaseBusiness size={18} />}
                      label="Department"
                      value={
                        profile.department ||
                        "Not assigned"
                      }
                    />

                    <InfoCard
                      icon={<ShieldCheck size={18} />}
                      label="Designation"
                      value={
                        profile.designation ||
                        "Not assigned"
                      }
                    />

                    <InfoCard
                      icon={<CalendarDays size={18} />}
                      label="Joining date"
                      value={formatJoiningDate(
                        profile.joining_date
                      )}
                    />

                    <InfoCard
                      icon={<User size={18} />}
                      label="Role"
                      value={
                        profile.role ||
                        "Employee"
                      }
                    />

                  </div>

                  {/* ADDRESS */}

                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
                        <MapPin size={18} />
                      </div>

                      <div>

                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Address
                        </p>

                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                          {profile.address ||
                            "No address provided."}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* SECURITY */}

                  <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-5">

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
                        <ShieldCheck size={18} />
                      </div>

                      <div>

                        <p className="text-sm font-black text-slate-900">
                          Profile securely connected
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Your employee information is loaded directly
                          from the Dayflow backend.
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              )}

            </section>

          </div>

        )}

      </div>
    </main>
  );
}

/* ============================================================
   DARK PROFILE INFO
============================================================ */

function DarkInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-slate-400">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
          {label}
        </p>

        <p className="mt-0.5 truncate text-xs font-semibold text-slate-300">
          {value}
        </p>

      </div>

    </div>
  );
}

/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-cyan-100 hover:bg-cyan-50/30">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-slate-800">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}