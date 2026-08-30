import {
    cabel,
    canvas
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
    line.setAttribute("stroke-width", "2")
    return line
}

function getNodeCenter(node, canvasRect) {
    const nodeRect = node.getBoundingClientRect()
    return {
        x: nodeRect.left - canvasRect.left + nodeRect.width / 2,
        y: nodeRect.top - canvasRect.top + nodeRect.height / 2
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
        previewLine.setAttribute("stroke-dasharray", "4")
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
    svg.appendChild(line)

    wires.push({ line, from: fromNode, to: toNode })
    saveNetwork()
}

export function updateWiresForNode(node) {
    const canvasRect = canvas.getBoundingClientRect()

    wires.forEach(wire => {
        if (wire.from === node) {
            const start = getNodeCenter(node, canvasRect)
            wire.line.setAttribute("x1", start.x)
            wire.line.setAttribute("y1", start.y)
        }
        if (wire.to === node) {
            const end = getNodeCenter(node, canvasRect)
            wire.line.setAttribute("x2", end.x)
            wire.line.setAttribute("y2", end.y)
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
            wires.splice(i, 1)
        }
    }
  saveNetwork()
}