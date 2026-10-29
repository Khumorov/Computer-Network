import {
    wires
} from "./wires.js"

import {
    scale
} from "./world.js"

import {
    viewport
} from "./elements.js"

import {
    getWireLabelPositions
} from "./helpers.js"

const LABEL_FONT = "20px sans-serif"
const measureContext = document.createElement("canvas").getContext("2d")

measureContext.font = LABEL_FONT

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

        const label = node.querySelector(".node-label")
        const textWidth = label ? measureContext.measureText(label.textContent).width : 0
        const centerX = left + node.offsetWidth / 2
        minX = Math.min(minX, left, centerX - textWidth / 2)
        maxX = Math.max(maxX, left + node.offsetWidth, centerX + textWidth / 2)
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

// Почему не html2canvas? ̶л̶и̶ч̶н̶о̶ ̶д̶л̶я̶ ̶э̶т̶о̶г̶о̶ ̶п̶р̶о̶е̶к̶т̶а̶ ̶о̶н̶ ̶н̶е̶ ̶р̶а̶б̶о̶ч̶и̶й̶
// Здесь был немного другой комментарии, надеюсь вы его не найдете
// На самом деле меня не устроило то что он качал в каком то размытом виде
// Ещё там кабели баговались, короче нахер разбираться когда можно написать целый модуль для этого (:

export async function downloadImage() {
    const bounds = getNetworkBounds()
    if (!bounds) return

    const pixelRatio = window.devicePixelRatio || 1

    const exportCanvas = document.createElement("canvas")
    exportCanvas.width = bounds.width * pixelRatio
    exportCanvas.height = bounds.height * pixelRatio

    const context = exportCanvas.getContext("2d")
    context.scale(pixelRatio, pixelRatio)

    context.fillStyle = "white"
    context.fillRect(0, 0, bounds.width, bounds.height)

    context.strokeStyle = "black"
    context.lineWidth = 4
    wires.forEach(wire => {
        context.beginPath()
        context.moveTo(
            wire.line.x1.baseVal.value - bounds.x,
            wire.line.y1.baseVal.value - bounds.y
        )

        context.lineTo(
            wire.line.x2.baseVal.value - bounds.x,
            wire.line.y2.baseVal.value - bounds.y
        )
        context.stroke()

        if (!wire.titleTop && !wire.titleBottom) return

        const start = {
            x: wire.line.x1.baseVal.value - bounds.x,
            y: wire.line.y1.baseVal.value - bounds.y
        }

        const end = {
            x: wire.line.x2.baseVal.value - bounds.x,
            y: wire.line.y2.baseVal.value - bounds.y
        }

        const { angle, top, bottom } = getWireLabelPositions(start, end)
        const radians = angle * (Math.PI / 180)

        context.save()
        context.fillStyle = "black"
        context.font = "14px sans-serif"
        context.textAlign = "center"
        context.textBaseline = "alphabetic"

        if (wire.titleTop) {
            context.save()
            context.translate(top.x, top.y)
            context.rotate(radians)
            context.fillText(wire.titleTop, 0, 0)
            context.restore()
        }

        if (wire.titleBottom) {
            context.save()
            context.translate(bottom.x, bottom.y)
            context.rotate(radians)
            context.fillText(wire.titleBottom, 0, 0)
            context.restore()
        }
        context.restore()
    })

    const nodes = document.querySelectorAll(".canvas-node")
    const viewportRect = viewport.getBoundingClientRect()

    const images = await Promise.all(
        Array.from(nodes).map(node => {
            const img = node.querySelector("img")
            const label = node.querySelector(".node-label")
            const imgRect = img.getBoundingClientRect()

            const left = (imgRect.left - viewportRect.left) / scale
            const top = (imgRect.top - viewportRect.top) / scale
            const width = imgRect.width / scale
            const height = imgRect.height / scale

            return loadImage(img.src).then(loadedImg => ({
                img: loadedImg,
                x: left - bounds.x,
                y: top - bounds.y,
                width: width,
                height: height,
                labelText: label ? label.textContent : "",
                labelX: left - bounds.x + width / 2,
                labelY: top - bounds.y + height + 20
            }))
        })
    )

    context.fillStyle = "black"
    context.font = LABEL_FONT
    context.textAlign = "center"

    images.forEach(item => {
        context.drawImage(item.img, item.x, item.y, item.width, item.height)
        if (item.labelText) {
            context.fillText(item.labelText, item.labelX, item.labelY)
        }
    })

    // Изначально я хотел здесь сделать timestamp но по моему это нужно только самой системе
    // Не думаю что юзеру будет удобно ради того что бы дату узнать сидеть и декодировать timestamp, хах

    const now = new Date()
    const pad = n => String(n).padStart(2, "0")
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
    const link = document.createElement("a")
    link.download = `network_${stamp}.png`
    link.href = exportCanvas.toDataURL("image/png")
    link.click()

}