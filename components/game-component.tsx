"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

interface GameComponentProps {
  onGameOver: () => void
}

// Snake segment with smooth movement
interface SnakeSegment {
  x: number
  y: number
  targetX: number
  targetY: number
  angle: number
}

// AI Bot
interface Bot {
  segments: SnakeSegment[]
  direction: number
  speed: number
  turnSpeed: number
  targetDirection: number
  color: string
  name: string
  thinkTime: number
  lastThink: number
}

export default function GameComponent({ onGameOver }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestRef = useRef<number | undefined>(undefined)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const hasMouseMoved = useRef<boolean>(false)
  const defaultDirection = useRef<{ x: number, y: number }>({ x: 1, y: 0 })

  // Game state
  const gameStateRef = useRef({
    // Player snake
    snake: [] as SnakeSegment[],
    // Food items
    foods: [] as { x: number; y: number; value: number; color: string }[],
    // AI bots
    bots: [] as Bot[],
    // Game area
    worldSize: 2000,
    viewportWidth: 800,
    viewportHeight: 600,
    camera: { x: 0, y: 0 },
    // Game settings
    lastTime: 0,
    startTime: 0,
    elapsedTime: 0,
    // Player settings
    playerSpeed: 3,
    playerColor: `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`,
    playerName: "Player",
    // Background grid
    gridSize: 50,
    // Bot names
    botNames: [
      "Slithery",
      "Wiggles",
      "Fangs",
      "Hissy",
      "Scales",
      "Venom",
      "Coily",
      "Noodle",
      "Zigzag",
      "Crusher",
      "Twisty",
      "Speedy",
      "Sneaky",
      "Slinky",
      "Striker",
    ],
  })

  const startGame = () => {
    if (gameOver) {
      resetGame()
    }

    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    gameStateRef.current.startTime = Date.now()
    
    // Set initial mouse position to center of viewport when game starts
    const state = gameStateRef.current
    setMousePosition({
      x: state.viewportWidth / 2,
      y: state.viewportHeight / 2
    })
    
    // Set initial default direction (right)
    defaultDirection.current = { x: 1, y: 0 }
    
    // Start with the snake moving
    if (state.snake.length > 0) {
      const head = state.snake[0]
      head.angle = 0 // 0 radians = moving right
    }
  }

  const resetGame = () => {
    const state = gameStateRef.current

    // Reset player snake
    const playerColor = `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`
    state.playerColor = playerColor

    // Create initial snake
    state.snake = []
    const centerX = state.worldSize / 2
    const centerY = state.worldSize / 2

    // Create head
    state.snake.push({
      x: centerX,
      y: centerY,
      targetX: centerX,
      targetY: centerY,
      angle: 0,
    })

    // Create initial body segments
    for (let i = 1; i < 10; i++) {
      state.snake.push({
        x: centerX - i * 5,
        y: centerY,
        targetX: centerX - i * 5,
        targetY: centerY,
        angle: 0,
      })
    }

    // Reset camera
    state.camera = { x: centerX - state.viewportWidth / 2, y: centerY - state.viewportHeight / 2 }

    // Generate food
    generateFood(50)

    // Generate bots
    generateBots(10)
    
    hasMouseMoved.current = false
  }

  const endGame = () => {
    setGameOver(true)
    onGameOver()
  }

  const generateFood = (count: number) => {
    const state = gameStateRef.current
    state.foods = []

    for (let i = 0; i < count; i++) {
      const value = Math.random() < 0.2 ? 5 : 1 // 20% chance for bigger food
      const color = value === 5 ? "#ff5500" : "#ff0000"

      state.foods.push({
        x: Math.random() * state.worldSize,
        y: Math.random() * state.worldSize,
        value,
        color,
      })
    }
  }

  const generateBots = (count: number) => {
    const state = gameStateRef.current
    state.bots = []

    for (let i = 0; i < count; i++) {
      const botX = Math.random() * state.worldSize
      const botY = Math.random() * state.worldSize
      const botColor = `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`
      const botName = state.botNames[Math.floor(Math.random() * state.botNames.length)]
      const botSpeed = 2 + Math.random() * 1.5 // Speed between 2 and 3.5

      const bot: Bot = {
        segments: [],
        direction: Math.random() * Math.PI * 2,
        speed: botSpeed,
        turnSpeed: 0.05 + Math.random() * 0.05,
        targetDirection: Math.random() * Math.PI * 2,
        color: botColor,
        name: botName,
        thinkTime: 500 + Math.random() * 1000, // Think every 0.5-1.5 seconds
        lastThink: 0,
      }

      // Create bot segments
      const segmentCount = 5 + Math.floor(Math.random() * 10) // 5-15 segments

      for (let j = 0; j < segmentCount; j++) {
        bot.segments.push({
          x: botX - j * 5 * Math.cos(bot.direction),
          y: botY - j * 5 * Math.sin(bot.direction),
          targetX: botX - j * 5 * Math.cos(bot.direction),
          targetY: botY - j * 5 * Math.sin(bot.direction),
          angle: bot.direction,
        })
      }

      state.bots.push(bot)
    }
  }

  const updateBots = (timestamp: number) => {
    const state = gameStateRef.current

    state.bots.forEach((bot) => {
      // Bot AI thinking
      if (timestamp - bot.lastThink > bot.thinkTime) {
        bot.lastThink = timestamp

        // Find closest food
        let closestFood = null
        let closestDist = Number.POSITIVE_INFINITY

        for (const food of state.foods) {
          const dx = food.x - bot.segments[0].x
          const dy = food.y - bot.segments[0].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < closestDist) {
            closestDist = dist
            closestFood = food
          }
        }

        // Set target direction toward food
        if (closestFood) {
          const dx = closestFood.x - bot.segments[0].x
          const dy = closestFood.y - bot.segments[0].y
          bot.targetDirection = Math.atan2(dy, dx)
        } else {
          // Random direction if no food found
          bot.targetDirection = bot.direction + ((Math.random() * 2 - 1) * Math.PI) / 2
        }

        // Avoid walls
        const head = bot.segments[0]
        const margin = 100

        if (head.x < margin) {
          bot.targetDirection = 0 // Go right
        } else if (head.x > state.worldSize - margin) {
          bot.targetDirection = Math.PI // Go left
        } else if (head.y < margin) {
          bot.targetDirection = Math.PI / 2 // Go down
        } else if (head.y > state.worldSize - margin) {
          bot.targetDirection = (Math.PI * 3) / 2 // Go up
        }
      }

      // Gradually turn toward target direction
      const angleDiff = ((bot.targetDirection - bot.direction + Math.PI * 3) % (Math.PI * 2)) - Math.PI
      if (Math.abs(angleDiff) > 0.01) {
        bot.direction += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), bot.turnSpeed)
      }

      // Move bot head
      const head = bot.segments[0]
      head.targetX += Math.cos(bot.direction) * bot.speed
      head.targetY += Math.sin(bot.direction) * bot.speed

      // Smooth movement
      head.x += (head.targetX - head.x) * 0.2
      head.y += (head.targetY - head.y) * 0.2
      head.angle = bot.direction

      // Move bot body
      for (let i = 1; i < bot.segments.length; i++) {
        const segment = bot.segments[i]
        const prevSegment = bot.segments[i - 1]

        // Follow previous segment with delay
        const dx = prevSegment.x - segment.x
        const dy = prevSegment.y - segment.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const targetDistance = 5

        if (distance > targetDistance) {
          const angle = Math.atan2(dy, dx)
          segment.targetX = prevSegment.x - Math.cos(angle) * targetDistance
          segment.targetY = prevSegment.y - Math.sin(angle) * targetDistance
          segment.angle = angle
        }

        // Smooth movement
        segment.x += (segment.targetX - segment.x) * 0.2
        segment.y += (segment.targetY - segment.y) * 0.2
      }

      // Check for food collision
      for (let i = 0; i < state.foods.length; i++) {
        const food = state.foods[i]
        const dx = food.x - head.x
        const dy = food.y - head.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 10) {
          // Eat food
          state.foods.splice(i, i + 1)

          // Grow bot
          const lastSegment = bot.segments[bot.segments.length - 1]
          for (let j = 0; j < food.value; j++) {
            bot.segments.push({
              x: lastSegment.x,
              y: lastSegment.y,
              targetX: lastSegment.x,
              targetY: lastSegment.y,
              angle: lastSegment.angle,
            })
          }

          // Add new food
          const value = Math.random() < 0.2 ? 5 : 1
          const color = value === 5 ? "#ff5500" : "#ff0000"

          state.foods.push({
            x: Math.random() * state.worldSize,
            y: Math.random() * state.worldSize,
            value,
            color,
          })

          break
        }
      }
    })
  }

  const moveSnake = (mouseX: number, mouseY: number) => {
    const state = gameStateRef.current
    const { snake, viewportWidth, viewportHeight, camera } = state

    if (snake.length === 0) return

    // Use mouse controls
    const head = snake[0]
    
    // Calculate direction vector
    let dx, dy, angle;
    
    if (hasMouseMoved.current) {
      // If mouse has moved, use its position
      const worldMouseX = mouseX + camera.x
      const worldMouseY = mouseY + camera.y
      
      dx = worldMouseX - head.x
      dy = worldMouseY - head.y
      angle = Math.atan2(dy, dx)
    } else {
      // If mouse hasn't moved yet, move in the default direction (right)
      angle = Math.atan2(defaultDirection.current.y, defaultDirection.current.x)
    }
    
    // Always move the snake
    head.targetX += Math.cos(angle) * state.playerSpeed
    head.targetY += Math.sin(angle) * state.playerSpeed
    
    // Update the angle for rendering
    head.angle = angle

    // Smooth movement
    head.x += (head.targetX - head.x) * 0.2
    head.y += (head.targetY - head.y) * 0.2

      // Move body segments
    for (let i = 1; i < snake.length; i++) {
      const segment = snake[i]
      const prevSegment = snake[i - 1]

      const dxBody = prevSegment.x - segment.x
      const dyBody = prevSegment.y - segment.y
      const distanceBody = Math.sqrt(dxBody * dxBody + dyBody * dyBody)
      const targetDistance = 5

      if (distanceBody > targetDistance) {
        const angleBody = Math.atan2(dyBody, dxBody)
        segment.targetX = prevSegment.x - Math.cos(angleBody) * targetDistance
        segment.targetY = prevSegment.y - Math.sin(angleBody) * targetDistance
        segment.angle = angleBody
      }

      segment.x += (segment.targetX - segment.x) * 0.2
      segment.y += (segment.targetY - segment.y) * 0.2
    }

    // Update camera to follow player
    camera.x = head.x - viewportWidth / 2
    camera.y = head.y - viewportHeight / 2

    // Keep camera within world bounds
    camera.x = Math.max(0, Math.min(camera.x, state.worldSize - viewportWidth))
    camera.y = Math.max(0, Math.min(camera.y, state.worldSize - viewportHeight))

    // Check for world boundaries
    if (head.x < 0 || head.x > state.worldSize || head.y < 0 || head.y > state.worldSize) {
      endGame()
      return
    }

    // Check for food collision
    for (let i = 0; i < state.foods.length; i++) {
      const food = state.foods[i]
      const dxFood = food.x - head.x
      const dyFood = food.y - head.y
      const distanceFood = Math.sqrt(dxFood * dxFood + dyFood * dyFood)

      if (distanceFood < 10) {
        state.foods.splice(i, 1)

        const lastSegment = snake[snake.length - 1]
        for (let j = 0; j < food.value; j++) {
          snake.push({
            x: lastSegment.x,
            y: lastSegment.y,
            targetX: lastSegment.x,
            targetY: lastSegment.y,
            angle: lastSegment.angle,
          })
        }

        setScore((prevScore) => prevScore + food.value)

        const value = Math.random() < 0.2 ? 5 : 1
        const color = value === 5 ? "#ff5500" : "#ff0000"
        state.foods.push({
          x: Math.random() * state.worldSize,
          y: Math.random() * state.worldSize,
          value,
          color,
        })
          break
      }
    }

    // Check for collision with bots
    for (const bot of state.bots) {
      for (const segment of bot.segments) {
        const dxBot = segment.x - head.x
        const dyBot = segment.y - head.y
        const distanceBot = Math.sqrt(dxBot * dxBot + dyBot * dyBot)

        if (distanceBot < 8) {
          endGame()
          return
        }
      }
    }
  }

  const drawGame = (ctx: CanvasRenderingContext2D, timestamp: number) => {
    if (!gameStarted || gameOver) return

    const state = gameStateRef.current
    const { snake, foods, bots, camera, viewportWidth, viewportHeight, worldSize, gridSize } = state

    ctx.clearRect(0, 0, viewportWidth, viewportHeight)
    ctx.fillStyle = "#0a0a2a"
    ctx.fillRect(0, 0, viewportWidth, viewportHeight)

    ctx.strokeStyle = "#1a1a4a"
    ctx.lineWidth = 1
    const offsetX = -camera.x % gridSize
    const offsetY = -camera.y % gridSize
    for (let x = offsetX; x < viewportWidth; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, viewportHeight)
      ctx.stroke()
    }
    for (let y = offsetY; y < viewportHeight; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(viewportWidth, y)
      ctx.stroke()
    }

    ctx.strokeStyle = "#ff0000"
    ctx.lineWidth = 5
    ctx.strokeRect(-camera.x, -camera.y, worldSize, worldSize)

    for (const food of foods) {
      const screenX = food.x - camera.x
      const screenY = food.y - camera.y
      if (screenX >= -20 && screenX <= viewportWidth + 20 && screenY >= -20 && screenY <= viewportHeight + 20) {
        const size = food.value === 5 ? 10 : 6
        ctx.fillStyle = food.color
        ctx.beginPath()
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (const bot of bots) {
      for (let i = bot.segments.length - 1; i >= 0; i--) {
        const segment = bot.segments[i]
        const screenX = segment.x - camera.x
        const screenY = segment.y - camera.y
        if (screenX >= -20 && screenX <= viewportWidth + 20 && screenY >= -20 && screenY <= viewportHeight + 20) {
          const size = i === 0 ? 10 : 8 - i * 0.05
          ctx.fillStyle = bot.color
          ctx.beginPath()
          ctx.arc(screenX, screenY, Math.max(size, 4), 0, Math.PI * 2)
          ctx.fill()
          if (i === 0) {
            const angle = segment.angle
            ctx.fillStyle = "#ffffff"
            const leftEyeX = screenX + Math.cos(angle - 0.3) * 6
            const leftEyeY = screenY + Math.sin(angle - 0.3) * 6
            const rightEyeX = screenX + Math.cos(angle + 0.3) * 6
            const rightEyeY = screenY + Math.sin(angle + 0.3) * 6
            ctx.beginPath()
            ctx.arc(leftEyeX, leftEyeY, 3, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(rightEyeX, rightEyeY, 3, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = "#000000"
            ctx.beginPath()
            ctx.arc(leftEyeX + Math.cos(angle) * 1, leftEyeY + Math.sin(angle) * 1, 1.5, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(rightEyeX + Math.cos(angle) * 1, rightEyeY + Math.sin(angle) * 1, 1.5, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = "#ffffff"
            ctx.font = "12px Arial"
            ctx.textAlign = "center"
            ctx.fillText(bot.name, screenX, screenY - 15)
          }
        }
      }
    }

    if (snake.length > 0) {
      for (let i = snake.length - 1; i >= 0; i--) {
        const segment = snake[i]
        const screenX = segment.x - camera.x
        const screenY = segment.y - camera.y
        const size = i === 0 ? 10 : 8 - i * 0.02
        ctx.fillStyle = state.playerColor
        ctx.beginPath()
        ctx.arc(screenX, screenY, Math.max(size, 4), 0, Math.PI * 2)
        ctx.fill()
        if (i === 0) {
          const angle = segment.angle
          ctx.fillStyle = "#ffffff"
          const leftEyeX = screenX + Math.cos(angle - 0.3) * 6
          const leftEyeY = screenY + Math.sin(angle - 0.3) * 6
          const rightEyeX = screenX + Math.cos(angle + 0.3) * 6
          const rightEyeY = screenY + Math.sin(angle + 0.3) * 6
          ctx.beginPath()
          ctx.arc(leftEyeX, leftEyeY, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(rightEyeX, rightEyeY, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = "#000000"
          ctx.beginPath()
          ctx.arc(leftEyeX + Math.cos(angle) * 1, leftEyeY + Math.sin(angle) * 1, 1.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(rightEyeX + Math.cos(angle) * 1, rightEyeY + Math.sin(angle) * 1, 1.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = "#ffffff"
          ctx.font = "12px Arial"
          ctx.textAlign = "center"
          ctx.fillText(state.playerName, screenX, screenY - 15)
        }
      }
    }

    ctx.fillStyle = "#ffffff"
    ctx.font = "20px Arial"
    ctx.textAlign = "left"
    ctx.fillText(`Length: ${snake.length}`, 10, 30)
    state.elapsedTime = Math.floor((Date.now() - state.startTime) / 1000)
    ctx.fillText(`Time: ${state.elapsedTime}s`, 10, 60)

    const minimapSize = 150
    const minimapX = viewportWidth - minimapSize - 10
    const minimapY = 10
    const minimapScale = minimapSize / worldSize
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize)
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 1
    ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize)
    const viewportRectX = minimapX + camera.x * minimapScale
    const viewportRectY = minimapY + camera.y * minimapScale
    const viewportRectWidth = viewportWidth * minimapScale
    const viewportRectHeight = viewportHeight * minimapScale
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 1
    ctx.strokeRect(viewportRectX, viewportRectY, viewportRectWidth, viewportRectHeight)
    if (snake.length > 0) {
      const head = snake[0]
      const playerX = minimapX + head.x * minimapScale
      const playerY = minimapY + head.y * minimapScale
      ctx.fillStyle = "#00ff00"
      ctx.beginPath()
      ctx.arc(playerX, playerY, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    for (const bot of bots) {
      if (bot.segments.length > 0) {
        const head = bot.segments[0]
        const botX = minimapX + head.x * minimapScale
        const botY = minimapY + head.y * minimapScale
        ctx.fillStyle = bot.color
        ctx.beginPath()
        ctx.arc(botX, botY, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  const gameLoop = (timestamp: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (gameStarted && !gameOver) {
      // Always move the snake, using mouse position if available
      moveSnake(mousePosition.x, mousePosition.y)
      updateBots(timestamp)
    }

    drawGame(ctx, timestamp)
    requestRef.current = requestAnimationFrame(gameLoop)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameStarted || gameOver) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    hasMouseMoved.current = true
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const state = gameStateRef.current
    canvas.width = state.viewportWidth
    canvas.height = state.viewportHeight

    resetGame()

    if (gameStarted && !gameOver) {
      requestRef.current = requestAnimationFrame(gameLoop)
    }

    // On first mount, set mouse position to center
    setMousePosition({
      x: state.viewportWidth / 2,
      y: state.viewportHeight / 2
    })

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [gameStarted, gameOver])

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {!gameStarted ? (
        <div className="flex flex-col items-center justify-center h-[400px] w-full">
          <h2 className="text-2xl font-bold mb-4">Ready to Play?</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Move your mouse to control your snake. Your snake will start moving automatically.
            Collect food to grow and avoid hitting other snakes.
          </p>
          <Button onClick={startGame}>Start Game</Button>
        </div>
      ) : (
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border border-gray-700 bg-black"
            onMouseMove={handleMouseMove}
          />
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <h2 className="text-2xl font-bold text-white mb-2">Game Over!</h2>
              <p className="text-white mb-4">Your length: {gameStateRef.current.snake.length}</p>
              <p className="text-white mb-4">Survival time: {gameStateRef.current.elapsedTime}s</p>
              <Button onClick={startGame}>Play Again</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
