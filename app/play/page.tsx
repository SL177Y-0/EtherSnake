"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Trophy, Clock, ArrowLeft } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { formatEther } from "ethers"
import dynamic from "next/dynamic"

// Dynamically import the game component with no SSR
const GameComponent = dynamic(() => import("@/components/game-component"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[400px] bg-black/10 rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
})

export default function PlayPage() {
  const { toast } = useToast()
  const { contract, address, connectWallet, isConnecting } = useWeb3()
  const searchParams = useSearchParams()
  const router = useRouter()
  const eventId = searchParams.get("eventId")
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [survivalTime, setSurvivalTime] = useState(0)
  const [submittingScore, setSubmittingScore] = useState(false)
  const [playerJoined, setPlayerJoined] = useState(false)
  const [playerSubmitted, setPlayerSubmitted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!eventId) {
      router.push("/events")
      return
    }

    if (contract && address) {
      fetchEventDetails()
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [contract, address, eventId])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      if (!contract) {
        toast({
          title: "Error",
          description: "Contract not initialized. Please try reconnecting your wallet.",
          variant: "destructive",
        })
        return
      }
      
      const eventDetails = await contract.getEventDetails(eventId)
      const timeRemaining = await contract.getTimeRemaining(eventId)
      const playerCount = await contract.getPlayerCount(eventId)

      // Check if player has joined this event
      try {
        const playerDetails = await contract.getPlayerDetails(eventId, address)
        setPlayerJoined(playerDetails[0] !== "0x0000000000000000000000000000000000000000")
        setPlayerSubmitted(playerDetails[3]) // hasSubmittedScore
      } catch (error) {
        setPlayerJoined(false)
        setPlayerSubmitted(false)
      }

      setEvent({
        id: Number(eventDetails[0]),
        startTime: Number(eventDetails[1]) * 1000, // Convert to milliseconds
        duration: Number(eventDetails[2]) * 1000, // Convert to milliseconds
        prizePool: eventDetails[3],
        creator: eventDetails[4],
        isActive: eventDetails[5],
        isPrizeClaimed: eventDetails[6],
        winner: eventDetails[7],
        highestScore: Number(eventDetails[8]),
        timeRemaining: Number(timeRemaining) * 1000, // Convert to milliseconds
        playerCount: Number(playerCount),
      })
    } catch (error) {
      console.error("Error fetching event details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch event details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGameOver = () => {
    setGameOver(true)
    // We'll get the survival time from the game component
  }

  const submitScore = async () => {
    if (!playerJoined) {
      toast({
        title: "Error",
        description: "You haven't joined this event. Please join first.",
        variant: "destructive",
      })
      return
    }

    if (playerSubmitted) {
      toast({
        title: "Error",
        description: "You have already submitted a score for this event.",
        variant: "destructive",
      })
      return
    }

    if (!contract) {
      toast({
        title: "Error",
        description: "Contract not initialized. Please try reconnecting your wallet.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmittingScore(true)
      const tx = await contract.submitScore(eventId, survivalTime)

      toast({
        title: "Transaction Sent",
        description: "Your score is being submitted...",
      })

      await tx.wait()

      toast({
        title: "Success",
        description: "Your score has been submitted!",
      })

      setPlayerSubmitted(true)
      await fetchEventDetails()
    } catch (error) {
      console.error("Error submitting score:", error)
      toast({
        title: "Error",
        description: "Failed to submit score. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingScore(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  if (!contract || !address) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-muted-foreground mb-6">Connect your wallet to play the game</p>
        <Button onClick={connectWallet} disabled={isConnecting}>
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist</p>
        <Link href="/events">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>
    )
  }

  if (!event.isActive) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <h1 className="text-2xl font-bold mb-4">Event Closed</h1>
        <p className="text-muted-foreground mb-6">This event has ended</p>
        {event.winner !== "0x0000000000000000000000000000000000000000" && (
          <Card className="mb-6 w-full max-w-md">
            <CardHeader>
              <CardTitle>Winner</CardTitle>
              <CardDescription>The player with the highest score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {event.winner.slice(0, 6)}...{event.winner.slice(-4)}
                  </p>
                  <p className="text-sm text-muted-foreground">Score: {event.highestScore} seconds</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm">Prize: {formatEther(event.prizePool)} ETH</p>
            </CardFooter>
          </Card>
        )}
        <Link href="/events">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>
    )
  }

  if (event.timeRemaining <= 0) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <h1 className="text-2xl font-bold mb-4">Event Ended</h1>
        <p className="text-muted-foreground mb-6">This event has ended but hasn't been closed yet</p>
        <Link href="/events">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Link href="/events">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Event #{event.id}</h1>
        </div>
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          <span>Time Remaining: {formatTime(Math.floor(event.timeRemaining / 1000))}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="rounded-lg overflow-hidden">
            <GameComponent onGameOver={handleGameOver} />
          </div>

          {gameOver && (
            <Card>
              <CardHeader>
                <CardTitle>Game Over</CardTitle>
                <CardDescription>Your snake survived for {formatTime(survivalTime)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Would you like to submit this score or try again?</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setGameOver(false)}>
                  Play Again
                </Button>
                <Button onClick={submitScore} disabled={submittingScore || playerSubmitted || !playerJoined}>
                  {submittingScore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : playerSubmitted ? (
                    "Score Submitted"
                  ) : !playerJoined ? (
                    "Join Event First"
                  ) : (
                    "Submit Score"
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Prize Pool:</span>
                <span className="font-bold">{formatEther(event.prizePool)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span>Players:</span>
                <span>{event.playerCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Top Score:</span>
                <span>{event.highestScore} seconds</span>
              </div>
              <div className="flex justify-between">
                <span>Your Status:</span>
                <span>
                  {playerJoined ? (
                    playerSubmitted ? (
                      <span className="text-green-500">Score Submitted</span>
                    ) : (
                      <span className="text-yellow-500">Joined, No Score</span>
                    )
                  ) : (
                    <span className="text-red-500">Not Joined</span>
                  )}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              {!playerJoined && (
                <Link href={`/events?eventId=${event.id}`} className="w-full">
                  <Button className="w-full">Join This Event</Button>
                </Link>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                🎮 <strong>Controls:</strong> Use your mouse to control your snake
              </p>
              <p>
                🍎 <strong>Objective:</strong> Collect food to grow longer
              </p>
              <p>
                ⚠️ <strong>Avoid:</strong> Hitting walls or other snakes
              </p>
              <p>
                ⏱️ <strong>Goal:</strong> Survive as long as possible
              </p>
              <p>
                🏆 <strong>Win:</strong> The player with the longest survival time wins the prize pool
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
