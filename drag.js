import {
    cabel,
    erase,
    choiceYes,
    eraseSound,
    pageFlipSound,
    viewport,
} from "./elements.js"

import {
    enableWireDrag,
    updateWiresForNode,
    removeWiresForNode
} from "./wires.js"

import {
    saveNetwork
} from "./storage.js"

let nodeIdCounter = 0

export function enableDrag(element, canvas, type, label) {

    element.style.cursor = "grab"

    element.addEventListener("mousedown", (event) => {

    if (cabel.classList.contains("active") || erase.classList.contains("active")) {
        return
    }

    const iconClone = document.createElement("img")
    iconClone.src = element.querySelector("img").src
    iconClone.classList.add("icon-clone")
    document.body.appendChild(iconClone)
    element.style.cursor = "grabbing";

    function iconCloneMoveTo(x, y) {
    iconClone.style.left = `${x - 17}px`
    iconClone.style.top = `${y - 17}px`
    }

    iconCloneMoveTo(event.clientX, event.clientY)

    function onMouseMove(moveEvent) {
        iconCloneMoveTo(moveEvent.clientX, moveEvent.clientY)
    }

    function onMouseUp(upEvent) {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)

        element.style.cursor = "grab"
        iconClone.remove()

        const canvasRect = canvas.getBoundingClientRect()
        const dropInsideCanvas =
        upEvent.clientX >= canvasRect.left &&
        upEvent.clientX <= canvasRect.right &&
        upEvent.clientY >= canvasRect.top &&
        upEvent.clientY <= canvasRect.bottom

        if (dropInsideCanvas) {

            const viewportRect = viewport.getBoundingClientRect()
            const x = upEvent.clientX - viewportRect.left
            const y = upEvent.clientY - viewportRect.top

            createCanvasNode(iconClone.src, x, y, canvas, type, label)
        }
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    })
}

export function renumberType(type) {
    const sameTypeNodes = viewport.querySelectorAll(`.canvas-node[data-type="${type}"]`)
    sameTypeNodes.forEach((node, index) => {
        const label = node.querySelector(".node-label")
        if (label) {
            label.textContent = `${node.dataset.label} ${index + 1}`
    }
  })
}

export function createCanvasNode(iconSrc, x, y, canvas, type, label, activeId) {
    const node = document.createElement("div")
    node.className = "canvas-node"
    node.style.position = "absolute"
    node.dataset.type = type
    node.dataset.label = label

    if (activeId) {
        node.dataset.id = activeId
        const math = /^node-(\d+)$/.exec(activeId)
        if (math) {
            nodeIdCounter = Math.max(nodeIdCounter, parseInt(math[1], 10))
        }
        } else {
            node.dataset.id = activeId || `node-${++nodeIdCounter}`
        }

    node.style.left = `${x - 30}px`
    node.style.top = `${y - 30}px`

    const img = document.createElement("img")
    img.src = iconSrc

    const nodeLabel = document.createElement("div")
    nodeLabel.className = "node-label"

    node.appendChild(img)
    node.appendChild(nodeLabel)
    viewport.appendChild(node)

    renumberType(type)

    if (!activeId) {
    saveNetwork()
    }

    node.addEventListener("mousedown", (event) => {
        if (erase.classList.contains("active")) {
            event.stopPropagation()
            removeWiresForNode(node)
            node.remove()
            eraseSound.currentTime = 0
            eraseSound.play()
            renumberType(type)
            saveNetwork()
        }
    })

    enableWireDrag(node, canvas)
    makeNodeDraggable(node, canvas)

    return node

}



function makeNodeDraggable(node, canvas) {
    node.style.cursor = "grab"
    node.style.pointerEvents = "auto"

    node.addEventListener("mousedown", (event) => {

    if (cabel.classList.contains("active") || erase.classList.contains("active")) {
        return
    }

        event.stopPropagation()

        const viewportRect = viewport.getBoundingClientRect()
        const nodeRect = node.getBoundingClientRect()

        const shiftX = event.clientX - nodeRect.left
        const shiftY = event.clientY - nodeRect.top

        node.style.cursor = "grabbing"

        function onMouseMove(moveEvent) {

            let newX = moveEvent.clientX - viewportRect.left - shiftX
            let newY = moveEvent.clientY - viewportRect.top - shiftY

            node.style.left = `${newX}px`
            node.style.top = `${newY}px`

            updateWiresForNode(node)
        }

        function onMouseUp() {
            node.style.cursor = "grab"
            document.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("mouseup", onMouseUp)
            saveNetwork()
        }

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)
    })
}