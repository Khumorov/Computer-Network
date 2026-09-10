// Короче, код сложнее читать стало, добавлю немного комментариев

import {
    cabel,
    viewport,
    erase,
    eraseSound,
    shadow,
    wireTitleWindow,
    wireWindowFirstInput,
    wireWindowSecondInput,
    wireWindowSaveButton
} from "./elements.js"

import {
    shadow_enabled,
    shadow_disabled,
    wire_window_enabled,
    wire_window_disabled
} from "./helpers.js"

import {
    saveNetwork
} from "./storage.js"

import {
    getWireLabelPositions
} from "./helpers.js"

export const wires = []

let svgLayer = null
let activeWireForTitle = null

function getSvgLayer() {
    if (svgLayer) return svgLayer

    svgLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svgLayer.classList.add("cabelSvg")

    viewport.appendChild(svgLayer)
    return svgLayer
}

function closeWireTitleWindow() {
    wire_window_disabled(wireTitleWindow)
    shadow_disabled(shadow)
}

function shadowCloseWindows() {
    wire_window_disabled(wireTitleWindow)
    shadow_disabled(shadow)
}

function openWireTitleWindow() {
    wire_window_enabled(wireTitleWindow)
    shadow_enabled(shadow)
}

function shadowOpenWindow() {
    wire_window_enabled(wireTitleWindow)
    shadow_enabled(shadow)
}

function onWireWindowSaveButtonClick() {

    if (activeWireForTitle) {
        activeWireForTitle.titleTop = wireWindowFirstInput.value
        activeWireForTitle.titleBottom = wireWindowSecondInput.value
        activeWireForTitle.labelTop.textContent = activeWireForTitle.titleTop
        activeWireForTitle.labelBottom.textContent = activeWireForTitle.titleBottom
        saveNetwork()
    }

    activeWireForTitle = null
    shadowCloseWindows()
    closeWireTitleWindow()
}

