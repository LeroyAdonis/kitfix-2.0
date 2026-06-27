import { getSession } from "@/lib/auth-utils";
import { ProfileForm } from "@/components/forms/profile-form";
import { formatDateSAST } from "@/lib/utils";

export default async function ProfilePage() {
  const session = (await getSession())!;
  const { user } = session;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">Profile Settings</h1>
        <p className="text-text-secondary">Manage your account information.</p>
      </div>

      <div className="card-base p-5">
        <h2 className="mb-4 text-base font-semibold text-text-primary">Account Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Email</span>
            <span className="text-text-primary">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Role</span>
            <span className="text-text-primary capitalize">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Member since</span>
            <span className="text-text-primary">{formatDateSAST(user.createdAt)}</span>
          </div>
        </div>
      </div>

      <hr className="border-color-border" />

      <div className="card-base p-5">
        <h2 className="mb-4 text-base font-semibold text-text-primary">Edit Profile</h2>
        <ProfileForm currentName={user.name} />
      </div>
    </div>
  );
}
