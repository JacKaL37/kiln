'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { HelpCircle, Download, Upload, Trash2, RefreshCw, Image, Maximize2 } from 'lucide-react'

type Painter = {
  pos: { x: number; y: number }
  heading: number
  radius: number
  color: string
  alpha: string
}

type KilnState = {
  input: string
  output: string
  canvas: HTMLCanvasElement | null
  ctx: CanvasRenderingContext2D | null
  painter: Painter
  namespace: Record<string, string[]>
  history: string[]
  historyIndex: number
  hintCount: number
  hint: string
  displayHelp: boolean
  wallCollision: boolean
  drawDelay: boolean
  resCounter: number
  clearLog: boolean
}

const initialState: KilnState = {
  input: '',
  output: '',
  canvas: null,
  ctx: null,
  painter: {
    pos: { x: 512, y: 512 },
    heading: Math.PI,
    radius: 21,
    color: 'FFFFFF',
    alpha: 'FF'
  },
  namespace: {},
  history: [],
  historyIndex: -1,
  hintCount: -1,
  hint: '',
  displayHelp: false,
  wallCollision: true,
  drawDelay: false,
  resCounter: 0,
  clearLog: false
}

const examples = [
  {
    "dot": ["move", "paint"],
    "cerisedot": ["cerise", "dot"],
    "pinkdot": ["pink", "dot"],
    "indigodot": ["indigo", "dot"],
    "aquadot": ["aqua", "dot"],
    "limedot": ["lime", "dot"],
    "lemondot": ["lemon", "dot"],
    "emberdot": ["ember", "dot"],
    "confettidots": ["cerisedot", "emberdot", "lemondot", "limedot", "aquadot", "indigodot", "pinkdot"],
    "confetti": ["500confettidots"]
  },
  {
    "dot": ["move", "paint"],
    "wd": ["white", "dot"],
    "lgd": ["ltgray", "dot"],
    "mgd": ["mdgray", "dot"],
    "dgd": ["dkgray", "dot"],
    "bd": ["black", "dot"],
    "shadedots": ["wd", "lgd", "mgd", "dgd", "bd"],
    "shaderandom": ["size", "2shrink", "shadedots"],
    "shades": ["200shaderandom"]
  },
  {
    "dot": ["move", "paint"],
    "dota": ["pink", "dot"],
    "dotb": ["indigo", "dot"],
    "dotc": ["aqua", "dot"],
    "dots": ["dota", "dotb", "dotc"],
    "vapordots": ["4fade", "dots", "4glow"],
    "vapor": ["100vapordots"],
    "vaporshrink": ["vapor", "shrink"],
    "vaporwave": ["3expand", "6vaporshrink", "3expand"]
  },
  {
    "dot": ["move", "paint"],
    "randodot": ["color", "dot"],
    "randomany": ["200randodot"],
    "randoshrink": ["randomany", "shrink"],
    "randoscape": ["10expand", "10randoshrink"]
  },
  {
    "dot": ["color", "paint", "color", "draw"],
    "seg": ["mfwd", "dot"],
    "line": ["5seg"],
    "tline": ["turn", "line"],
    "scribble": ["100tline"],
    "farscribbles": ["4shrink", "20scribble"],
    "mfarscribbles": ["expand", "8scribble"],
    "mnearscribbles": ["expand", "2scribble"],
    "nearscribbles": ["expand", "scribble"],
    "scribbledegook": ["3fade", "farscribbles", "glow", "mfarscribbles", "glow", "mnearscribbles", "glow", "nearscribbles", "expand"],
    "koogedelbbircs": ["farscribbles", "fade", "mfarscribbles", "fade", "mnearscribbles", "fade", "nearscribbles"]
  }
]

const resolutions = [
  [1920, 1080, "1080p"],
  [1024, 1024, "1:1, 1024"],
  [1125, 2436, "iPhone X"],
  [7680, 4320, "8K"]
]

