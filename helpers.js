import {
    clickSound,
    completeSound,
    erase,
    cabel
} from "./elements.js"
    
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
        clickSound.currentTime = 0
        clickSound.play()
    }

    export function playCompleteSound() {
        completeSound.currentTime = 0
        completeSound.play()
    }