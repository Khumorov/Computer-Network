// Т.к у нас всего один файл и это схема, то думаю встроенный модуль лучше отдельной библиотеки
// Типо крутой формат файла, на деле просто gz сжатая инфа

import {
    icons
} from "./config.js"
const FILE_FORMAT   = ".cnet"
const FILE_NAME     = "schema" + FILE_FORMAT
const MIME          = "application/gzip"
const MAX_NODES     = 1000
const MAX_WIRES     = 3000
const MAX_ID        = 30
const MAX_LABEL     = 50
const MAX_TITLE     = 50
const MAX_COORD     = 20000

const NODE_TYPES = new Set(icons.map(icon => icon.type))

async function gzip(text) {
    const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"))
    return await new Response(stream).blob()
}

async function gunzip(buffer) {
    const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream("gzip"))
    return await new Response(stream).text()
}

function isGzip(bytes) {
    return bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b
}

function isNumber(value) {
    return typeof value === "number" && Number.isFinite(value)
}

function cleanText(value, maxLength, errorMessage) {
    if (value === undefined) return ""
    if (typeof value !== "string") throw new Error(errorMessage)

    const text = value.trim()

    if (text.length > maxLength) throw new Error(errorMessage)
        return text
}

// За весь проект этот модуль первый где я пытался делать нормальную обработку ошибок, хах
// if, if, if, if, if, if

export function validateNetwork(data) {
    if (!data || typeof data !== "object") {
        throw new Error("Файл не содержит схему")
    }
    if (!Array.isArray(data.nodes)) {
        throw new Error("В файле нет списка устройств")
    }

    if (data.nodes.length > MAX_NODES) {
        throw new Error("Не жирно будет?")
    }

    const ids = new Set()

    data.nodes.forEach(node => {
        if (!node || typeof node.id !== "string" || !NODE_TYPES.has(node.type) ||
            !isNumber(node.x) || !isNumber(node.y)) {
            throw new Error("Повреждено описание устройства")
        }

        if (node.id.length > MAX_ID) {
            throw new Error("id длинее твоего языка")
        }

        if (ids.has(node.id)) {
            throw new Error("Повторяющийся id устройства")
        }

        ids.add(node.id)

        if (Math.abs(node.x) > MAX_COORD || Math.abs(node.y) > MAX_COORD) {
            throw new Error("Координаты устройства вне допустимого диапазона")
        }

        node.label = cleanText(node.label, MAX_LABEL, "Даже не пытайся")

    })

        if (data.wires === undefined) data.wires = []

        if (!Array.isArray(data.wires)) {
            throw new Error("Повреждён список кабелей")
        }

        if (data.wires.length > MAX_WIRES) {
            throw new Error("Кабели конечно бесплатные но ты тоже давай не это самое")
        }

        data.wires.forEach(wire => {
            if (!wire || typeof wire.fromId !== "string" || typeof wire.toId !== "string") {
                throw new Error("Повреждено описание кабеля")
            }

            if (!ids.has(wire.fromId) || !ids.has(wire.toId)) {
                throw new Error("Кабель ведёт к несуществующему устройству")
            }

            if (wire.fromId === wire.toId) {
                throw new Error("Кабель соединяет устройство само с собой")
            }

            wire.titleTop = cleanText(wire.titleTop, MAX_TITLE, "Некорректная подпись кабеля")
            wire.titleBottom = cleanText(wire.titleBottom, MAX_TITLE, "Некорректная подпись кабеля")
        })
    return data
}

// state - объект сети (то, что лежит в localStorage)

export async function exportNetwork(state) {

    // Json я если что специально не форматирую и не потому что не хочу чтобы оно там красиво лежало, а что бы чуть больше места сэкономить, никто же все равно не посмотрит, да?

    const json = JSON.stringify(state)

    if (typeof window.showSaveFilePicker === "function") {
        let handle
        try {
            handle = await window.showSaveFilePicker({
                suggestedName: FILE_NAME,
                types: [{
                    description: "Схема сети",
                    accept: { [MIME]: [FILE_FORMAT] }
                }]
            })
        } catch (error) {
            if (error.name === "AbortError") return false
            throw error
        }

        const writable = await handle.createWritable()
        await writable.write(await gzip(json))
        await writable.close()
        return true
    }

    const blob = await gzip(json)
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = FILE_NAME
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
    return true
}

export function pickNetworkFile() {
    return new Promise(resolve => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = FILE_FORMAT

        input.addEventListener("change", () => resolve(input.files[0] || null), { once: true })
        input.addEventListener("cancel", () => resolve(null), { once: true })

        input.click()
    })
}

export async function readNetworkFile(file) {
    const bytes = new Uint8Array(await file.arrayBuffer())

    if (!isGzip(bytes)) {
        throw new Error(`Это не файл схемы ${FILE_FORMAT}`)
    }

    let data
    try {
        data = JSON.parse(await gunzip(bytes))
    } catch {
        throw new Error("Файл повреждён или это не схема")
    }
    return validateNetwork(data)
}