const primitives: Record<string, (state: KilnState) => KilnState> = {
  paint: (state) => {
    const { ctx, painter } = state
    if (ctx) {
      ctx.beginPath()
      ctx.arc(painter.pos.x, painter.pos.y, painter.radius, 0, 2 * Math.PI)
      ctx.fillStyle = `#${painter.color}${painter.alpha}`
      ctx.fill()
    }
    return state
  },
  draw: (state) => {
    const { ctx, painter } = state
    if (ctx) {
      ctx.beginPath()
      ctx.arc(painter.pos.x, painter.pos.y, painter.radius, 0, 2 * Math.PI)
      ctx.strokeStyle = `#${painter.color}${painter.alpha}`
      ctx.lineWidth = painter.radius / 4
      ctx.stroke()
    }
    return state
  },
  move: (state) => {
    const { canvas, painter, wallCollision } = state
    if (canvas) {
      let x = Math.random() * canvas.width
      let y = Math.random() * canvas.height
      if (wallCollision) {
        x = Math.max(0, Math.min(x, canvas.width))
        y = Math.max(0, Math.min(y, canvas.height))
      }
      return { ...state, painter: { ...painter, pos: { x, y } } }
    }
    return state
  },
  color: (state) => {
    const r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    const g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    const b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    return { ...state, painter: { ...state.painter, color: r + g + b } }
  },
  size: (state) => {
    const { canvas } = state
    if (canvas) {
      const limit = Math.min(canvas.width, canvas.height)
      const newRadius = Math.random() / 3 * limit
      return { ...state, painter: { ...state.painter, radius: newRadius } }
    }
    return state
  },
  turn: (state) => {
    const newHeading = Math.random() * Math.PI * 2
    return { ...state, painter: { ...state.painter, heading: newHeading } }
  },
  expand: (state) => {
    return { ...state, painter: { ...state.painter, radius: state.painter.radius * 2 } }
  },
  shrink: (state) => {
    return { ...state, painter: { ...state.painter, radius: state.painter.radius / 2 } }
  },
  mfwd: (state) => {
    const { painter, canvas, wallCollision } = state
    if (canvas) {
      const dist = painter.radius * 2
      let x = painter.pos.x + dist * Math.sin(painter.heading)
      let y = painter.pos.y + dist * Math.cos(painter.heading)
      if (wallCollision) {
        x = Math.max(0, Math.min(x, canvas.width))
        y = Math.max(0, Math.min(y, canvas.height))
      }
      return { ...state, painter: { ...painter, pos: { x, y } } }
    }
    return state
  },
  mright: (state) => {
    const { painter, canvas, wallCollision } = state
    if (canvas) {
      const dist = painter.radius * 2
      let x = painter.pos.x + dist * Math.sin(painter.heading + Math.PI / 2)
      let y = painter.pos.y + dist * Math.cos(painter.heading + Math.PI / 2)
      if (wallCollision) {
        x = Math.max(0, Math.min(x, canvas.width))
        y = Math.max(0, Math.min(y, canvas.height))
      }
      return { ...state, painter: { ...painter, pos: { x, y } } }
    }
    return state
  },
  mleft: (state) => {
    const { painter, canvas, wallCollision } = state
    if (canvas) {
      const dist = painter.radius * 2
      let x = painter.pos.x + dist * Math.sin(painter.heading - Math.PI / 2)
      let y = painter.pos.y + dist * Math.cos(painter.heading - Math.PI / 2)
      if (wallCollision) {
        x = Math.max(0, Math.min(x, canvas.width))
        y = Math.max(0, Math.min(y, canvas.height))
      }
      return { ...state, painter: { ...painter, pos: { x, y } } }
    }
    return state
  },
  mback: (state) => {
    const { painter, canvas, wallCollision } = state
    if (canvas) {
      const dist = painter.radius * 2
      let x = painter.pos.x - dist * Math.sin(painter.heading)
      let y = painter.pos.y - dist * Math.cos(painter.heading)
      if (wallCollision) {
        x = Math.max(0, Math.min(x, canvas.width))
        y = Math.max(0, Math.min(y, canvas.height))
      }
      return { ...state, painter: { ...painter, pos: { x, y } } }
    }
    return state
  },
  turnl: (state) => {
    const newHeading = (state.painter.heading + Math.PI * 0.25) % (Math.PI * 2)
    return { ...state, painter: { ...state.painter, heading: newHeading } }
  },
  turnr: (state) => {
    const newHeading = (state.painter.heading - Math.PI * 0.25 + Math.PI * 2) % (Math.PI * 2)
    return { ...state, painter: { ...state.painter, heading: newHeading } }
  },
  alpha: (state) => {
    const newAlpha = Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    return { ...state, painter: { ...state.painter, alpha: newAlpha } }
  },
  fade: (state) => {
    const currentAlpha = parseInt(state.painter.alpha, 16)
    const newAlpha = Math.max(1, Math.floor(currentAlpha * 2/3)).toString(16).padStart(2, '0')
    return { ...state, painter: { ...state.painter, alpha: newAlpha } }
  },
  glow: (state) => {
    const currentAlpha = parseInt(state.painter.alpha, 16)
    const newAlpha = Math.min(255, Math.floor(currentAlpha * 3/2)).toString(16).padStart(2, '0')
    return { ...state, painter: { ...state.painter, alpha: newAlpha } }
  },
  pink: (state) => ({ ...state, painter: { ...state.painter, color: 'FF00FF' } }),
  indigo: (state) => ({ ...state, painter: { ...state.painter, color: '6F00FF' } }),
  cerise: (state) => ({ ...state, painter: { ...state.painter, color: 'DE3163' } }),
  aqua: (state) => ({ ...state, painter: { ...state.painter, color: '33F3EF' } }),
  lemon: (state) => ({ ...state, painter: { ...state.painter, color: 'DDFF22' } }),
  lime: (state) => ({ ...state, painter: { ...state.painter, color: '33FF00' } }),
  ember: (state) => ({ ...state, painter: { ...state.painter, color: 'FFa900' } }),
  white: (state) => ({ ...state, painter: { ...state.painter, color: 'FFFFFF' } }),
  ltgray: (state) => ({ ...state, painter: { ...state.painter, color: 'CCCCCC' } }),
  mdgray: (state) => ({ ...state, painter: { ...state.painter, color: '888888' } }),
  dkgray: (state) => ({ ...state, painter: { ...state.painter, color: '444444' } }),
  black: (state) => ({ ...state, painter: { ...state.painter, color: '000000' } }),
}

