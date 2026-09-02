import {
    wires
} from "./wires.js"

import {
    offsetX,
    offsetY
} from "./world.js"

import {
    canvas
} from "./elements.js"

function getNetworkBounds() {
    const nodes = document.querySelectorAll(".canvas-node")
    if (nodes.length === 0) return null

    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity

    nodes.forEach(node => {
        const left = parseFloat(node.style.left)
        const top = parseFloat(node.style.top)
        minX = Math.min(minX, left)
        minY = Math.min(minY, top)
        maxX = Math.max(maxX, left + node.offsetWidth)
        maxY = Math.max(maxY, top + node.offsetHeight)
    })

    const padding = 80
    return {
        x: minX - padding,
        y: minY - padding,
        width: (maxX - minX) + padding * 2,
        height: (maxY - minY) + padding * 2
    }
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })
}

// Почему не html2canvas? лично для этого проекта он не рабочий

export async function downloadImage() {
    const bounds = getNetworkBounds()
    if (!bounds) return

    const scale = window.devicePixelRatio || 1

    const exportCanvas = document.createElement("canvas")
    exportCanvas.width = bounds.width * scale
    exportCanvas.height = bounds.height * scale

    const context = exportCanvas.getContext("2d")
    context.scale(scale, scale)

    context.fillStyle = "white"
    context.fillRect(0, 0, bounds.width, bounds.height)

    context.strokeStyle = "black"
    context.lineWidth = 4
    wires.forEach(wire => {
        context.beginPath()
        context.moveTo(
            wire.line.x1.baseVal.value - bounds.x - offsetX,
            wire.line.y1.baseVal.value - bounds.y - offsetY
        )

        context.lineTo(
            wire.line.x2.baseVal.value - bounds.x - offsetX,
            wire.line.y2.baseVal.value - bounds.y - offsetY
        )
        context.stroke()
    })

    const nodes = document.querySelectorAll(".canvas-node")
    const canvasRect = canvas.getBoundingClientRect()

    const images = await Promise.all(
        Array.from(nodes).map(node => {
            const img = node.querySelector("img")
            const label = node.querySelector(".node-label")
            const imgRect = img.getBoundingClientRect()

            return loadImage(img.src).then(loadedImg => ({
                img: loadedImg,
                x: imgRect.left - canvasRect.left - bounds.x - offsetX,
                y: imgRect.top - canvasRect.top - bounds.y - offsetY,
                width: imgRect.width,
                height: imgRect.height,
                labelText: label ? label.textContent : "",
                labelX: (imgRect.left - canvasRect.left - bounds.x - offsetX) + imgRect.width / 2,
                labelY: (imgRect.top - canvasRect.top - bounds.y - offsetY) + imgRect.height + 20
            }))
        })
    )

    context.fillStyle = "black"
    context.font = "20px sans-serif"
    context.textAlign = "center"

    images.forEach(item => {
        context.drawImage(item.img, item.x, item.y, item.width, item.height)
        if (item.labelText) {
            context.fillText(item.labelText, item.labelX, item.labelY)
        }
    })

    const link = document.createElement("a")
    link.download = "network.png"
    link.href = exportCanvas.toDataURL("image/png")
    link.click()

}