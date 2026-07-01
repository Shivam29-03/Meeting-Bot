import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { Loading } from "@/components/ui";

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading fullScreen label="Loading..." />}>
      <LoginForm />
    </Suspense>
  );
}
