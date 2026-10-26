// Т.к у нас всего один файл и это схема, то думаю встроенный модуль лучше отдельной библиотеки
// Типо крутой формат файла, на деле просто gz сжатая инфа

const FILE_FORMAT = ".cnet"
const FILE_NAME = "schema" + FILE_FORMAT
const MIME = "application/gzip"

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

// За весь проект этот модуль первый где я пытался делать нормальную обработку ошибок, хах

export function validateNetwork(data) {
    if (!data || typeof data !== "object") {
        throw new Error("Файл не содержит схему")
    }
    if (!Array.isArray(data.nodes)) {
        throw new Error("В файле нет списка устройств")
    }

    data.nodes.forEach(node => {
        if (!node || typeof node.id !== "string" || typeof node.type !== "string" ||
            !isNumber(node.x) || !isNumber(node.y)) {
            throw new Error("Повреждено описание устройства")
        }
    })

    if (data.wires !== undefined && !Array.isArray(data.wires)) {
        throw new Error("Повреждён список кабелей")
    }
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

    // Не до конца понял что делает throw new Error, думаю походу дела разберусь

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