function createWireLabel() {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
    text.setAttribute("text-anchor", "middle")
    text.setAttribute("font-size", "14")
    text.setAttribute("font-family", "sans-serif")
    text.setAttribute("fill", "black")
    text.style.userSelect = "none"
    text.style.pointerEvents = "none"
    return text
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

function getNodeCenter(node, viewportRect) {
    const nodeRect = node.getBoundingClientRect()
    return {
        x: nodeRect.left - viewportRect.left + nodeRect.width / 2,
        y: nodeRect.top - viewportRect.top + nodeRect.height / 2
    }
  }

  const NODE_TRIM_RADIUS = 50

  function getTrimmedEndpoints(fromNode, toNode, viewportRect) {
    const start = getNodeCenter(fromNode, viewportRect)
    const end = getNodeCenter(toNode, viewportRect)

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

function positionWireLabels(wire, viewportRect) {
    const start = getNodeCenter(wire.from, viewportRect)
    const end = getNodeCenter(wire.to, viewportRect)

    const { angle, top, bottom } = getWireLabelPositions(start, end)

    wire.labelTop.setAttribute("x", top.x)
    wire.labelTop.setAttribute("y", top.y)
    wire.labelTop.setAttribute("transform", `rotate(${angle}, ${top.x}, ${top.y})`)

    wire.labelBottom.setAttribute("x", bottom.x)
    wire.labelBottom.setAttribute("y", bottom.y)
    wire.labelBottom.setAttribute("transform", `rotate(${angle}, ${bottom.x}, ${bottom.y})`)
}

export function enableWireDrag(node) {
    node.addEventListener("mousedown", (event) => {
        if (!cabel.classList.contains("active")) return

        event.stopPropagation()

        const viewportRect = viewport.getBoundingClientRect()
        const svg = getSvgLayer()
        const start = getNodeCenter(node, viewportRect)

        const previewLine = createLine(start.x, start.y, start.x, start.y)
        previewLine.setAttribute("stroke-dasharray", "8")
        svg.appendChild(previewLine)

        function onMouseMove(upEvent) {
            const x = upEvent.clientX - viewportRect.left
            const y = upEvent.clientY - viewportRect.top
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

function wireExist(nodeA, nodeB) {
    return wires.some(wire =>
    (wire.from === nodeA && wire.to === nodeB) ||
    (wire.from === nodeB && wire.to === nodeA)
    )
}

export function createWire(fromNode, toNode, titleTop = "", titleBottom = "") {
    if (fromNode === toNode) return
    if (wireExist(fromNode, toNode)) return
    const viewportRect = viewport.getBoundingClientRect()
    const svg = getSvgLayer()

    const start = getNodeCenter(fromNode, viewportRect)
    const end = getNodeCenter(toNode, viewportRect)

    const line = createLine(start.x, start.y, end.x, end.y)

    const { start: hitboxStart, end: hitboxEnd } = getTrimmedEndpoints(fromNode, toNode, viewportRect)
    const hitboxLine = createHitboxLine(hitboxStart.x, hitboxStart.y, hitboxEnd.x, hitboxEnd.y)

    const labelTop = createWireLabel()
    const labelBottom = createWireLabel()
    labelTop.textContent = titleTop
    labelBottom.textContent = titleBottom

    svg.appendChild(line)
    svg.appendChild(hitboxLine)
    svg.appendChild(labelTop)
    svg.appendChild(labelBottom)

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
        } else {
            activeWireForTitle = wire
            wireWindowFirstInput.value = wire.titleTop
            wireWindowSecondInput.value = wire.titleBottom
            openWireTitleWindow()
        }
    })

    const wire = {
        line,
        hitboxLine,
        labelTop,
        labelBottom,
        from: fromNode,
        to: toNode,
        titleTop,
        titleBottom
    }

    positionWireLabels(wire, viewportRect)
    wires.push(wire)
    saveNetwork()
}

export function updateWiresForNode(node) {
    const viewportRect = viewport.getBoundingClientRect()

    wires.forEach(wire => {
        if (wire.from === node || wire.to === node) {

            const start = getNodeCenter(wire.from, viewportRect)
            const end = getNodeCenter(wire.to, viewportRect)

            wire.line.setAttribute("x1", start.x)
            wire.line.setAttribute("y1", start.y)
            wire.line.setAttribute("x2", end.x)
            wire.line.setAttribute("y2", end.y)

            const { start: hitboxStart, end: hitboxEnd } = getTrimmedEndpoints(wire.from, wire.to, viewportRect)

            wire.hitboxLine.setAttribute("x1", hitboxStart.x)
            wire.hitboxLine.setAttribute("y1", hitboxStart.y)
            wire.hitboxLine.setAttribute("x2", hitboxEnd.x)
            wire.hitboxLine.setAttribute("y2", hitboxEnd.y)

            positionWireLabels(wire, viewportRect)

        }
    })
}

export function updateAllWires() {
    const viewportRect = viewport.getBoundingClientRect()

    wires.forEach(wire => {

        const start = getNodeCenter(wire.from, viewportRect)
        const end = getNodeCenter(wire.to, viewportRect)

        wire.line.setAttribute("x1", start.x)
        wire.line.setAttribute("y1", start.y)
        wire.line.setAttribute("x2", end.x)
        wire.line.setAttribute("y2", end.y)

        const { start: hitboxStart, end: hitboxEnd } = getTrimmedEndpoints(wire.from, wire.to, viewportRect)

        wire.hitboxLine.setAttribute("x1", hitboxStart.x)
        wire.hitboxLine.setAttribute("y1", hitboxStart.y)
        wire.hitboxLine.setAttribute("x2", hitboxEnd.x)
        wire.hitboxLine.setAttribute("y2", hitboxEnd.y)

        positionWireLabels(wire, viewportRect)

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
            wires[i].labelTop.remove()
            wires[i].labelBottom.remove()
            wires.splice(i, 1)
        }
    }
  saveNetwork()
}

shadow.addEventListener("click", shadowCloseWindows)

wireWindowSaveButton.addEventListener("click", onWireWindowSaveButtonClick)