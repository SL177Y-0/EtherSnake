"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Trophy, Clock, ArrowLeft, AlertTriangle } from "lucide-react"
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
  const [gameOver, setGameOver] = useState(false)
  const [survivalTime, setSurvivalTime] = useState(0)
  const [submittingScore, setSubmittingScore] = useState(false)
  const [playerJoined, setPlayerJoined] = useState(false)
  const [playerNickname, setPlayerNickname] = useState<string>("")
  const [playerSubmitted, setPlayerSubmitted] = useState(false)

  useEffect(() => {
    if (!eventId) {
      router.push("/events")
      return
    }

    if (contract && address) {
      fetchEventDetails()
    }
  }, [contract, address, eventId, router])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      if (!contract || !address) {
        toast({
          title: "Error",
          description: "Contract not initialized or wallet not connected.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      
      const eventDetailsPromise = contract.getEventDetails(eventId)
      const timeRemainingPromise = contract.getTimeRemaining(eventId)
      const playerCountPromise = contract.getPlayerCount(eventId)
      
      let playerDetailsResult = null
      let fetchedPlayerJoined = false
      let fetchedPlayerNickname = ""
      let fetchedPlayerSubmitted = false

      try {
        playerDetailsResult = await contract.getPlayerDetails(eventId, address)
        if (playerDetailsResult && playerDetailsResult[0] !== "0x0000000000000000000000000000000000000000") {
          fetchedPlayerJoined = true
          fetchedPlayerNickname = playerDetailsResult[1] || "Player"
          fetchedPlayerSubmitted = playerDetailsResult[3]
        }
      } catch (error) {
        console.warn("Player details not found for this event or error fetching:", error)
      }

      setPlayerJoined(fetchedPlayerJoined)
      setPlayerNickname(fetchedPlayerNickname)
      setPlayerSubmitted(fetchedPlayerSubmitted)

      const [eventDetails, timeRemaining, playerCount] = await Promise.all([
        eventDetailsPromise,
        timeRemainingPromise,
        playerCountPromise,
      ])

      setEvent({
        id: Number(eventDetails[0]),
        startTime: Number(eventDetails[1]) * 1000,
        duration: Number(eventDetails[2]) * 1000,
        prizePool: eventDetails[3],
        creator: eventDetails[4],
        isActive: eventDetails[5],
        isPrizeClaimed: eventDetails[6],
        winner: eventDetails[7],
        highestScore: Number(eventDetails[8]),
        timeRemaining: Number(timeRemaining) * 1000,
        playerCount: Number(playerCount),
      })
    } catch (error) {
      console.error("Error fetching event details:", error)
      toast({
        title: "Error fetching event details",
        description: (error as Error)?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGameOver = (finalSurvivalTime: number) => {
    setGameOver(true)
    setSurvivalTime(finalSurvivalTime)
  }

  const submitScore = async () => {
    if (!playerJoined) {
      toast({
        title: "Cannot Submit Score",
        description: "You haven't joined this event.",
        variant: "destructive",
      })
      return
    }

    if (playerSubmitted) {
      toast({
        title: "Score Already Submitted",
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

  if (!address) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-muted-foreground mb-6">Please connect your wallet to play and view event details.</p>
        <Button onClick={connectWallet} disabled={isConnecting || !contract}>
          {isConnecting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connecting...</>
          ) : !contract ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading Contract...</>
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading event details...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-destructive">Event Not Found</h1>
        <p className="text-muted-foreground mb-6 text-center">
          The event you are looking for (ID: {eventId}) could not be loaded. It might not exist or there was an issue fetching its details.
        </p>
        <Button onClick={() => router.push('/events')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>
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
    <div className="container py-6 md:py-10">
      <Button onClick={() => router.push('/events')} variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
      </Button>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        <div className="md:col-span-2">
          {playerJoined ? (
            <GameComponent 
              onGameOver={handleGameOver} 
              playerName={playerNickname || "Player"}
            />
          ) : (
            <Card className="h-[400px] flex flex-col items-center justify-center bg-muted/30">
              <CardHeader>
                <CardTitle className="text-center text-xl md:text-2xl">Join Event to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  You need to join this event to play the game and submit your score.
                </p>
                <Button onClick={() => router.push(`/events?eventId=${eventId}`)} variant="default" size="lg">
                  Go to Event Page to Join
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-1 flex flex-col space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Info (ID: {event.id})</CardTitle>
              <CardDescription>
                Prize Pool: {formatEther(event.prizePool || "0")} ETH
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Status: {event.isActive ? "Active" : "Ended"}</p>
              <p>Players: {event.playerCount}</p>
              <p>Your Nickname: {playerJoined ? playerNickname : "N/A (Not Joined)"}</p>
              <p>Your Status: {playerJoined ? (playerSubmitted ? "Score Submitted" : "Joined") : "Not Joined"}</p>
              {event.isActive && event.timeRemaining > 0 && (
                <p className="text-sm text-green-500">
                  Time Remaining: {formatTime(Math.floor(event.timeRemaining / 1000))}
                </p>
              )}
              {!event.isActive && event.winner !== "0x0000000000000000000000000000000000000000" && (
                <p>Winner: {event.winner.slice(0,6)}...{event.winner.slice(-4)}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                🎮 <strong>Controls:</strong> Use your mouse to control your snake.
              </p>
              <p>
                🍎 <strong>Objective:</strong> Collect food (red/orange dots) to grow longer.
              </p>
              <p>
                🧱 <strong>Avoid:</strong> Hitting walls or other snakes (including AI bots).
              </p>
              <p>
                ⏱️ <strong>Goal:</strong> Survive as long as possible. Your survival time is your score.
              </p>
              <p>
                🏆 <strong>Win:</strong> The player with the longest survival time for the current event wins the prize pool.
              </p>
            </CardContent>
          </Card>

          {gameOver && playerJoined && !playerSubmitted && (
            <Card>
              <CardHeader>
                <CardTitle>Game Over!</CardTitle>
                <CardDescription>Your snake survived for {formatTime(survivalTime)}.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Submit your score to the leaderboard. You can only submit once per event.
                </p>
                <Button 
                  onClick={submitScore} 
                  disabled={submittingScore || !playerJoined || playerSubmitted} 
                  className="w-full"
                >
                  {submittingScore ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                  ) : (
                    <><Trophy className="mr-2 h-4 w-4" /> Submit Score</>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