const metaCommands: Record<string, (state: KilnState) => KilnState> = {
  '-clean': (state) => {
    const { ctx, canvas } = state
    if (ctx && canvas) {
      ctx.fillStyle = '#000000FF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    return { ...state, output: '> Canvas cleaned\n' + state.output }
  },
  '-reset': (state) => {
    return {
      ...state,
      painter: initialState.painter,
      output: '> Painter reset\n' + state.output
    }
  },
  '-state': (state) => {
    const { painter } = state
    const stateString = Object.entries(painter)
      .map(([key, value]) => `  ${key}: ${JSON.stringify(value)}`)
      .join('\n')
    return { ...state, output: `> Current painter state:\n${stateString}\n` + state.output }
  },
  '-walls': (state) => {
    const newWallCollision = !state.wallCollision
    return {
      ...state,
      wallCollision: newWallCollision,
      output: `> Wall collision set to: ${newWallCollision}\n` + state.output
    }
  },
  '-defined': (state) => {
    const definitions = Object.entries(state.namespace)
      .map(([key, value]) => `  ${key}: ${value.join(' ')}`)
      .join('\n')
    return { ...state, output: `> Defined commands:\n${definitions}\n` + state.output }
  },
  '-delay': (state) => {
    const newDrawDelay = !state.drawDelay
    return {
      ...state,
      drawDelay: newDrawDelay,
      output: `> Draw delay set to: ${newDrawDelay}\n` + state.output
    }
  },
  '-canvas': (state) => {
    const newResCounter = (state.resCounter + 1) % resolutions.length
    const [width, height, name] = resolutions[newResCounter]
    return {
      ...state,
      resCounter: newResCounter,
      output: `> Canvas size set to: ${name} (${width}x${height})\n` + state.output
    }
  },
  '-clear': (state) => {
    return { ...state, output: '' }
  },
  '-logging': (state) => {
    const newClearLog = !state.clearLog
    return {
      ...state,
      clearLog: newClearLog,
      output: `> Auto clear log set to: ${newClearLog}\n` + state.output
    }
  },
  '-reboot': (state) => {
    return { ...initialState, namespace: state.namespace }
  },
}

export default function Kiln() {
  const [state, setState] = useState<KilnState>(initialState)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        initCanvas(ctx)
        setState(prevState => ({ ...prevState, canvas, ctx }))
      }
    }
    loadFromLocalStorage()
  }, [])

  useEffect(() => {
    saveToLocalStorage()
  }, [state.namespace])

  useEffect(() => {
    if (state.canvas && state.ctx) {
      const [width, height] = resolutions[state.resCounter]
      state.canvas.width = width
      state.canvas.height = height
      initCanvas(state.ctx)
    }
  }, [state.resCounter])

  const initCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#000000FF'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prevState => ({ ...prevState, input: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { input, history } = state
    if (input.trim() === '') return

    processInput(input)
    setState(prevState => ({
      ...prevState,
      input: '',
      history: [input, ...history].slice(0, 100),
      historyIndex: -1
    }))
  }

  const processInput = (input: string) => {
    const tokens = input.trim().toLowerCase().split(/\s+/)
    if (tokens.length === 1 && tokens[0].startsWith('-')) {
      executeMeta(tokens[0])
    } else if (tokens[1] === '>>') {
      define(tokens)
    } else {
      
      executeCommand(tokens)
    }
  }

  const executeMeta = (metaCommand: string) => {
    if (metaCommand in metaCommands) {
      setState(prevState => metaCommands[metaCommand](prevState))
    } else {
      send(`Unknown meta command: ${metaCommand}`)
    }
  }

  const define = (tokens: string[]) => {
    const [name, , ...definition] = tokens
    setState(prevState => ({
      ...prevState,
      namespace: { ...prevState.namespace, [name]: definition }
    }))
    send(`Defined: ${tokens.join(' ')}`)
  }

  const executeCommand = async (tokens: string[]) => {
    for (const token of tokens) {
      const [multiplier, command] = parseToken(token)
      if (command in primitives) {
        for (let i = 0; i < multiplier; i++) {
          setState(prevState => primitives[command](prevState))
          if (state.drawDelay) {
            await new Promise(resolve => setTimeout(resolve, 1))
          }
        }
      } else if (command in state.namespace) {
        for (let i = 0; i < multiplier; i++) {
          await executeCommand(state.namespace[command])
        }
      } else {
        send(`Unknown command: ${command}`)
      }
    }
    send(`Executed: ${tokens.join(' ')}`)
  }

  const parseToken = (token: string): [number, string] => {
    const match = token.match(/^(\d+)?(.+)$/)
    if (match) {
      const [, multiplier, command] = match
      return [multiplier ? parseInt(multiplier) : 1, command]
    }
    return [1, token]
  }

  const send = (message: string) => {
    setState(prevState => ({
      ...prevState,
      output: prevState.clearLog ? `> ${message}\n` : `> ${message}\n${prevState.output}`
    }))
  }

  const handleHistoryNavigation = (direction: 'up' | 'down') => {
    setState(prevState => {
      const { history, historyIndex } = prevState
      let newIndex = historyIndex + (direction === 'up' ? 1 : -1)
      newIndex = Math.max(-1, Math.min(newIndex, history.length - 1))
      return {
        ...prevState,
        historyIndex: newIndex,
        input: newIndex === -1 ? '' : history[newIndex]
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleHistoryNavigation('up')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleHistoryNavigation('down')
    }
  }

  const saveSnapshot = () => {
    if (state.canvas) {
      const link = document.createElement('a')
      link.download = 'kiln-snapshot.png'
      link.href = state.canvas.toDataURL()
      link.click()
    }
  }

  const clearNamespace = () => {
    setState(prevState => ({ ...prevState, namespace: {} }))
    send('All learned commands forgotten')
  }

  const saveToLocalStorage = () => {
    localStorage.setItem('kilnNamespace', JSON.stringify(state.namespace))
  }

  const loadFromLocalStorage = () => {
    const savedNamespace = localStorage.getItem('kilnNamespace')
    if (savedNamespace) {
      setState(prevState => ({
        ...prevState,
        namespace: JSON.parse(savedNamespace)
      }))
      send('Loaded saved commands from local storage')
    }
  }

  return (
    <div className="min-h-screen bg-black p-4 border-none">
      <Card className="max-w-4xl mx-auto bg-gradient-to-br from-[#B00B69] via-[#320A55] to-[#042069] text-white border-none">
        <CardContent className="p-6 space-y-4">
          <canvas
            ref={canvasRef}
            width={resolutions[state.resCounter][0]}
            height={resolutions[state.resCounter][1]}
            className="w-full max-h-[350px] object-contain mx-auto border-none"
          />
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-[#ff00ff] sm:text-sm">&gt;</span>
              </div>
              <Input
                value={state.input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type commands here"
                className="pl-7 bg-black text-[#ff00ff] border-none placeholder-pink-900 font-mono"
              />
            </div>
            <Button className="bg-black" type="submit" variant="outline">
              Submit
            </Button>
          </form>
          {state.hint && (
            <div className="bg-black p-2 rounded">
              <span className="text-gray-400">Hint: </span>
              {state.hint}
            </div>
          )}
          <Textarea
            value={state.output}
            readOnly
            className="h-32 bg-black text-[#ff00ff] border-none font-mono"
          />
          <div className="flex flex-wrap gap-2">
            {Object.keys(state.namespace).map(cmd => (
              <Button key={cmd} variant="outline" size="sm" onClick={() => executeCommand([cmd])} className="text-[#33F3EF] border-[#33F3EF] bg-black font-mono">
                {cmd}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(primitives).map(cmd => (
              <Button key={cmd} variant="outline" size="sm" onClick={() => executeCommand([cmd])} className="text-[#DE3163] border-[#DE3163] bg-black font-mono">
                {cmd}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(metaCommands).map(cmd => (
              <Button key={cmd} variant="outline" size="sm" onClick={() => executeMeta(cmd)} className="text-[#6F00FF] border-[#6F00FF] bg-black font-mono">
                {cmd}
              </Button>
            ))}
          </div>
          <div className="flex justify-between">
            <Button className="bg-black" variant="outline" size="icon" onClick={() => setState(prevState => ({ ...prevState, displayHelp: !prevState.displayHelp }))}>
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button className="bg-black" variant="outline" size="icon" onClick={saveSnapshot}>
              <Image className="h-4 w-4" />
            </Button>
            <Button className="bg-black" variant="outline" size="icon" onClick={() => executeMeta('-canvas')}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button className="bg-black" variant="outline" size="icon" onClick={() => executeMeta('-reboot')}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button className="bg-black" variant="outline" size="icon" onClick={clearNamespace}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {state.displayHelp && (
            <Textarea
              value={`Help text:
paint: create a filled circle using painter's current state
draw: create a ring using painter's current state
move: move painter to a random position on the canvas
color: change painter to a random color
size: change radius to a random size
turn: turn painter's heading to a random angle
expand: double the painter's current radius
shrink: halve the painter's current radius
mfwd/mright/mleft/mback: move painter in specified direction
turnl/turnr: turn painter 45 degrees left/right
alpha: set painter's alpha to a random value
fade/glow: decrease/increase painter's alpha
pink/indigo/cerise/aqua/lemon/lime/ember: set painter to predefined neon colors
white/ltgray/mdgray/dkgray/black: set painter to predefined grayscale shades

You can use multipliers, e.g., 5paint will execute paint 5 times.

Meta commands:
-clean: clear all paint from canvas
-reset: reset the state of the painter to default
-state: log the current state of the painter
-walls: toggle whether walls will prevent movement beyond canvas edge
-defined: show all defined commands
-delay: toggle draw delay for animations
-canvas: cycle through possible canvas sizes
-clear: clear the log
-logging: toggle auto-clear log on/off
-reboot: return entire system to default state, apart from recently defined commands`}
              readOnly
              className="h-80 bg-gray-800 text-white border-gray-700 font-mono"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}