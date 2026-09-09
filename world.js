export let offsetX = 0
export let offsetY = 0

export function setOffset(x, y, viewport) {
    offsetX = x
    offsetY = y

    if (viewport) {
        viewport.style.transform = `translate( ${offsetX}px, ${offsetY}px )`
    }
}

export function enablePan(canvas, viewport, onPan) {

    function applyTransform() {
        viewport.style.transform = `translate(${offsetX}px, ${offsetY}px)`
    }

    canvas.addEventListener("mousedown", (event) => {
        if (event.target !== canvas && event.target !== viewport) return

        canvas.classList.add("world")

        const startX = event.clientX
        const startY = event.clientY
        const startOffsetX = offsetX
        const startOffsetY = offsetY

        function onMouseMove(moveEvent) {
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY

            offsetX = startOffsetX + deltaX
            offsetY = startOffsetY + deltaY

            applyTransform()

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