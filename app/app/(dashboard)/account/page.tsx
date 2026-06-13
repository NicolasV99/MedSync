import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AccountSettingsForm } from "@/components/account/AccountSettingsForm";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

type AccountRow = {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = Number(session.user.id);

  if (Number.isNaN(userId)) {
    redirect("/login");
  }

  const result = await getPool().query<AccountRow>(
    `SELECT first_name, last_name, email, role
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [userId],
  );

  const user = result.rows[0];

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-neutral-dark">Configuration</h1>
        <p className="text-sm text-neutral-gray">
          Update your name and password from one place.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-neutral-border bg-white p-6 shadow-sm">
          <AccountSettingsForm
            fullName={`${user.first_name} ${user.last_name}`.trim()}
            role={user.role}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-dark">
              Email address
            </h2>
            {/* Email is visible for reference, but edits are disabled by product decision. */}
            <p className="mt-2 text-sm text-neutral-gray">{user.email}</p>
            <p className="mt-2 text-xs text-neutral-gray">
              Email changes are restricted for now.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-dark">
              What you can change
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-neutral-gray">
              <li>• Full name</li>
              <li>• Password</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-border bg-primary-light/30 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-primary">Tip</h2>
            <p className="mt-2 text-sm text-neutral-gray">
              Changing your password requires your current password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
