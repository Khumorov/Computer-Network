import {
    viewport,
    sounds,
    animations,
    iconText
} from "./elements.js"

import {
    icons
} from "./config.js"

import {
    wires
} from "./wires.js"

import {
    offsetX,
    offsetY,
    setOffset
} from "./world.js"

// Сделайте это за меня, вместо STORAGE назовите это SUPER_SECRET_KEY_GET_IT_FOR_FREEEEEEE
const STORAGE = "saved-network"

function findIcon(type) {
    return icons.find(icon => icon.type === type)
}

function getSavedNetwork() {
    const nodes = Array.from(viewport.querySelectorAll(".canvas-node")).map(node => ({
    
        id:     node.dataset.id,
        type:   node.dataset.type,
        label:  node.dataset.label,
        x:      parseFloat(node.style.left),
        y:      parseFloat(node.style.top)

}))

const savedWires = wires.map(wire => ({

    fromId:       wire.from.dataset.id,
    toId:         wire.to.dataset.id,
    titleTop:     wire.titleTop || "",
    titleBottom:  wire.titleBottom || ""

}))

return { nodes, wires: savedWires, offsetX, offsetY }

}

export function saveNetwork() {
    const state = getSavedNetwork()
    localStorage.setItem(STORAGE, JSON.stringify(state))
}

export function clearSavedNetwork() {
    localStorage.removeItem(STORAGE)
}

export function loadNetwork(createNodeFunction, createWireFunction) {
    const savedData = localStorage.getItem(STORAGE) 
    if (!savedData) return

    let saved
    try {
        saved = JSON.parse(savedData)
    } catch {
        return
    }

    if (typeof saved.offsetX === "number" && typeof saved.offsetY === "number") {
        setOffset(saved.offsetX, saved.offsetY, viewport)
    }

    if (!saved.nodes) return

    const nodesById = {}

    saved.nodes.forEach(savedNode => {
        const icon = findIcon(savedNode.type)
        if (!icon) return
        const node = createNodeFunction(

            icon.iconPath, 
            savedNode.x + 30, 
            savedNode.y + 30,
            null, 
            savedNode.type, 
            savedNode.label, 
            savedNode.id

        )

        nodesById[savedNode.id] = node
    
    })

    if (saved.wires) {
        const images = Object.values(nodesById)
        .map(node => node.querySelector("img"))
        .filter(img => img && !img.complete)

        const waitForImages = images.length
        ? Promise.all(images.map(img => new Promise(resolve => {
            img.addEventListener("load", resolve, { once: true })
            img.addEventListener("error", resolve, { once: true })
        })))
        :Promise.resolve()

        waitForImages.then(() => {
            saved.wires.forEach(savedWire => {
                const fromNode = nodesById[savedWire.fromId]
                const toNode = nodesById[savedWire.toId]

                if (fromNode && toNode) {
                    createWireFunction(fromNode, toNode, savedWire.titleTop || "", savedWire.titleBottom || "")
                }
            })
        })
    }
}


 const SETTINGS_STORAGE = "settings"

 export function saveSettings() {
    const settings = {

        sound: sounds.checked,
        animations: animations.checked,
        iconText: iconText.checked

    }
    localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings))
 }

 export function loadSettings() {
    const savedData = localStorage.getItem(SETTINGS_STORAGE)
    if (!savedData) return

    let saved
    try {
        saved = JSON.parse(savedData)
    } catch {
        return
    }

    sounds.checked = saved.sound
    animations.checked = saved.animations
    iconText.checked = saved.iconText
 }