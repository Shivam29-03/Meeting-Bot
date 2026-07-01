"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

function hasSessionCookie() {
  return document.cookie.split(";").some((cookie) => {
    const name = cookie.trim().split("=")[0];
    return (
      name === "next-auth.session-token" ||
      name === "__Secure-next-auth.session-token"
    );
  });
}

export function SessionCleanup() {
  const { status } = useSession();
  const cleaned = useRef(false);

  useEffect(() => {
    if (cleaned.current || status !== "unauthenticated") {
      return;
    }

    if (hasSessionCookie()) {
      cleaned.current = true;
      void signOut({ redirect: false });
    }
  }, [status]);

  return null;
}
