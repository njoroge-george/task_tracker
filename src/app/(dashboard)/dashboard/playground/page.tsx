import LiveEditor from "@/components/playground/LiveEditor";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, Lock, Timer } from "lucide-react";

interface PlaygroundPageProps { searchParams?: { [key: string]: string | undefined } }

export default async function PlaygroundPage({ searchParams }: PlaygroundPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="py-12">
        <h1 className="text-2xl font-bold">Sign in required</h1>
        <p className="text-secondary mt-2">Please sign in to access the Playground.</p>
        <Link href="/auth/signin?callbackUrl=/dashboard/playground?startTrial=1" className="mt-4 inline-block px-4 py-2 rounded bg-accent text-white">Start Free Trial</Link>
      </div>
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const now = new Date();
  const trialEndsAt = (user as any)?.trialEndsAt as Date | undefined;
  const trialActive = !!trialEndsAt && trialEndsAt > now;
  let allowed = (user?.plan && user.plan !== "FREE") || trialActive;

  // Auto-start trial if returned from sign-in flow
  if (!allowed && user?.plan === 'FREE' && !trialEndsAt && searchParams?.startTrial === '1') {
    const trialDays = parseInt(process.env.PLAYGROUND_TRIAL_DAYS || '7', 10);
    const trialEndsAt = new Date(now.getTime() + trialDays * 86400000);
    await (prisma as any).user.update({ where: { id: session.user.id }, data: { trialEndsAt } });
    // Re-fetch user for updated state
    const updated = await prisma.user.findUnique({ where: { id: session.user.id } });
    const active = !!((updated as any)?.trialEndsAt) && ((updated as any).trialEndsAt as Date) > new Date();
    if (active) {
      allowed = true;
    }
  }

  if (!allowed) {
    const featureRows: Array<{ label: string; free: boolean; pro: boolean; enterprise?: boolean; upcoming?: boolean }> = [
      { label: "Live HTML/CSS/JS Preview", free: false, pro: true },
      { label: "Python Execution (Pyodide)", free: false, pro: true, upcoming: true },
      { label: "AI Suggestions", free: false, pro: true },
      { label: "Live Predictions", free: false, pro: true },
      { label: "Format on Save", free: false, pro: true },
      { label: "Snippet Sharing & Forks", free: false, pro: true },
      { label: "Upcoming: Version History", free: false, pro: true, upcoming: true },
      { label: "Upcoming: Collaborators", free: false, pro: true, upcoming: true },
    ];
    return (
      <div className="space-y-8 max-w-5xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Playground IDE</h1>
          <p className="text-secondary text-sm">Build, iterate, and share interactive code snippets with AI acceleration.</p>
          <div className="mt-2 inline-flex items-center gap-2 rounded border px-3 py-1 text-xs bg-muted">
            <Lock className="w-3 h-3" /> <span>Locked for Free plan</span>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 border rounded-lg bg-card/50 backdrop-blur">
            <h2 className="font-semibold mb-3">Why upgrade?</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-status-success"/>Ship ideas faster with instant preview & AI inline help.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-status-success"/>Share read‑only links or forkable playgrounds for collaboration.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-status-success"/>Automatic formatting + live predictions reduce friction.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-status-success"/>Roadmap features (history, collaborators) included.</li>
            </ul>
            {user?.plan === 'FREE' ? (
              trialActive ? (
                <div className="mt-5 text-center text-sm font-medium text-accent">Trial active • ends {trialEndsAt?.toLocaleDateString()}</div>
              ) : (
                <form action="/api/subscription/trial" method="post" className="mt-5">
                  <button className="w-full px-4 py-2 rounded bg-accent text-white font-medium hover:bg-accent-hover transition" type="submit">Start Free {process.env.PLAYGROUND_TRIAL_DAYS || '7'}‑Day Trial</button>
                </form>
              )
            ) : (
              <Link href="/dashboard/subscription" className="mt-5 inline-block w-full text-center px-4 py-2 rounded bg-accent text-white font-medium hover:bg-accent-hover transition">Upgrade to Pro</Link>
            )}
            <p className="text-[11px] text-muted-foreground mt-2">Cancel anytime. Roadmap features automatically unlock when released.</p>
          </div>
          <div className="p-5 border rounded-lg overflow-hidden">
            <h2 className="font-semibold mb-3">Feature comparison</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="text-left py-1">Feature</th>
                  <th className="py-1">Free</th>
                  <th className="py-1">Pro / Team</th>
                </tr>
              </thead>
              <tbody>
                {featureRows.map(r => (
                  <tr key={r.label} className="border-t">
                    <td className="py-2 pr-2 align-top">
                      {r.label}{r.upcoming && <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">Upcoming</span>}
                    </td>
                    <td className="py-2 text-center">{r.free ? <CheckCircle2 className="w-4 h-4 mx-auto text-status-success"/> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="py-2 text-center">{r.pro ? <CheckCircle2 className="w-4 h-4 mx-auto text-status-success"/> : <span className="text-muted-foreground">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-xs text-muted-foreground">Team plan includes all Pro features plus advanced collaboration (coming soon).</div>
          </div>
        </div>
        <div className="text-center text-xs text-muted-foreground">Have questions? <Link href="/dashboard/subscription" className="underline">Compare plans</Link></div>
        {trialActive && trialEndsAt && (
          <div className="text-center text-xs mt-2 inline-flex items-center gap-1 justify-center text-accent">
            <Timer className="w-3 h-3" /> Trial ends {trialEndsAt.toLocaleDateString()} • {Math.ceil(((trialEndsAt as Date).getTime() - now.getTime())/86400000)} days left
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Playground</h1>
        <p className="text-sm text-secondary mt-1">Live code editor with preview and AI suggestions.</p>
      </div>
      <LiveEditor />
    </div>
  );
}
