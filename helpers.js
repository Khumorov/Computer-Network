import {
    clickSound,
    completeSound,
    erase,
    cabel,
    sounds,
    animations
} from "./elements.js"

    export function onSoundsMuted() {
      return sounds.checked
    }

    export function onAnimationsDisabled() {
      return animations.checked
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
