import {
    clickSound,
    completeSound,
    erase,
    cabel,
    sounds,
    animations,
    iconText
} from "./elements.js"

    export function onSoundsMuted() {
      return sounds.checked
    }

    export function onAnimationsDisabled() {
      return animations.checked
    }

    export function onIconTextDisabled() {
      return !iconText.checked
    }
    
    export function shadow_enabled(shadow) {
      shadow.style.opacity = 1
      shadow.style.transition = "0.5s ease"
      shadow.style.pointerEvents = "all"
    }

    export function shadow_disabled(shadow) {
      shadow.style.opacity = 0
      shadow.style.transition = "0.5s ease"
      shadow.style.pointerEvents = "none"
    }

    export function auto_build_panel_enabled(buildModePanel) {
      buildModePanel.style.opacity = 1
      buildModePanel.style.transition = "0.5s ease"
      buildModePanel.style.pointerEvents = "all"
    }

    export function auto_build_panel_disabled(buildModePanel) {
      buildModePanel.style.opacity = 0
      buildModePanel.style.transition = "0.5s ease"
      buildModePanel.style.pointerEvents = "none"
    }

    export function warning_window_enabled(warningWindow) {
      warningWindow.style.opacity = 1
      warningWindow.style.transition = "0.5s ease"
      warningWindow.style.pointerEvents = "all"
    }

    export function warning_window_disabled(warningWindow) {
      warningWindow.style.opacity = 0
      warningWindow.style.transition = "0.5s ease"
      warningWindow.style.pointerEvents = "none"
    }

    export function wire_window_enabled(wireTitleWindow) {
      wireTitleWindow.style.opacity = 1
      wireTitleWindow.style.transition = "0.5s ease"
      wireTitleWindow.style.pointerEvents = "all"
    }

    export function wire_window_disabled(wireTitleWindow) {
      wireTitleWindow.style.opacity = 0
      wireTitleWindow.style.transition = "0.5s ease"
      wireTitleWindow.style.pointerEvents = "none"
    }

    export function erase_enabled(erase) {
      erase.style.background = "rgb(206, 7, 7)"
      erase.style.color = "white"
    }

    export function erase_disabled(erase) {
      erase.style.background = "white"
      erase.style.color = "black"
      erase.classList.remove("active")
    }

    export function cabel_enabled(cabel) {
      cabel.style.background = "black"
      cabel.style.color = "white"
    }

    export function cabel_disabled(cabel) {
      cabel.style.background = "white"
      cabel.style.color = "black"
      cabel.classList.remove("active")
    }

    export function playClickSound() {
      if (!onSoundsMuted()) {
        clickSound.currentTime = 0
        clickSound.play()
      }
    }

    export function playCompleteSound() {
      if (!onSoundsMuted()) {
        completeSound.currentTime = 0
        completeSound.play()
      }
    }

export function getWireLabelAngle(start, end) {
    let angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI)

    if (angle > 90 || angle < -90) {
        angle += 180
    }
    return angle
}

export function getPerpendicularUnit(start, end) {
    const deltaX = end.x - start.x
    const deltaY = end.y - start.y
    const length = Math.hypot(deltaX, deltaY) || 1

    let perpendicularX = -deltaY / length
    let perpendicularY = deltaX / length

    if (perpendicularY > 0) {
        perpendicularX = -perpendicularX
        perpendicularY = -perpendicularY
    }
    return {
        x: perpendicularX,
        y: perpendicularY
    }
}

export function getWireLabelPositions(start, end, offset = 10, gap = 12) {
    const middleX = (start.x + end.x) / 2
    const middleY = (start.y + end.y) / 2
    const angle = getWireLabelAngle(start, end)
    const perpendicular = getPerpendicularUnit(start, end)

    const topX = middleX + perpendicular.x * offset
    const topY = middleY + perpendicular.y * offset

    const bottomOffset = offset + gap
    const bottomX = middleX - perpendicular.x * bottomOffset
    const bottomY = middleY - perpendicular.y * bottomOffset

    return { angle, top: { x: topX, y: topY }, bottom: { x: bottomX, y: bottomY } }
}
