export let offsetX = 0
export let offsetY = 0
export let scale = 1
export const MIN_SCALE = 0.3
export const MAX_SCALE = 2

export function applyTransform(viewport) {
    viewport.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
}

export function setOffset(x, y, viewport) {
    offsetX = x
    offsetY = y

    if (viewport) {
        applyTransform(viewport)
    }
}

export function enablePan(canvas, viewport, onPan) {

    canvas.addEventListener("mousedown", (event) => {
        if (event.target !== canvas && event.target !== viewport) return

        canvas.classList.add("world")

        let lastX = event.clientX
        let lastY = event.clientY

        function onMouseMove(moveEvent) {
            offsetX += moveEvent.clientX - lastX
            offsetY += moveEvent.clientY - lastY

            lastX = moveEvent.clientX
            lastY = moveEvent.clientY

            applyTransform(viewport)

        }

        function onMouseUp() {
            canvas.classList.remove("world")
            document.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("mouseup", onMouseUp)
            if (onPan) onPan()
            viewport.dispatchEvent(new CustomEvent("world-pan_end"))
        }

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)
    })
}

export function setScale(value, viewport) {
    scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, value))

    if (viewport) {
        applyTransform(viewport)
    }
}

export function enableZoom(canvas, viewport) {
    let endTimer = null

    // Никогда в жизни не юзал wheel, да даже про существование его не знал..

    canvas.addEventListener("wheel", (event) => {
        event.preventDefault()

        const canvasRect = canvas.getBoundingClientRect()
        const cursorX = event.clientX - canvasRect.left
        const cursorY = event.clientY - canvasRect.top

        const worldX = (cursorX - offsetX) / scale
        const worldY = (cursorY - offsetY) / scale

        const delta = event.deltaMode === 1 ? event.deltaY * 33 : event.deltaY
        const oldScale = scale
        setScale(scale * Math.exp(-delta * 0.001))
        if (scale === oldScale) return

        offsetX = cursorX - worldX * scale
        offsetY = cursorY - worldY * scale
        applyTransform(viewport)

        clearTimeout(endTimer)
        endTimer = setTimeout(() => viewport.dispatchEvent(new CustomEvent("world-zoom_end")), 300)
    }, { passive: false })
}