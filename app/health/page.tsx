import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StatusDot } from "@/components/ui/StatusDot";
import { Container } from "@/components/layout/SiteShell";
import { CURRENT_PHASE, SIH_PROBLEM_CODE } from "@/lib/constants";
import { getHealthPayload } from "@/lib/env";
import { Activity, Cpu, Terminal } from "lucide-react";

const LABELS: Record<string, string> = {
  supabase: "Database / Auth (Supabase)",
  weather: "Weather API (Open-Meteo)",
  official_alerts: "Official Alert Sources",
  llm: "LLM API",
  mapbox: "Geospatial Maps",
  notifications: "Web Push",
  voice: "Voice (STT / TTS)",
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "System Status",
};

export default function HealthPage() {
  const health = getHealthPayload();

  return (
    <div className="py-10 sm:py-16">
      <Container className="space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3.5 py-1 text-xs font-medium text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span>{SIH_PROBLEM_CODE} · Phase {CURRENT_PHASE} Prototype</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            System Health &amp; Telemetry Status
          </h1>
          <p className="wgpt-body-text max-w-2xl text-xs sm:text-sm text-neutral-400">
            Confirms the WeatherGPT application engine is running with locked 7-step pipeline modules.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card variant="glassStrong" className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-neutral-400">
              <span>Engine Status</span>
              <Activity className="h-4 w-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">Operational</p>
            <Badge tone="ok">All Core Pipelines Active</Badge>
          </Card>

          <Card variant="glassStrong" className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-neutral-400">
              <span>Service Identifier</span>
              <Cpu className="h-4 w-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{health.service}</p>
            <span className="text-xs text-neutral-400 font-mono">Build Phase {health.phase}</span>
          </Card>

          <Card variant="glassStrong" className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-neutral-400">
              <span>Last Heartbeat</span>
              <Terminal className="h-4 w-4 text-white" />
            </div>
            <p className="text-xs font-mono text-neutral-300 break-all pt-1">{health.timestamp}</p>
            <Badge tone="neutral">Live Clock</Badge>
          </Card>
        </div>

        <Card variant="glassStrong" className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h2 className="text-base font-bold text-white">Provider Integration Grid</h2>
            <span className="text-xs text-neutral-400">Connected Services</span>
          </div>

          <ul className="divide-y divide-neutral-800">
            {health.integrations.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between text-sm"
              >
                <span className="flex items-center gap-2.5 font-medium text-neutral-200">
                  <StatusDot configured={item.configured} />
                  {LABELS[item.id] ?? item.id}
                </span>
                <Badge tone={item.configured ? "ok" : "warn"}>
                  {item.status.replaceAll("_", " ")}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">System Architecture Notes</h3>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-neutral-400">
            {health.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-neutral-500">
          JSON Telemetry Endpoint:{" "}
          <a className="font-mono font-semibold text-white hover:underline" href="/api/health">
            /api/health
          </a>
        </p>
      </Container>
    </div>
  );
}
