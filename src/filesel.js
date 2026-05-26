export var fselopen = true
var contnr; var inncontnr;
var page1; var page2; var pageconts
var width; var height
var pagenum = 0

var aftms; var befms; var nowms
const marks = [
    [1, null],
    [2, null]
]

export async function init(nxt) {
    const jrnlstr = await (await fetch("./assets/journal.svg")).text()
    nxt()
    const markstr = await (await fetch("./assets/mark.svg")).text()
    nxt()
    const parser = new DOMParser()

    const markDoc = parser.parseFromString(markstr, 'image/svg+xml')
    marks.forEach(m=>{
        m[1] = markDoc.documentElement.cloneNode(true)
        m[1].onclick = ()=>{
            pagenum = m[0]
            redraw()
        }
    })
    aftms = document.createElement("div")
    aftms.className = "marks"
    aftms.style.right = "55%"
    befms = document.createElement("div")
    befms.className = "marks"
    nowms = document.createElement("div")
    nowms.id = "nowmarks"

    const jrnlDoc = parser.parseFromString(jrnlstr, 'image/svg+xml')
    contnr = document.getElementById("fselout")
    inncontnr = document.getElementById("fsel")

    page1 = jrnlDoc.documentElement
    width = parseInt(page1.getAttribute("width")); height = parseInt(page1.getAttribute("height"))

    page2 = jrnlDoc.documentElement.cloneNode(true)
    pageconts = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
    pageconts.setAttribute("x", 0); pageconts.setAttribute("y", 0)
    page2.appendChild(pageconts)

    redraw()
    inncontnr.appendChild(aftms)
    inncontnr.appendChild(befms)
    inncontnr.appendChild(page1)
    inncontnr.appendChild(page2)
    inncontnr.appendChild(nowms)
}

export function toggle() {
    if (contnr.style.display == "") {
        contnr.style.display = "none"
        fselopen = false
    } else {
        contnr.style.display = ""
        fselopen = true
    }
}

var s;
function addText(txt, sze, hei) {
    const t = document.createElement('p')
    t.className = "txt"
    t.innerText = txt
    t.style.fontSize = sze*s/10+"px"
    t.style.lineHeight = t.style.fontSize
    t.style.top = hei+"%"
    pageconts.appendChild(t)
}
function drawPage() {
    if (pagenum == 0) {
        addText("Quiet Space", 30, 5)
        addText(
            "Left/right arrows to change page",
        10, 70)
    } else if (pagenum == 1) {
        addText("Controls", 25, 0)
        addText(
            "Escape to show/hide this menu\n\n"+
            "WSAD to move\n\n"+
            "Space/left click to pick block\n\n"+
            "Enter/right click to place block",
        8, 54)
    } else {
        addText("World name", 20, 4)
    }
}

function maxPage() {
    return worlds.worlds.length+1
}

const mainfill = "#753127"
const subfill = "#ECE4D5"
export function redraw() {
    if (canvas1.width < canvas1.height) {
        s = canvas1.width/width * 0.7
    } else {
        s = canvas1.height/height * 0.7
    }
    const transx = pagenum == 0 ? -50 : -70
    inncontnr.style.transform = `rotate(-1deg) scale(${s}) translate(${transx}%, -50%)`
    pageconts.setAttribute("width", width*s); pageconts.setAttribute("height", height*s)
    pageconts.setAttribute("transform", `scale(${1/s})`)

    befms.style.left = pagenum == 0 ? "0" : "50%"

    page1.style.fill = pagenum == 1 ? mainfill : subfill
    page1.style.display = pagenum == 0 ? "none" : ""
    page1.style.transform = pagenum == 0 ? "" : "translate(3%) scale(-1, 1)"
    page2.style.fill = pagenum == 0 ? mainfill : subfill

    pageconts.replaceChildren()
    drawPage()

    const mx = maxPage()
    marks.forEach(m=>{
        if (m[0] > mx) {
            m[1].remove()
            return;
        }
        if (m[0] == pagenum) {
            nowms.appendChild(m[1])
        } else if (m[0] > pagenum) {
            befms.appendChild(m[1])
        } else {
            aftms.appendChild(m[1])
        }
    })
}

export function press(dx) {
    pagenum += dx
    if (pagenum < 0) pagenum = 0
    const mx = maxPage()
    if (pagenum > mx) pagenum = mx
    redraw()
}

