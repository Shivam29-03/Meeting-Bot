import { Logo } from "@/components/brand/Logo";

export function LoginHero() {
  return (
    <div className="relative hidden w-1/2 flex-col overflow-hidden bg-brand-navy lg:flex">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.2),_transparent_55%)]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 flex flex-1 flex-col p-10 xl:p-14">
        <Logo />

        <div className="mt-16 max-w-lg">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
            Capture every detail,
            <br />
            Effortlessly.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Your AI-powered meeting assistant that records, transcribes, and
            summarizes every conversation — so nothing falls through the cracks.
          </p>
        </div>

        <div className="relative mt-10 flex flex-1 items-end">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#111a2e] shadow-2xl shadow-black/40">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
              <span className="size-2.5 rounded-full bg-red-400/80" />
              <span className="size-2.5 rounded-full bg-amber-400/80" />
              <span className="size-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <div className="flex min-h-[220px] p-4">
              <div className="w-16 shrink-0 space-y-2 rounded-lg bg-brand-navy-light/60 p-2">
                <div className="h-2 w-full rounded bg-primary/60" />
                <div className="h-2 w-3/4 rounded bg-white/10" />
                <div className="h-2 w-full rounded bg-white/10" />
                <div className="h-2 w-2/3 rounded bg-white/10" />
              </div>
              <div className="ml-3 flex flex-1 flex-col gap-2">
                <div className="h-8 rounded-lg bg-white/5" />
                <div className="flex-1 rounded-xl bg-gradient-to-br from-primary/30 to-indigo-900/40 p-3">
                  <div className="h-3 w-24 rounded bg-white/20" />
                  <div className="mt-3 h-10 rounded-lg bg-white/10" />
                  <div className="mt-2 flex gap-2">
                    <div className="h-6 flex-1 rounded bg-primary/40" />
                    <div className="h-6 w-16 rounded bg-white/10" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-14 rounded-lg bg-white/5" />
                  <div className="h-14 rounded-lg bg-white/5" />
                  <div className="h-14 rounded-lg bg-white/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
