"use client";

import { useState } from "react";
import {
  Bot,
  Calendar,
  Globe,
  Mic,
  Shield,
  Sparkles,
  Video,
} from "lucide-react";

import { ToggleSwitch } from "@/components/profile/toggle-switch";
import {
  Button,
  Card,
  CardContent,
  Input,
  StatusBadge,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type Integration = {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  icon: React.ReactNode;
  iconClassName: string;
};

function GoogleMeetIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path fill="#00832D" d="M12 10.5v3l4.25 2.45.73-1.23L14.5 13V8.5l-2.5-1.45L12 10.5z" />
      <path fill="#0066DA" d="M6 7.5v9l5.5 3.18V7.5H6z" />
      <path fill="#E94235" d="M17.25 6.27L12 3.5 6 7.5h6.5L17.25 6.27z" />
      <path fill="#2684FC" d="M17.25 17.73L12 20.5l-5.5-3.18V16.5L12 19.5l5.25-3.03.73 1.23z" />
      <path fill="#00AC47" d="M18 8.5v7l-2.5 1.45V7.5L18 8.5z" />
      <path fill="#FFBA00" d="M6 7.5L3.5 6.05A2 2 0 0 0 3 7.73v8.54a2 2 0 0 0 .5 1.68L6 16.5V7.5z" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="#2D8CFF">
      <path d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5A2.25 2.25 0 0 1 19.5 6.75v6A2.25 2.25 0 0 1 17.25 15H6.75A2.25 2.25 0 0 1 4.5 12.75v-6zM15 9.75l5.25-3v10.5L15 14.25V9.75z" />
    </svg>
  );
}

function TeamsIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path fill="#5059C9" d="M18.5 8.25a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z" />
      <path fill="#7B83EB" d="M16.25 10.5H12a2.25 2.25 0 0 0-2.25 2.25v5.25A2.25 2.25 0 0 0 12 20.25h4.25A2.25 2.25 0 0 0 18.5 18V10.5z" />
      <path fill="#4B53BC" d="M10.5 9.75H6.75A2.25 2.25 0 0 0 4.5 12v5.25A2.25 2.25 0 0 0 6.75 19.5h3.75V9.75z" />
    </svg>
  );
}

const initialIntegrations: Integration[] = [
  {
    id: "calendar",
    name: "Google Calendar",
    description: "Sync upcoming meetings and auto-schedule recordings",
    connected: true,
    icon: <Calendar className="size-5 text-blue-600" />,
    iconClassName: "bg-blue-50",
  },
  {
    id: "meet",
    name: "Google Meet",
    description: "Join and record Google Meet sessions automatically",
    connected: true,
    icon: <GoogleMeetIcon />,
    iconClassName: "bg-emerald-50",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Connect your Zoom account for seamless bot deployment",
    connected: false,
    icon: <ZoomIcon />,
    iconClassName: "bg-sky-50",
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Enable recording for Teams meetings and channels",
    connected: false,
    icon: <TeamsIcon />,
    iconClassName: "bg-indigo-50",
  },
];

export function SettingsPageContent() {
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [autoRecord, setAutoRecord] = useState(true);
  const [autoJoin, setAutoJoin] = useState(true);
  const [transcription, setTranscription] = useState(true);
  const [aiSummary, setAiSummary] = useState(true);
  const [emailRecap, setEmailRecap] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);
  const [botStatusAlerts, setBotStatusAlerts] = useState(false);
  const [botName, setBotName] = useState("MeetingBot Assistant");
  const [saved, setSaved] = useState(false);

  const toggleIntegration = (id: string) => {
    setIntegrations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, connected: !item.connected } : item,
      ),
    );
  };

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure integrations, notifications, and recording preferences.
          </p>
        </div>
        <Button className="h-10 shrink-0 rounded-xl px-5 text-sm font-semibold" onClick={handleSave}>
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm ring-0">
        <CardContent className="py-5">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Integrations</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your meeting platforms and calendar to automate recordings.
          </p>

          <ul className="mt-5 divide-y divide-slate-100">
            {integrations.map((integration) => (
              <li
                key={integration.id}
                className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl",
                      integration.iconClassName,
                    )}
                  >
                    {integration.icon}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{integration.name}</p>
                      <StatusBadge
                        status={integration.connected ? "active" : "inactive"}
                        label={integration.connected ? "Connected" : "Not connected"}
                        className={
                          integration.connected
                            ? undefined
                            : "bg-slate-100 text-slate-600"
                        }
                      />
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant={integration.connected ? "outline" : "default"}
                  size="sm"
                  className="shrink-0 rounded-lg"
                  onClick={() => toggleIntegration(integration.id)}
                >
                  {integration.connected ? "Disconnect" : "Connect"}
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm ring-0">
          <CardContent className="py-5">
            <div className="flex items-center gap-2">
              <Mic className="size-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Recording Preferences</h2>
            </div>
            <div className="mt-2 divide-y divide-slate-100">
              <ToggleSwitch
                checked={autoRecord}
                onChange={setAutoRecord}
                label="Auto-record scheduled meetings"
                description="Start recording when a synced meeting begins"
              />
              <ToggleSwitch
                checked={autoJoin}
                onChange={setAutoJoin}
                label="Auto-join meetings"
                description="Bot joins 2 minutes before the scheduled start"
              />
              <ToggleSwitch
                checked={transcription}
                onChange={setTranscription}
                label="Live transcription"
                description="Generate real-time transcripts during calls"
              />
              <ToggleSwitch
                checked={aiSummary}
                onChange={setAiSummary}
                label="AI meeting summaries"
                description="Send a recap with action items after each meeting"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm ring-0">
          <CardContent className="py-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Notifications</h2>
            </div>
            <div className="mt-2 divide-y divide-slate-100">
              <ToggleSwitch
                checked={emailRecap}
                onChange={setEmailRecap}
                label="Email recap"
                description="Daily digest of recorded meetings"
              />
              <ToggleSwitch
                checked={meetingReminders}
                onChange={setMeetingReminders}
                label="Meeting reminders"
                description="Notify 15 minutes before upcoming sessions"
              />
              <ToggleSwitch
                checked={botStatusAlerts}
                onChange={setBotStatusAlerts}
                label="Bot status alerts"
                description="Alerts when the bot fails to join or record"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm ring-0">
          <CardContent className="py-5">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Bot Configuration</h2>
            </div>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="bot-name" className="text-xs font-medium text-muted-foreground">
                  Bot display name
                </label>
                <Input
                  id="bot-name"
                  value={botName}
                  onChange={(event) => setBotName(event.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="bot-language" className="text-xs font-medium text-muted-foreground">
                  Transcription language
                </label>
                <Input
                  id="bot-language"
                  defaultValue="English (US)"
                  className="h-10 rounded-xl"
                  readOnly
                />
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Video className="size-4 shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Bot joins with camera off and microphone muted by default.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm ring-0">
          <CardContent className="py-5">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Data & Privacy</h2>
            </div>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Export meeting data", description: "Download transcripts and summaries" },
                { label: "Retention policy", description: "Recordings kept for 90 days" },
                { label: "Delete all recordings", description: "Permanently remove stored data" },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 rounded-lg">
                    Manage
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
