import { AlertCircle } from "lucide-react";

type DatabaseErrorBannerProps = {
  message: string;
};

export function DatabaseErrorBanner({ message }: DatabaseErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900"
    >
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
      <div>
        <p className="text-sm font-semibold">Database connection failed</p>
        <p className="mt-1 text-sm opacity-90">{message}</p>
      </div>
    </div>
  );
}
