const oneTime_wrapper = document.getElementById('oneTime-wrapper')
const timers_wrapper = document.getElementById('timers-wrapper')
const end_sound = document.getElementById('end-sound')
const buy_sound = document.getElementById('buy-sound')

let fieldData
const activeTimers = {}
const pausedTimers = {}

// Utils
const extractTimerName = (text) => {
  return text.trim().replace(/\s+/g, '_')
}

const removeTimerElement = (name) => {
  const p = document.querySelector(`p.${name}`)
  if (p && p.parentNode) {
    p.parentNode.removeChild(p)
  }
}

const formatTime = (ms) => {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

const getValuesByRewardName = (rewardName) => {
  for (const [key, val] of Object.entries(fieldData)) {
    if (!val || typeof val !== 'string') continue

    const parts = val.split(':')

    if (key.toLowerCase().startsWith('timer_reward') && parts.length >= 3) {
      const [label, name, secondsRaw] = parts
      if (extractTimerName(name) === rewardName) {
        return [label, rewardName, parseInt(secondsRaw, 10) * 1000]
      }
    }

    if (key.toLowerCase().startsWith('onetime_reward') && parts.length === 2) {
      const [label, name] = parts
      if (extractTimerName(name) === rewardName) {
        return [label, rewardName, null]
      }
    }
  }

  return null
}

// Main Logic
const showError = (message) => {
  const wrapper = document.getElementById('error-wrapper')
  if (!wrapper) return

  const textElement = document.getElementById('error-text')
  if (!textElement) return

  textElement.textContent = message
  wrapper.classList.remove('hidden')

  setTimeout(() => {
    wrapper.classList.add('hidden')
  }, 5000)
}

const createTimerElement = (label, rewardName, seconds) => {
  const formatted = formatTime(seconds * 1000)
  const className = extractTimerName(rewardName)

  const p = document.createElement('p')
  p.classList.add('timer-wrapper', className)

  const labelSpan = document.createElement('span')
  labelSpan.textContent = `${label}: `

  const timeSpan = document.createElement('span')
  timeSpan.classList.add('time')
  timeSpan.textContent = formatted

  p.appendChild(labelSpan)
  p.appendChild(timeSpan)
  timers_wrapper.appendChild(p)
}

const createOneTimeReward = (label, rewardName) => {
  const className = extractTimerName(rewardName)

  const p = document.createElement('p')
  p.classList.add('oneTime-wrapper', className)

  const labelSpan = document.createElement('span')
  labelSpan.textContent = `${label}`

  p.appendChild(labelSpan)
  oneTime_wrapper.appendChild(p)

  setTimeout(() => {
    p.remove()
  }, 10000)
}

const startTimer = (rewardName, duration, label) => {
  let p = document.querySelector(`p.${rewardName}`)

  if (!p) {
    createTimerElement(label, rewardName, duration / 1000)
    p = document.querySelector(`p.${rewardName}`)
  }

  const timeSpan = p.querySelector('.time')

  if (activeTimers[rewardName]) {
    clearInterval(activeTimers[rewardName])
  }

  const endTime = Date.now() + duration

  const updateTimer = () => {
    const remaining = endTime - Date.now()

    if (remaining <= 0) {
      clearInterval(activeTimers[rewardName])
      delete activeTimers[rewardName]

      end_sound.play()
      timeSpan.textContent = '00:00'

      setTimeout(() => {
        removeTimerElement(rewardName)
      }, 4000)

      return
    }

    timeSpan.textContent = formatTime(remaining)
  }

  updateTimer()
  activeTimers[rewardName] = setInterval(updateTimer, 1000)
}

const extendTimer = (rewardName, msDuration) => {
  const p = document.querySelector(`p.${rewardName}`)
  if (!p) return

  const timeSpan = p.querySelector('.time')
  if (!timeSpan) return

  const [min, sec] = timeSpan.textContent.split(':').map(Number)
  const currentMs = (min * 60 + sec) * 1000
  let newTime = currentMs + msDuration

  if (newTime <= 0) {
    if (activeTimers[rewardName]) {
      clearInterval(activeTimers[rewardName])
      delete activeTimers[rewardName]
    }
    if (pausedTimers[rewardName]) {
      delete pausedTimers[rewardName]
    }

    end_sound.play()

    timeSpan.textContent = '00:00'

    setTimeout(() => {
      removeTimerElement(rewardName)
    }, 4000)
    return
  }

  clearInterval(activeTimers[rewardName])
  startTimer(rewardName, newTime)
}

// Commands
const checkPrivileges = (data, privileges) => {
  const { tags, userId } = data
  const { mod, subscriber, badges } = tags
  const required = privileges || fieldData.privileges
  const isMod = parseInt(mod)
  const isSub = parseInt(subscriber)
  const isVip = badges.indexOf('vip') !== -1
  const isBroadcaster = userId === tags['room-id']
  if (isBroadcaster) return true
  if (required === 'justSubs' && isSub) return true
  if (required === 'mods' && isMod) return true
  if (required === 'vips' && (isMod || isVip)) return true
  if (required === 'subs' && (isMod || isVip || isSub)) return true
  return required === 'everybody'
}

const handleCommand = (obj) => {
  const data = obj.detail.event.data
  if (!checkPrivileges(data)) return

  const {
    createTimerCommand,
    pauseTimerCommand,
    unpauseTimerCommand,
    pauseAllTimersCommand,
    unpauseAllTimersCommand,
    adjustTimerCommand,
    deleteTimerCommand,
    deleteAllTimersCommand,
  } = fieldData

  const { text } = data
  const [command, ...args] = text.trim().split(/\s+/)

  let param, parts

  switch (command) {
    case createTimerCommand:
      param = text.slice(createTimerCommand.length).trim()
      parts = param.split(':')

      if (parts.length === 3) {
        const label = parts[0].trim()
        const name = parts[1].trim()
        const seconds = parseInt(parts[2].trim(), 10)

        if (activeTimers[name]) return showError('Timer už existuje')
        if (isNaN(seconds) || seconds <= 0)
          return showError('Neplatná syntaxe příkazu')

        createTimerElement(label, name, seconds)
        const className = extractTimerName(name)
        startTimer(className, seconds * 1000)
      } else {
        showError('Neplatná syntaxe příkazu')
      }
      break

    case pauseTimerCommand:
    case unpauseTimerCommand:
    case deleteTimerCommand:
      const cmdLength = command.length
      const timerNameRaw = text.slice(cmdLength).trim()
      const timerName = extractTimerName(timerNameRaw)

      if (command === pauseTimerCommand) {
        if (!activeTimers[timerName]) return showError('Timer nenalezen')

        const p = document.querySelector(`p.${timerName}`)
        if (p) {
          const timeSpan = p.querySelector('.time')
          const [min, sec] = timeSpan.textContent.split(':').map(Number)
          pausedTimers[timerName] = (min * 60 + sec) * 1000
        }
        clearInterval(activeTimers[timerName])
        delete activeTimers[timerName]
      }

      if (command === unpauseTimerCommand) {
        if (!pausedTimers[timerName]) return showError('Timer nenalezen')
        startTimer(timerName, pausedTimers[timerName])
        delete pausedTimers[timerName]
      }

      if (command === deleteTimerCommand) {
        if (activeTimers[timerName]) {
          clearInterval(activeTimers[timerName])
          delete activeTimers[timerName]
        } else if (pausedTimers[timerName]) {
          delete pausedTimers[timerName]
        } else {
          return showError('Timer nenalezen')
        }

        removeTimerElement(timerName)
      }
      break

    case pauseAllTimersCommand:
      Object.keys(activeTimers).forEach((timerName) => {
        const p = document.querySelector(`p.${timerName}`)
        if (p) {
          const timeSpan = p.querySelector('.time')
          const [min, sec] = timeSpan.textContent.split(':').map(Number)
          pausedTimers[timerName] = (min * 60 + sec) * 1000
        }
        clearInterval(activeTimers[timerName])
        delete activeTimers[timerName]
      })
      break

    case unpauseAllTimersCommand:
      Object.entries(pausedTimers).forEach(([timerName, timeLeft]) => {
        startTimer(timerName, timeLeft)
        delete pausedTimers[timerName]
      })
      break

    case adjustTimerCommand:
      param = text.slice(adjustTimerCommand.length).trim()
      parts = param.split(':')

      if (parts.length === 3) {
        const action = parts[0].trim()
        const raw = parts[1].trim()
        const timerName = extractTimerName(raw)
        const secondsValue = parseInt(parts[2].trim(), 10)

        if (!['+', '-'].includes(action) || isNaN(secondsValue)) {
          return showError('Neplatná syntaxe příkazu')
        }

        if (!activeTimers[timerName] && !pausedTimers[timerName]) {
          return showError('Timer nenalezen')
        }

        const msChange = (action === '-' ? -1 : 1) * secondsValue * 1000
        extendTimer(timerName, msChange)
      } else {
        showError('Neplatná syntaxe příkazu')
      }
      break

    case deleteAllTimersCommand:
      for (const name in activeTimers) {
        clearInterval(activeTimers[name])
        delete activeTimers[name]
        removeTimerElement(name)
      }
      for (const name in pausedTimers) {
        delete pausedTimers[name]
        removeTimerElement(name)
      }
      break
  }
}

// Listeners
window.addEventListener('onWidgetLoad', (obj) => {
  fieldData = obj.detail.fieldData
  buy_sound.volume = fieldData.volume
  end_sound.volume = fieldData.volume
  setupTimersFromFieldData(fieldData)
})

window.addEventListener('onEventReceived', (obj) => {
  const { event, listener } = obj.detail

  if (event.type === 'channelPointsRedemption' && event.data?.redemption) {
    const rewardNameRaw = event.data.redemption
    const rewardName = extractTimerName(rewardNameRaw)

    if (!rewardName) return

    const values = getValuesByRewardName(rewardName)
    if (!values) return

    const [label, _, duration] = values

    if (duration !== null) {
      if (activeTimers[rewardName]) {
        extendTimer(rewardName, duration)
      } else if (pausedTimers[rewardName]) {
        pausedTimers[rewardName] += duration
      } else {
        startTimer(rewardName, duration, label)
      }
    } else {
      createOneTimeReward(label, rewardName)
    }

    buy_sound.play()
  }

  if (listener === 'message') {
    handleCommand(obj)
  }
})
