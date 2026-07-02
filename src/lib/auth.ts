import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth-options";


export async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}