import {
    shadow,
    buildMode,
    buildModePanel,
    buildButton,
    download,
    cabel,
    erase,
    clickSound
} from "./elements.js"

import {
    shadow_enabled,
    shadow_disabled,
    auto_build_panel_enabled,
    auto_build_panel_disabled,
    playClickSound,
    erase_enabled,
    erase_disabled,
    cabel_enabled,
    cabel_disabled
} from "./helpers.js"

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
    playClickSound()
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

function onDownloadClick() {
    playClickSound()
}

buildMode.addEventListener("click", autoBuild)
shadow.addEventListener("click", autoBuildClose)
buildButton.addEventListener("click", onButtonClick)
download.addEventListener("click", onDownloadClick)
cabel.addEventListener("click", onCabelClick)
erase.addEventListener("click", onEraseClick)