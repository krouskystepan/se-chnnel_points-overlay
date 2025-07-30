const container = document.getElementById('box')
const sound = document.getElementById('sound')

let fieldData
const activeTimers = {}
const pausedTimers = {}

// Setup
const createTimerElement = (label, name, seconds) => {
  const formatted = formatTime(seconds * 1000)
  const className = name.replace(/\s+/g, '_')

  const p = document.createElement('p')
  p.classList.add('timer-wrapper', className, 'hidden')

  const labelSpan = document.createElement('span')
  labelSpan.textContent = `${label}: `

  const timeSpan = document.createElement('span')
  timeSpan.classList.add('time')
  timeSpan.textContent = formatted

  p.appendChild(labelSpan)
  p.appendChild(timeSpan)
  container.appendChild(p)
}

const setupTimersFromFieldData = (fieldDataObj) => {
  Object.entries(fieldDataObj).forEach(([key, value]) => {
    if (!key.toLowerCase().includes('reward')) return
    if (typeof value !== 'string') return
    if (!value) return
    const parts = value.split(':')
    if (parts.length < 3) return
    const [label, name, secondsRaw] = parts
    if (!name) return
    const seconds = parseInt(secondsRaw, 10)
    if (isNaN(seconds)) return
    createTimerElement(label, name, seconds)
  })
}

// Main Logic
const formatTime = (ms) => {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

const getTimerDurationByRewardName = (rewardName) => {
  const entry = Object.entries(fieldData).find(([key, val]) => {
    if (!val || typeof val !== 'string') return false
    if (!key.toLowerCase().includes('reward')) return false
    const parts = val.split(':')
    if (parts.length < 3) return false
    return parts[1].replace(/\s+/g, '_') === rewardName
  })

  if (!entry) return null

  const [, value] = entry
  const [, , secondsRaw] = value.split(':')
  return parseInt(secondsRaw, 10) * 1000
}

const startTimer = (rewardName, duration) => {
  const p = document.querySelector(`p.${rewardName}`)
  if (!p) return

  const timeSpan = p.querySelector('.time')
  p.classList.remove('hidden')
  container.classList.remove('hidden')

  if (activeTimers[rewardName]) {
    clearInterval(activeTimers[rewardName])
  }

  const endTime = Date.now() + duration

  const updateTimer = () => {
    const remaining = endTime - Date.now()

    if (remaining <= 0) {
      timeSpan.textContent = '00:00'
      sound.play()

      setTimeout(() => {
        clearInterval(activeTimers[rewardName])
        delete activeTimers[rewardName]
        p.classList.add('hidden')

        // Pokud není žádný aktivní timer, skryj celý kontejner
        if (Object.keys(activeTimers).length === 0) {
          container.classList.add('hidden')
        }
      }, 500)

      return
    }

    timeSpan.textContent = formatTime(remaining)
  }

  updateTimer()
  activeTimers[rewardName] = setInterval(updateTimer, 1000)
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
    pauseAllTimers,
    unpauseAllTimers,
    deleteTimer,
  } = fieldData
  const { text } = data

  const createTimerText = text.startsWith(createTimerCommand)
  const pauseTimerText = text.startsWith(pauseTimerCommand)
  const unpauseTimerText = text.startsWith(unpauseTimerCommand)
  const pauseAllTimersText = text.startsWith(pauseAllTimers)
  const unpauseAllTimersText = text.startsWith(unpauseAllTimers)
  const deleteTimerText = text.startsWith(deleteTimer)

  console.log(deleteTimer)
  console.log(deleteTimerText)

  if (createTimerText) {
    const param = text.slice(createTimerCommand.length).trim()
    const parts = param.split(':')

    if (parts.length === 3) {
      const label = parts[0].trim()
      const name = parts[1].trim()
      const seconds = parseInt(parts[2].trim(), 10)

      if (!isNaN(seconds) && seconds > 0) {
        createTimerElement(label, name, seconds)

        const className = name.replace(/\s+/g, '_')
        startTimer(className, seconds * 1000)
      }
    }
  }

  if (pauseTimerText) {
    const timerNameRaw = text.slice(pauseTimerCommand.length).trim()
    const timerName = timerNameRaw.replace(/\s+/g, '_')

    if (activeTimers[timerName]) {
      const p = document.querySelector(`p.${timerName}`)
      if (p) {
        const timeSpan = p.querySelector('.time')
        const [min, sec] = timeSpan.textContent.split(':').map(Number)
        pausedTimers[timerName] = (min * 60 + sec) * 1000
      }

      clearInterval(activeTimers[timerName])
      delete activeTimers[timerName]
    }
  }

  if (unpauseTimerText) {
    const timerNameRaw = text.slice(unpauseTimerCommand.length).trim()
    const timerName = timerNameRaw.replace(/\s+/g, '_')

    if (pausedTimers[timerName]) {
      startTimer(timerName, pausedTimers[timerName])
      delete pausedTimers[timerName]
    }
  }

  if (pauseAllTimersText) {
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
  }

  if (unpauseAllTimersText) {
    Object.entries(pausedTimers).forEach(([timerName, timeLeft]) => {
      startTimer(timerName, timeLeft)
      delete pausedTimers[timerName]
    })
  }

  if (deleteTimerText) {
    const timerNameRaw = text.slice(deleteTimer.length).trim()
    const timerName = timerNameRaw.replace(/\s+/g, '_')

    console.log('DELETE')

    if (activeTimers[timerName]) {
      clearInterval(activeTimers[timerName])
      delete activeTimers[timerName]
    }
    if (pausedTimers[timerName]) {
      delete pausedTimers[timerName]
    }

    const p = document.querySelector(`p.${timerName}`)
    if (p) {
      p.classList.add('hidden')

      const timeSpan = p.querySelector('.time')
      const duration = getTimerDurationByRewardName(timerName)

      if (duration !== null) {
        timeSpan.textContent = formatTime(duration)
      } else {
        timeSpan.textContent = '00:00'
      }
    }
  }
}

// Listeners
window.addEventListener('onWidgetLoad', (obj) => {
  fieldData = obj.detail.fieldData
  sound.volume = fieldData.volume
  setupTimersFromFieldData(fieldData)
})

window.addEventListener('onEventReceived', (obj) => {
  const event = obj.detail.event
  const rewardNameRaw = event.data?.redemption
  if (event.type !== 'channelPointsRedemption' || !rewardNameRaw) return

  const rewardName = rewardNameRaw.replace(/\s+/g, '_')
  const duration = getTimerDurationByRewardName(rewardName)

  if (duration !== null) {
    startTimer(rewardName, duration)
  }
})

window.addEventListener('onEventReceived', (obj) => {
  if (obj.detail.listener !== 'message') return

  handleCommand(obj)
})
