import Link from 'next/link';
import { Button } from '@/components/ui/button';
import DashboardHeader from '@/components/dashboard/header';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      <main className="flex-1">
        <section className="relative h-[60vh] w-full overflow-hidden">
          
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
            <h1 className="font-headline text-4xl font-bold md:text-6xl">
              AI-Powered Emergency Detection
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-300">
              Real-time alerts and actionable insights to protect your community.
            </p>
            <Button asChild className="mt-8" size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 w-full">
            <svg
              className="waves"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 24 150 28"
              preserveAspectRatio="none"
              shapeRendering="auto"
            >
              <defs>
                <path
                  id="gentle-wave"
                  d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
                />
              </defs>
              <g className="parallax">
                <use
                  xlinkHref="#gentle-wave"
                  x="48"
                  y="0"
                  fill="rgba(var(--background-rgb), 0.7)"
                />
                <use
                  xlinkHref="#gentle-wave"
                  x="48"
                  y="3"
                  fill="rgba(var(--background-rgb), 0.5)"
                />
                <use
                  xlinkHref="#gentle-wave"
                  x="48"
                  y="5"
                  fill="rgba(var(--background-rgb), 0.3)"
                />
                <use xlinkHref="#gentle-wave" x="48" y="7" fill="hsl(var(--background))" />
              </g>
            </svg>
          </div>
        </section>
        <section className="bg-background py-16">
            <div className="container mx-auto text-center">
                <h2 className="font-headline text-3xl font-bold">How It Works</h2>
                <div className="mt-8 grid gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <span className="font-bold text-2xl">1</span>
                        </div>
                        <h3 className="mt-4 text-xl font-semibold">Detect</h3>
                        <p className="mt-2 text-muted-foreground">The AI continuously monitors for incidents like fires and accidents.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <span className="font-bold text-2xl">2</span>
                        </div>
                        <h3 className="mt-4 text-xl font-semibold">Alert</h3>
                        <p className="mt-2 text-muted-foreground">Instantly generates a detailed alert with severity and location.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <span className="font-bold text-2xl">3</span>
                        </div>
                        <h3 className="mt-4 text-xl font-semibold">Act</h3>
                        <p className="mt-2 text-muted-foreground">Provides recommended actions for a swift and effective response.</p>
                    </div>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}
