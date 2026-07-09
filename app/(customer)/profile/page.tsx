import { getSession } from "@/lib/auth-utils";
import { ProfileForm } from "@/components/forms/profile-form";
import { formatDateSAST } from "@/lib/utils";

export default async function ProfilePage() {
  const session = (await getSession())!;
  const { user } = session;

  return (
    <div className="mx-auto max-w-lg space-y-8">
      {/* Editorial header */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-green-400/40" />
          <p className="text-[10px] font-semibold tracking-[0.3em] text-green-400 uppercase">Account</p>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-text-primary">Profile Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage your account information.</p>
      </div>

      <div className="rounded-xl border border-white/[0.04] bg-surface p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-6 bg-green-400/40" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-green-400/80">Account Info</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/[0.04] pb-2">
            <span className="text-text-secondary">Email</span>
            <span className="text-text-primary">{user.email}</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.04] pb-2">
            <span className="text-text-secondary">Role</span>
            <span className="text-text-primary capitalize">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Member since</span>
            <span className="text-text-primary">{formatDateSAST(user.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-green-400/20 to-transparent" />

      <div className="rounded-xl border border-white/[0.04] bg-surface p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-6 bg-green-400/40" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-green-400/80">Edit Profile</h2>
        </div>
        <ProfileForm currentName={user.name} />
      </div>
    </div>
  );
}
