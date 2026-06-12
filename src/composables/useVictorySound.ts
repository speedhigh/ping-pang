export type VictorySoundKind = 'game' | 'match' | 'single'

let audioContext: AudioContext | null = null
let unlocked = false

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

/** 首次点击时解锁 iOS / 移动端音频 */
export function unlockVictorySound() {
  if (unlocked) return
  const ctx = getContext()
  void ctx.resume()
  unlocked = true
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume = 0.18,
  type: OscillatorType = 'triangle',
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.05)
}

function playNoiseBurst(ctx: AudioContext, start: number, duration: number, volume = 0.06) {
  const bufferSize = Math.floor(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(volume, start)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 900
  filter.Q.value = 0.6
  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start(start)
  source.stop(start + duration + 0.05)
}

const FANFARES: Record<VictorySoundKind, number[]> = {
  single: [523.25, 659.25, 783.99],
  game: [523.25, 659.25, 783.99, 1046.5],
  match: [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 1760, 2093],
}

export function playVictorySound(kind: VictorySoundKind) {
  try {
    const ctx = getContext()
    if (ctx.state === 'suspended') {
      void ctx.resume()
    }

    const now = ctx.currentTime
    const notes = FANFARES[kind]
    const noteGap = kind === 'match' ? 0.11 : 0.13
    const noteLen = kind === 'match' ? 0.28 : 0.22
    const volume = kind === 'match' ? 0.22 : kind === 'game' ? 0.18 : 0.15

    notes.forEach((freq, index) => {
      playTone(ctx, freq, now + index * noteGap, noteLen, volume)
      if (kind === 'match' && index % 2 === 1) {
        playTone(ctx, freq * 0.5, now + index * noteGap, noteLen * 1.1, volume * 0.45, 'sine')
      }
    })

    if (kind === 'game' || kind === 'match') {
      playNoiseBurst(
        ctx,
        now + notes.length * noteGap * 0.35,
        kind === 'match' ? 0.45 : 0.25,
        kind === 'match' ? 0.09 : 0.05,
      )
    }
    if (kind === 'match') {
      playNoiseBurst(ctx, now + notes.length * noteGap * 0.55, 0.35, 0.07)
    }
  } catch {
    /* 静默失败 */
  }
}
