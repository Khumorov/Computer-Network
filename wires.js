import {
    cabel,
    viewport
} from "./elements.js"

export const wires = []

const svg_offset = 5000

let svgLayer = null

function getSvgLayer() {
    if (svgLayer) return svgLayer

    svgLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svgLayer.classList.add("cabelSvg")

    viewport.appendChild(svgLayer)
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

function getNodeCenter(node, viewportRect) {
    const nodeRect = node.getBoundingClientRect()
    return {
        x: nodeRect.left - viewportRect.left + nodeRect.width / 2 + svg_offset,
        y: nodeRect.top - viewportRect.top + nodeRect.height / 2 + svg_offset
    }
  }

export function enableWireDrag(node) {
    node.addEventListener("mousedown", (event) => {
        if (!cabel.classList.contains("active")) return

        event.stopPropagation()

        const viewportRect = viewport.getBoundingClientRect()
        const svg = getSvgLayer()
        const start = getNodeCenter(node, viewportRect)

        const previewLine = createLine(start.x, start.y, start.x, start.y)
        previewLine.setAttribute("stroke-dasharray", "4")
        svg.appendChild(previewLine)

        function onMouseMove(upEvent) {
            const x = upEvent.clientX - viewportRect.left + svg_offset
            const y = upEvent.clientY - viewportRect.top + svg_offset
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

function createWire(fromNode, toNode) {
    const viewportRect = viewport.getBoundingClientRect()
    const svg = getSvgLayer()

    const start = getNodeCenter(fromNode, viewportRect)
    const end = getNodeCenter(toNode, viewportRect)

    const line = createLine(start.x, start.y, end.x, end.y)
    svg.appendChild(line)

    wires.push({ line, from: fromNode, to: toNode })
}

export function updateWiresForNode(node) {
    const viewportRect = viewport.getBoundingClientRect()

    wires.forEach(wire => {
        if (wire.from === node) {
            const start = getNodeCenter(node, viewportRect)
            wire.line.setAttribute("x1", start.x)
            wire.line.setAttribute("y1", start.y)
        }
        if (wire.to === node) {
            const end = getNodeCenter(node, viewportRect)
            wire.line.setAttribute("x2", end.x)
            wire.line.setAttribute("y2", end.y)
        }
    })
}

export function removeWiresForNode(node) {
    for (let i = wires.length - 1; i >= 0; i--) {
        if (wires[i].from === node || wires[i].to === node) {
            wires[i].line.remove()
            wires.splice(i, 1)
        }
    }
}