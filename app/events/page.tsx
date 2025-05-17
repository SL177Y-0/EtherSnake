"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Trophy, Users, Clock } from "lucide-react"
import Link from "next/link"
import { useWeb3 } from "@/hooks/use-web3"
import { formatEther, ethers } from "ethers"
import { useToast } from "@/hooks/use-toast"

export default function EventsPage() {
  const { toast } = useToast()
  const { contract, address, connectWallet, isConnecting } = useWeb3()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nickname, setNickname] = useState("")
  const [joiningEventId, setJoiningEventId] = useState<number | null>(null)

  useEffect(() => {
    if (contract) {
      fetchEvents()
    }
  }, [contract])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const eventCount = await contract.eventCount()
      const fetchedEvents = []

      for (let i = 1; i <= eventCount; i++) {
        const eventDetails = await contract.getEventDetails(i)
        const timeRemaining = await contract.getTimeRemaining(i)
        const playerCount = await contract.getPlayerCount(i)

        fetchedEvents.push({
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
      }

      setEvents(fetchedEvents)
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const joinEvent = async (eventId: number) => {
    if (!address) {
      await connectWallet()
      return
    }

    if (!nickname) {
      toast({
        title: "Error",
        description: "Please enter a nickname",
        variant: "destructive",
      })
      return
    }

    try {
      setJoiningEventId(eventId)
      const tx = await contract.joinEvent(eventId, nickname, {
        value: ethers.parseEther("0.001"),
      })

      toast({
        title: "Transaction Sent",
        description: "Your transaction is being processed...",
      })

      await tx.wait()

      toast({
        title: "Success",
        description: "You have successfully joined the event!",
      })

      await fetchEvents()
    } catch (error) {
      console.error("Error joining event:", error)
      toast({
        title: "Error",
        description: "Failed to join event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setJoiningEventId(null)
    }
  }

  const formatTimeRemaining = (timeRemaining: number) => {
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

    return `${hours}h ${minutes}m ${seconds}s`
  }

  if (!contract) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-muted-foreground mb-6">Connect your wallet to view and join events</p>
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

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Available Events</h1>
        <Button onClick={fetchEvents} variant="outline" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">No events available</p>
          <Link href="/admin">
            <Button>Create an Event</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className={!event.isActive ? "opacity-70" : ""}>
              <CardHeader>
                <CardTitle>Event #{event.id}</CardTitle>
                <CardDescription>
                  {event.isActive ? (
                    event.timeRemaining > 0 ? (
                      <span className="flex items-center text-green-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTimeRemaining(event.timeRemaining)} remaining
                      </span>
                    ) : (
                      <span className="text-yellow-500">Waiting to be closed</span>
                    )
                  ) : (
                    <span className="text-muted-foreground">Event ended</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    <span>Prize Pool:</span>
                  </div>
                  <span className="font-bold">{formatEther(event.prizePool)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span>Players:</span>
                  </div>
                  <span>{event.playerCount}</span>
                </div>
                {!event.isActive && event.winner !== "0x0000000000000000000000000000000000000000" && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">
                      Winner: {event.winner.slice(0, 6)}...{event.winner.slice(-4)}
                    </p>
                    <p className="text-sm">Score: {event.highestScore} seconds</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                {event.isActive && event.timeRemaining > 0 ? (
                  <>
                    <div className="w-full">
                      <Label htmlFor={`nickname-${event.id}`}>Your Nickname</Label>
                      <Input
                        id={`nickname-${event.id}`}
                        placeholder="Enter your nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => joinEvent(event.id)}
                      disabled={joiningEventId === event.id}
                    >
                      {joiningEventId === event.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        "Join Event (0.001 ETH)"
                      )}
                    </Button>
                  </>
                ) : event.isActive && event.timeRemaining === 0 ? (
                  <Button className="w-full" variant="secondary" disabled>
                    Event Ended (Waiting to close)
                  </Button>
                ) : (
                  <Button className="w-full" variant="secondary" disabled>
                    Event Closed
                  </Button>
                )}
                {event.isActive && (
                  <Link href={`/play?eventId=${event.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Play Game
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
