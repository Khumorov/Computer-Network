import {
    cabel,
    erase
} from "./elements.js"

export function enableDrag(element, canvas) {

    element.style.cursor = "grab"

    element.addEventListener("mousedown", (event) => {

    if (cabel.classList.contains("active") || erase.classList.contains("active")) {
        return
    }

    const iconClone = document.createElement("img")
    iconClone.src = element.querySelector("img").src
    iconClone.style.position = "fixed"
    iconClone.style.width = "25px"
    iconClone.style.height = "25px"
    iconClone.style.pointerEvents = "none"
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
            const x = upEvent.clientX - canvasRect.left
            const y = upEvent.clientY - canvasRect.top

            createCanvasNode(iconClone.src, x, y, canvas)
        }
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    })
}

function createCanvasNode(iconSrc, x, y, canvas) {
    const node = document.createElement("div")
    node.className = "canvas-node"
    node.style.position = "absolute"

    node.style.left = `${x - 30}px`
    node.style.top = `${y - 30}px`

    const img = document.createElement("img")
    img.src = iconSrc

    node.appendChild(img)
    canvas.appendChild(node)

    makeNodeDraggable(node, canvas)
}



function makeNodeDraggable(node, canvas) {
    node.style.cursor = "grab"
    node.style.pointerEvents = "auto"

    node.addEventListener("mousedown", (event) => {

    if (cabel.classList.contains("active") || erase.classList.contains("active")) {
        return
    }

        event.stopPropagation()

        const canvasRect = canvas.getBoundingClientRect()
        const nodeRect = node.getBoundingClientRect()

        const shiftX = event.clientX - nodeRect.left
        const shiftY = event.clientY - nodeRect.top

        node.style.cursor = "grabbing"

        function onMouseMove(moveEvent) {
            let newX = moveEvent.clientX - canvasRect.left - shiftX
            let newY = moveEvent.clientY - canvasRect.top - shiftY

            node.style.left = `${newX}px`
            node.style.top = `${newY}px`
        }

        function onMouseUp() {
            node.style.cursor = "grab"
            document.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("mouseup", onMouseUp)
        }

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)
    })
}