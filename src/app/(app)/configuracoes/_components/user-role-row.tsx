"use client";

import { useTransition } from "react";
import { USER_ROLES } from "@/lib/constants";
import { updateUserRole } from "../actions";

export function UserRoleRow({
  userId,
  fullName,
  role,
  isSelf,
}: {
  userId: string;
  fullName: string;
  role: string;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleChange(value: string) {
    const formData = new FormData();
    formData.set("role", value);
    startTransition(() => updateUserRole(userId, formData));
  }

  return (
    <tr className="border-b border-kadosh-burnt/8 last:border-0">
      <td className="px-4 py-3 text-kadosh-beige-light">
        {fullName} {isSelf && <span className="text-xs text-kadosh-beige-mid/50">(você)</span>}
      </td>
      <td className="px-4 py-3">
        <select
          defaultValue={role}
          disabled={pending}
          onChange={(e) => handleChange(e.target.value)}
          className="rounded-lg border border-kadosh-burnt/25 bg-kadosh-black/50 px-2.5 py-1.5 text-sm text-kadosh-beige-light"
        >
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </td>
    </tr>
  );
}
