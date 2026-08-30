import {
    shadow,
    buildMode,
    buildModePanel,
    buildButton,
    download,
    cabel,
    erase,
    newCanvas,
    warningWindow,
    choiceYes,
    choiceNo,
    clickSound,
    completeSound,
    pageFlipSound,
    iconsContainer,
    canvas,
    viewport,
    settingsButton,
    settingsPanel,
    sounds,
    animations
} from "./elements.js"

import {
    shadow_enabled,
    shadow_disabled,
    auto_build_panel_enabled,
    auto_build_panel_disabled,
    playClickSound,
    playCompleteSound,
    erase_enabled,
    erase_disabled,
    cabel_enabled,
    cabel_disabled,
    warning_window_enabled,
    warning_window_disabled,
    onSoundsMuted,
    onAnimationsDisabled
} from "./helpers.js"

import {
    icons,
    ethernetStandards
} from "./config.js"

import {
    enableDrag,
    createCanvasNode
} from "./drag.js"

import {
    enablePan
} from "./world.js"

import {
    removeWiresForNode,
    createWire,
    updateAllWires
} from "./wires.js"

import {
    saveNetwork,
    loadNetwork,
    clearSavedNetwork
} from "./storage.js"

onSoundsMuted()
onAnimationsDisabled()

function createIcon(iconPath, text, id) {
    const block = document.createElement("div")
    block.className = `element`
    block.id = id

    const blockIcon = document.createElement("span")
    blockIcon.className = `icon-window`

    const blockImg = document.createElement("img")
    blockImg.src = iconPath

    const blockText = document.createElement("span")
    blockText.className = `text`
    blockText.textContent = text

    blockIcon.appendChild(blockImg)
    block.appendChild(blockIcon)
    block.appendChild(blockText)

    return block

}

icons.forEach((icon, index) => {
    const element = createIcon(
        icon.iconPath,
        icon.name,
        `icon-${index}`
    )
    iconsContainer.appendChild(element)
    enableDrag(element, canvas, icon.type, icon.name)
})

function createSelect(option) {
    const select = document.createElement("select")
    select.id = "build-mode-list"

    const placeholder = document.createElement("option");
    placeholder.textContent = "Выберите стандарт Ethernet";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.hidden = true;
    select.appendChild(placeholder);

    option.forEach(standard => {
        const opt = document.createElement("option")

        opt.textContent = standard.name
        opt.value = standard.name
        select.appendChild(opt)
    })
    return select
}

const select = createSelect(ethernetStandards)
buildModePanel.insertBefore(select, buildButton)

enablePan(canvas, viewport, updateAllWires)

viewport.addEventListener("world-pan_end", saveNetwork)

loadNetwork(createCanvasNode, createWire)

function autoBuild() {
    playClickSound()
    auto_build_panel_enabled(buildModePanel)
    shadow_enabled(shadow)
}

function autoBuildClose() {
    auto_build_panel_disabled(buildModePanel)
    shadow_disabled(shadow)
}

function onButtonClick() {
    playCompleteSound()
    auto_build_panel_disabled(buildModePanel)
    shadow_disabled(shadow)
}

function onCabelClick() {
    erase_disabled(erase)

    cabel.classList.toggle("active")
    playClickSound()

    if (cabel.classList.contains("active")) {
    cabel_enabled(cabel)
    } else {
    cabel_disabled(cabel)
    }
}

function onEraseClick() {
    cabel_disabled(cabel)

    erase.classList.toggle("active")
    playClickSound()

    if (erase.classList.contains("active")) {
    erase_enabled(erase)
    } else {
    erase_disabled(erase)
    }
}

function onNewCanvasClick() {
    playClickSound()
    warning_window_enabled(warningWindow)
    shadow_enabled(shadow)
}

function clearAllCanvas() {
    const allNodes = document.querySelectorAll(".canvas-node")

    allNodes.forEach(node => {
        removeWiresForNode(node)
        node.remove()
    })

    clearSavedNetwork()

    if (!onSoundsMuted()) {
    pageFlipSound.currentTime = 0
    pageFlipSound.play()
    }
}

function onChoiceYesClick(event) {
    event.stopPropagation()
    clearAllCanvas()
    warning_window_disabled(warningWindow)
    shadow_disabled(shadow)
}

function onChoiceNoClick() {
    playClickSound()
    warning_window_disabled(warningWindow)
    shadow_disabled(shadow)
}

function onDownloadClick() {
    playClickSound()
}

function shadowCloseWindows() {
    auto_build_panel_disabled(buildModePanel)
    warning_window_disabled(warningWindow)
    shadow_disabled(shadow)
    settingsButton.classList.remove("active")
    settingsPanel.classList.remove("open")
}

function toggleButton() {
    if (!settingsButton.classList.contains("active")) {
    playClickSound()
    shadow_enabled(shadow)
    settingsButton.classList.add("active")
    settingsButton.classList.add("settings-open")
    settingsPanel.classList.add("open")
    } else {
        playClickSound()
        shadow_disabled(shadow)
        settingsButton.classList.remove("active")
        settingsPanel.classList.remove("open")
    }
}

buildMode.addEventListener("click", autoBuild)
shadow.addEventListener("click", shadowCloseWindows)
buildButton.addEventListener("click", onButtonClick)
download.addEventListener("click", onDownloadClick)
cabel.addEventListener("click", onCabelClick)
erase.addEventListener("click", onEraseClick)
newCanvas.addEventListener("click", onNewCanvasClick)
choiceYes.addEventListener("click", onChoiceYesClick)
choiceNo.addEventListener("click", onChoiceNoClick)
settingsButton.addEventListener("click", toggleButton)


settingsPanel.addEventListener("transitionend", () => {
    if (!settingsPanel.classList.contains("open")) {
        settingsButton.classList.remove("settings-open")
    }
})

sounds.addEventListener("change", () => {
    playClickSound()
})

animations.addEventListener("change", () => {
    playClickSound()
    document.body.classList.toggle("no-animations", onAnimationsDisabled())
})

// So it's gonna be forever
// Or it's gonna go down in flames?
// You can tell me when it's over
// If the high was worth the pain
// Got a long list of ex-lovers
// They'll tell you I'm insane
// Cause you know I love the players
// And you love the game