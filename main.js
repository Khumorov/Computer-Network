import {
    shadow,
    buildMode,
    buildModePanel,
    buildButton,
    download,
    importButton,
    exportButton,
    cabel,
    erase,
    newCanvas,
    warningWindow,
    choiceYes,
    choiceNo,
    warningWindowMainTitle,
    clickSound,
    completeSound,
    pageFlipSound,
    iconsContainer,
    canvas,
    viewport,
    settingsButton,
    settingsPanel,
    sounds,
    animations,
    iconText
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
    createCanvasNode,
    renumberAllTypes
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
    clearSavedNetwork,
    saveSettings,
    loadSettings,
    getSavedNetwork,
    applyNetwork
} from "./storage.js"

import {
    downloadImage
} from "./download.js"

import {
    exportNetwork,
    pickNetworkFile,
    readNetworkFile
} from "./schema.js"

let pendingAction = null

onSoundsMuted()
onAnimationsDisabled()
loadSettings()

document.body.classList.toggle("no-animations", onAnimationsDisabled())

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
    pendingAction = clearAllCanvas
    warningWindowMainTitle.textContent = "Вы точно хотите создать новый холст?"
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
    if (pendingAction) pendingAction()
    warning_window_disabled(warningWindow)
    shadow_disabled(shadow)
    pendingAction = null
}

function onChoiceNoClick() {
    playClickSound()
    warning_window_disabled(warningWindow)
    shadow_disabled(shadow)
    pendingAction = null
}

function onDownloadClick() {
    playClickSound()
    updateAllWires()
    downloadImage()
}

function shadowCloseWindows() {
    auto_build_panel_disabled(buildModePanel)
    warning_window_disabled(warningWindow)
    shadow_disabled(shadow)
    settingsButton.classList.remove("active")
    settingsButton.classList.remove("settings-open")
    settingsPanel.classList.remove("open")
    pendingAction = null
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

async function onExportButtonClick() {
    playClickSound()

    try {
        await exportNetwork(getSavedNetwork())
    } catch (error) {
        console.log("Не удалось сохранить файл: " + error.message)
    }
}

async function onImportButtonClick() {
    playClickSound()

    const file = await pickNetworkFile()
    if (!file) return

    let data
    try {
        data = await readNetworkFile(file)
    } catch (error) {
        console.log("Не удалось открыть файл: " + error.message)
        return
    }

    if (document.querySelector(".canvas-node")) {
        warningWindowMainTitle.textContent = "Вы точно хотите импортировать новый холст?"
        pendingAction = () => importNetwork(data)
        warning_window_enabled(warningWindow)
        shadow_enabled(shadow)
    } else {
        importNetwork(data)
    }
}

function importNetwork(data) {
    clearAllCanvas()
    applyNetwork(data, createCanvasNode, createWire).then(() => {
        saveNetwork()
    })
}

// buildMode.addEventListener("click", autoBuild)
shadow.addEventListener("click", shadowCloseWindows)
buildButton.addEventListener("click", onButtonClick)
download.addEventListener("click", onDownloadClick)
cabel.addEventListener("click", onCabelClick)
erase.addEventListener("click", onEraseClick)
newCanvas.addEventListener("click", onNewCanvasClick)
choiceYes.addEventListener("click", onChoiceYesClick)
choiceNo.addEventListener("click", onChoiceNoClick)
settingsButton.addEventListener("click", toggleButton)
importButton.addEventListener("click", onImportButtonClick)
exportButton.addEventListener("click", onExportButtonClick)


settingsPanel.addEventListener("transitionend", () => {
    if (!settingsPanel.classList.contains("open")) {
        settingsButton.classList.remove("settings-open")
    }
})

sounds.addEventListener("change", () => {
    saveSettings()
    playClickSound()
})

animations.addEventListener("change", () => {
    saveSettings()
    playClickSound()
    document.body.classList.toggle("no-animations", onAnimationsDisabled())
})

iconText.addEventListener("change", () => {
    saveSettings()
    playClickSound()
    renumberAllTypes()
    updateAllWires()
    requestAnimationFrame(updateAllWires)
})

// Не менее крутая пасхалка, название трека найдите сами ( ͡° ͜ʖ ͡°)

// So it's gonna be forever
// Or it's gonna go down in flames?
// You can tell me when it's over
// If the high was worth the pain
// Got a long list of ex-lovers
// They'll tell you I'm insane
// Cause you know I love the players
// And you love the game