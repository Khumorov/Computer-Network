import {
    cabel,
    canvas,
    erase,
    eraseSound
} from "./elements.js"

import {
    saveNetwork
} from "./storage.js"

export const wires = []

let svgLayer = null

function getSvgLayer() {
    if (svgLayer) return svgLayer

    svgLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svgLayer.classList.add("cabelSvg")

    canvas.appendChild(svgLayer)
    return svgLayer
}

function createLine(startX, startY, endX, endY) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
    line.setAttribute("x1", startX)
    line.setAttribute("y1", startY)
    line.setAttribute("x2", endX)
    line.setAttribute("y2", endY)
    line.setAttribute("stroke", "black")
    line.setAttribute("stroke-width", "4")
    return line
}

function createHitboxLine(startX, startY, endX, endY) {
    const hitboxLine = document.createElementNS("http://www.w3.org/2000/svg", "line")
    hitboxLine.setAttribute("x1", startX)
    hitboxLine.setAttribute("y1", startY)
    hitboxLine.setAttribute("x2", endX)
    hitboxLine.setAttribute("y2", endY)
    hitboxLine.setAttribute("stroke", "transparent")
    hitboxLine.setAttribute("stroke-width", "25")
    return hitboxLine
}

function getNodeCenter(node, canvasRect) {
    const nodeRect = node.getBoundingClientRect()
    return {
        x: nodeRect.left - canvasRect.left + nodeRect.width / 2,
        y: nodeRect.top - canvasRect.top + nodeRect.height / 2
    }
  }

  const NODE_TRIM_RADIUS = 50

  function getTrimmedEndpoints(fromNode, toNode, canvasRect) {
    const start = getNodeCenter(fromNode, canvasRect)
    const end = getNodeCenter(toNode, canvasRect)

    const deltaX = end.x - start.x
    const deltaY = end.y - start.y
    const length = Math.hypot(deltaX, deltaY) || 1

    const directionX = deltaX / length
    const directionY = deltaY / length

    const trim = Math.min(NODE_TRIM_RADIUS, length / 2)

    return {
        start: {
            x: start.x + directionX * trim,
            y: start.y + directionY * trim
        },

        end: {
            x: end.x - directionX * trim,
            y: end.y - directionY * trim
        }
    }
}

export function enableWireDrag(node) {
    node.addEventListener("mousedown", (event) => {
        if (!cabel.classList.contains("active")) return

        event.stopPropagation()

        const canvasRect = canvas.getBoundingClientRect()
        const svg = getSvgLayer()
        const start = getNodeCenter(node, canvasRect)

        const previewLine = createLine(start.x, start.y, start.x, start.y)
        previewLine.setAttribute("stroke-dasharray", "8")
        svg.appendChild(previewLine)

        function onMouseMove(upEvent) {
            const x = upEvent.clientX - canvasRect.left
            const y = upEvent.clientY - canvasRect.top
            previewLine.setAttribute("x2", x)
            previewLine.setAttribute("y2", y)
        }

        function onMouseUp(upEvent) {
            document.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("mouseup", onMouseUp)
            previewLine.remove()

            const targetNode = document
            .elementsFromPoint(upEvent.clientX, upEvent.clientY)
            .find(element => element.classList.contains("canvas-node") && element !== node)

            if (targetNode) {
                createWire(node, targetNode)
            }
        }

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)
    })
}

export function createWire(fromNode, toNode) {
    const canvasRect = canvas.getBoundingClientRect()
    const svg = getSvgLayer()

    const start = getNodeCenter(fromNode, canvasRect)
    const end = getNodeCenter(toNode, canvasRect)

    const line = createLine(start.x, start.y, end.x, end.y)

    const { start: hitboxStart, end: hitboxEnd } = getTrimmedEndpoints(fromNode, toNode, canvasRect)
    const hitboxLine = createHitboxLine(hitboxStart.x, hitboxStart.y, hitboxEnd.x, hitboxEnd.y)

    svg.appendChild(line)
    svg.appendChild(hitboxLine)

    hitboxLine.style.pointerEvents = "stroke"
    hitboxLine.style.cursor = "pointer"

    hitboxLine.addEventListener("click", () => {
        if (erase.classList.contains("active")) {
        eraseSound.currentTime = 0
        eraseSound.play()
        line.remove()
        hitboxLine.remove()

        const index = wires.findIndex(wire => wire.line === line)
        if (index !== -1) wires.splice(index, 1)
        updateAllWires()
        saveNetwork()
        }
    })

    wires.push({ line, hitboxLine, from: fromNode, to: toNode })
    saveNetwork()
}

export function updateWiresForNode(node) {
    const canvasRect = canvas.getBoundingClientRect()

    wires.forEach(wire => {
        if (wire.from === node || wire.to === node) {

            const start = getNodeCenter(wire.from, canvasRect)
            const end = getNodeCenter(wire.to, canvasRect)

            wire.line.setAttribute("x1", start.x)
            wire.line.setAttribute("y1", start.y)
            wire.line.setAttribute("x2", end.x)
            wire.line.setAttribute("y2", end.y)

            const { start: hitboxStart, end: hitboxEnd } = getTrimmedEndpoints(wire.from, wire.to, canvasRect)

            wire.hitboxLine.setAttribute("x1", hitboxStart.x)
            wire.hitboxLine.setAttribute("y1", hitboxStart.y)
            wire.hitboxLine.setAttribute("x2", hitboxEnd.x)
            wire.hitboxLine.setAttribute("y2", hitboxEnd.y)

        }
    })
}

export function updateAllWires() {
    wires.forEach(wire => {
        updateWiresForNode(wire.from)
        updateWiresForNode(wire.to)
    })
}

window.addEventListener("resize", () => {
    updateAllWires()
})

export function removeWiresForNode(node) {
    for (let i = wires.length - 1; i >= 0; i--) {
        if (wires[i].from === node || wires[i].to === node) {
            wires[i].line.remove()
            wires[i].hitboxLine.remove()
            wires.splice(i, 1)
        }
    }
  saveNetwork()
}