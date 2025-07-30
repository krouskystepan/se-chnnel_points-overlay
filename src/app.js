const container = document.getElementById('box')

let fieldData
const activeTimers = {} // udržíme si běžící intervaly

window.addEventListener('onWidgetLoad', (obj) => {
  fieldData = obj.detail.fieldData

  Object.keys(fieldData).forEach((key) => {
    const value = fieldData[key]
    if (!value) return

    const [label, name, secondsRaw] = value.split(':')
    const seconds = parseInt(secondsRaw, 10)
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
    const sec = String(seconds % 60).padStart(2, '0')
    const formatted = `${minutes}:${sec}`

    const className = name.replace(/\s+/g, '_')

    const p = document.createElement('p')
    p.classList.add('timer-wrapper')
    p.classList.add(className) // kvůli pozdějšímu přístupu
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
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

window.addEventListener('onEventReceived', (obj) => {
  const event = obj.detail.event
  const rewardNameRaw = event.data?.redemption
  if (event.type !== 'channelPointsRedemption') return
  if (!rewardNameRaw) return

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
  const endTime = Date.now() + duration

  const p = document.querySelector(`p.${rewardName}`)
  if (!p) return

  const timeSpan = p.querySelector('.time')
  p.classList.remove('hidden')
  container.classList.remove('hidden')

  // Pokud už timer běží, resetuj ho
  if (activeTimers[rewardName]) {
    clearInterval(activeTimers[rewardName])
  }

  timeSpan.textContent = formatTime(duration)

  activeTimers[rewardName] = setInterval(() => {
    const remaining = endTime - Date.now()

    if (remaining <= 0) {
      clearInterval(activeTimers[rewardName])
      delete activeTimers[rewardName]

      timeSpan.textContent = '00:00'
      p.classList.add('hidden')

      // Pokud už žádný timer neběží, schovej celý box
      if (Object.keys(activeTimers).length === 0) {
        container.classList.add('hidden')
      }

      return
    }

    timeSpan.textContent = formatTime(remaining)
  }, 1000)
})
