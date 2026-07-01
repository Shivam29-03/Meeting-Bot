"use client";

import {
  ChevronRight,
  Globe,
  HardDrive,
  KeyRound,
  Mail,
  MapPin,
  Pencil,
  Shield,
  Smartphone,
} from "lucide-react";
import { useSession } from "next-auth/react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  Input,
  StatusBadge,
} from "@/components/ui";

export function ProfilePageContent() {
  const { data: session } = useSession();
  const displayName = session?.user?.name ?? "Harshitha Rachepalli";
  const email = session?.user?.email ?? "harshitha@meetingbot.com";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">User Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information and security settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="h-fit border-slate-200 shadow-sm ring-0">
          <CardContent className="py-6 text-center">
            <div className="relative mx-auto w-fit">
              <Avatar className="size-24">
                {session?.user?.image ? (
                  <AvatarImage src={session.user.image} alt={displayName} />
                ) : null}
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white"
                aria-label="Edit photo"
              >
                <Pencil className="size-3.5" />
              </button>
            </div>

            <h2 className="mt-4 text-lg font-bold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground">Senior Product Manager</p>

            <div className="mt-3 flex justify-center gap-2">
              <StatusBadge status="active" label="Active" />
              <StatusBadge status="pending" label="Pro Plan" className="bg-indigo-100 text-indigo-700" />
            </div>

            <ul className="mt-6 space-y-3 text-left text-sm">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{email}</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                San Francisco, CA
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Globe className="size-4 shrink-0" />
                Member since Jan 2024
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-slate-200 shadow-sm ring-0 sm:col-span-2">
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">Account Settings</h3>
                <Button variant="outline" size="sm" className="rounded-lg">
                  Edit Settings
                </Button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                  <Input defaultValue={displayName} className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Timezone</label>
                  <Input defaultValue="Pacific Time (PT)" className="h-10 rounded-xl" readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Interface Language
                  </label>
                  <Input defaultValue="English (US)" className="h-10 rounded-xl" readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Company</label>
                  <Input defaultValue="MeetingBot Inc." className="h-10 rounded-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm ring-0 sm:col-span-2">
            <CardContent className="py-5">
              <h3 className="text-base font-semibold text-foreground">Security</h3>
              <ul className="mt-3 divide-y divide-slate-100">
                {[
                  { icon: KeyRound, label: "Change Password" },
                  { icon: Shield, label: "Two-Factor Auth", badge: "OFF" },
                  { icon: Smartphone, label: "Manage Devices" },
                ].map(({ icon: Icon, label, badge }) => (
                  <li key={label}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-3 text-sm font-medium text-foreground hover:text-primary"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="size-4 text-muted-foreground" />
                        {label}
                      </span>
                      <span className="flex items-center gap-2">
                        {badge ? (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                            {badge}
                          </span>
                        ) : null}
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm ring-0 sm:col-span-2">
            <CardContent className="py-5">
              <div className="flex items-center gap-2">
                <HardDrive className="size-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">Cloud Storage</h3>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">42.5 GB of 100 GB used</span>
                  <span className="font-medium text-foreground">42%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[42%] rounded-full bg-primary" />
                </div>
                <div className="mt-4 flex gap-4">
                  <button
                    type="button"
                    className="text-sm font-medium text-primary hover:text-primary/80"
                  >
                    Upgrade Plan
                  </button>
                  <button
                    type="button"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Manage Recordings
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
