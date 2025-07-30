const container = document.getElementById('box')
const sound = document.getElementById('sound')

let fieldData
const activeTimers = {} // udržíme si běžící intervaly

window.addEventListener('onWidgetLoad', (obj) => {
  fieldData = obj.detail.fieldData
  sound.volume = fieldData.volume

  Object.keys(fieldData).forEach((key) => {
    const value = fieldData[key]
    if (!value) return

    const [label, name, secondsRaw] = value.split(':')
    const seconds = parseInt(secondsRaw, 10)
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
    const sec = String(seconds % 60).padStart(2, '0')
    const formatted = `${minutes}:${sec}`

    const className = name?.replace(/\s+/g, '_')

    const p = document.createElement('p')
    p.classList.add('timer-wrapper')
    p.classList.add(className)
    p.classList.add('hidden')

    const labelSpan = document.createElement('span')
    labelSpan.textContent = `${label}: `

    const timeSpan = document.createElement('span')
    timeSpan.classList.add('time')
    timeSpan.textContent = formatted

    p.appendChild(labelSpan)
    p.appendChild(timeSpan)
    container.appendChild(p)
  })
})

const formatTime = (ms) => {
  const totalSeconds = Math.ceil(ms / 1000) // tady používáme ceil místo floor
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
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

window.addEventListener('onEventReceived', (obj) => {
  const event = obj.detail.event
  const rewardNameRaw = event.data?.redemption
  if (event.type !== 'channelPointsRedemption' || !rewardNameRaw) return

  const rewardName = rewardNameRaw.replace(/\s+/g, '_')

  const entry = Object.values(fieldData).find((val) => {
    if (!val) return false
    const parts = val.split(':')
    if (parts.length < 3) return false
    return parts[1].replace(/\s+/g, '_') === rewardName
  })

  if (!entry) return

  const [_, __, secondsRaw] = entry.split(':')
  const duration = parseInt(secondsRaw, 10) * 1000

  startTimer(rewardName, duration)
})
