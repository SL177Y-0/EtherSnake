import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Trophy, Wallet, GamepadIcon as GameController } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl">
            <GameController className="h-6 w-6" />
            <span>SlitherBet</span>
          </div>
          <nav className="flex gap-4">
            <Link href="/events">
              <Button variant="ghost">Events</Button>
            </Link>
          
            <Link href="/admin">
              <Button variant="ghost">Admin</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Play, Bet, Win on the Blockchain
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Join events, play a Slither.io-like game, and compete for ETH prizes. The longest survival time wins
                    the pot!
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/events">
                    <Button className="gap-1.5">
                      Join an Event
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>

                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden border bg-background">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <GameController className="h-24 w-24 text-muted-foreground/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A simple process to join events, play, and win ETH prizes
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3 md:gap-12">
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-muted/50">
                <Wallet className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Join an Event</h3>
                <p className="text-center text-muted-foreground">
                  Pay 0.001 ETH to join an event and enter the competition
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-muted/50">
                <GameController className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Play the Game</h3>
                <p className="text-center text-muted-foreground">
                  Control your snake, collect food, and survive as long as possible
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-muted/50">
                <Trophy className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Win Prizes</h3>
                <p className="text-center text-muted-foreground">
                  The player with the longest survival time wins the entire prize pool
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} SlitherBet. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/events" className="text-sm text-muted-foreground hover:underline">
              Events
            </Link>
        
            <Link href="/admin" className="text-sm text-muted-foreground hover:underline">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
