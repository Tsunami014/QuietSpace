export var fselopen
var contnr; var inncontnr;
var page1; var page2; var pageconts
var width; var height
var pagenum = 0

const extraPages = 2
function maxPage() {
    return worlds.world_nams.length+extraPages+2
}

var aftms; var befms; var nowms
const marks = [
    [1, "c", null],
    [extraPages+1, "n", null],
    [extraPages+2, "l", null]
]

const precache = [
  './assets/journal/bin.svg'
];

function avaliable() {
    return document.activeElement == document.body
}


export async function init(nxt) {
    // I ain't waiting for ts
    Promise.all(precache.map((src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = resolve;
            img.onerror = reject;
        });
    }));


    const jrnlstr = await (await fetch("./assets/journal/jrnl.svg")).text()
    nxt()
    const markstr = await (await fetch("./assets/journal/mark.svg")).text()
    nxt()
    const parser = new DOMParser()

    const markDoc = parser.parseFromString(markstr, 'image/svg+xml')
    marks.forEach(m=>{
        m[2] = markDoc.documentElement.cloneNode(true)
        m[2].onclick = ()=>{
            pagenum = m[0]
            redraw()
        }
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text")
        t.setAttribute("x", "40%"); t.setAttribute("y", "22.5%")
        t.setAttribute("font-weight", "bold")
        t.setAttribute("font-size", "1px")
        t.innerHTML = m[1].toUpperCase()
        m[2].appendChild(t)
    })
    aftms = document.createElement("div")
    aftms.className = "marks"
    befms = document.createElement("div")
    befms.className = "marks"
    nowms = document.createElement("div")
    nowms.id = "nowmarks"
    nowms.ondblclick = function() { press(-1, {}); }

    const jrnlDoc = parser.parseFromString(jrnlstr, 'image/svg+xml')
    contnr = document.getElementById("fselout")
    inncontnr = document.getElementById("fsel")

    page1 = jrnlDoc.documentElement
    page1.ondblclick = function() { press(-1, {}); }
    width = parseInt(page1.getAttribute("width")); height = parseInt(page1.getAttribute("height"))

    page2 = jrnlDoc.documentElement.cloneNode(true)
    pageconts = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
    pageconts.setAttribute("x", 0); pageconts.setAttribute("y", 0)
    pageconts.ondblclick = function() {
        if (!avaliable()) return;
        press(1, {})
    }
    page2.appendChild(pageconts)

    redraw()
    inncontnr.append(
        aftms, befms,
        page1, page2,
        nowms)
}

export function toggle() {
    if (contnr.style.display == "") {
        contnr.style.display = "none"
        fselopen = false
        if (pagenum == 2) {
            worlds.mknew()
        } else if (pagenum > 2 && pagenum < maxPage()) {
            worlds.load(worlds.world_nams[pagenum-extraPages-2])
        }
    } else {
        contnr.style.display = ""
        if (fselopen !== undefined) {
            worlds.save()
            pagenum = worlds.world_idx()+extraPages+2
        }
        fselopen = true
        redraw()
    }
}

var s; var startend;
function addText(txt, sze, hei) {
    const t = document.createElement('p')
    t.className = "txt"
    t.innerText = txt
    t.style.fontSize = sze*s/10+"px"
    t.style.lineHeight = t.style.fontSize
    t.style.top = hei+"%"
    if (startend) t.style.color = "wheat";
    pageconts.appendChild(t)
}
function drawPage() {
    if (pagenum == 0) {
        addText("Quiet Space", 30, 5)
        addText(
            "Left/right arrows or double click to change page",
        10, 70)
    } else if (pagenum == 1) {
        addText("Menu Controls", 25, 5)
        addText(
            "Escape to toggle this menu.\nIf a world page is selected (including last or new world), will load that world.\n\n"+
            "Bookmarks have letters on them, press the letter to go to that page.",
        8, 60)
    } else if (pagenum == 2) {
        addText("Game controls", 25, 5)
        addText(
            "WSAD or arrow keys to move\n\n"+
            "Mouse controls:\n"+
            "Left click/Space to pick a block (shown in the top right corner)\n"+
            "Right click/Enter to place block",
        8, 60)
    } else if (pagenum == extraPages+1) {
        addText("New world", 20, 4)
        addText(
            "This will generate a new world!",
        10, 48)
    } else if (pagenum < maxPage()) {
        const t = document.createElement('input')
        t.type = "text"
        t.className = "txt"
        let last = worlds.world_nams[pagenum-extraPages-2]
        t.value = last.replace("\x01", '')
        t.setAttribute("maxlength", 10)
        t.style.fontSize = 2*s+"px"
        t.style.lineHeight = t.style.fontSize
        t.onchange = function() {
            if (worlds.rename(last, t.value, true)) {
                last = t.value
                pagenum = worlds.world_idx()+extraPages+2
                redraw()
            } else {
                t.value = last.replace("\x01", '')
            }
        }
        pageconts.appendChild(t)
        if (pagenum == extraPages+2) {
            addText(
                "This gets overridden all the time, do not hope to store something permanently here!\n\n"+
                "To permanently store the current world, rename this!",
            8, 54)
        } else {
            const bin = document.createElement('img');
            bin.src = '/assets/journal/bin.svg';
            bin.className = "imgbtn"
            bin.style.bottom = "5%"; bin.style.right = "5%"
            bin.style.width = "20%"
            bin.onclick = function() {
                if (worlds.delworld(t.value)) {
                    pagenum = extraPages+2
                    redraw()
                }
            }
            pageconts.appendChild(bin)
        }
    } else {
        addText(
            "Made with <3 by Tsunami014",
        10, 50)
    }
}

const mainfill = "#753127"
const subfill = "#ECE4D5"
export function redraw() {
    const mx = maxPage()
    startend = pagenum == 0 || pagenum == mx
    if (canvas1.width < canvas1.height) {
        s = canvas1.width/width * 0.7
    } else {
        s = canvas1.height/height * 0.7
    }
    inncontnr.style.transform = `rotate(-1deg) scale(${s}) translate(${startend ? -50 : -70}%, -50%)`
    pageconts.setAttribute("width", width*s); pageconts.setAttribute("height", height*s)
    pageconts.setAttribute("transform", `scale(${1/s})`)

    aftms.style.right = pagenum == mx ? "15%" : "55%"
    befms.style.left = pagenum == 0 ? "0" : "55%"

    page1.style.fill = pagenum == 1 || pagenum == mx ? mainfill : subfill
    page1.style.display = startend ? "none" : ""
    page1.style.transform = startend ? "" : "translate(3%) scale(-1, 1)"
    page2.style.fill = startend ? mainfill : subfill

    pageconts.replaceChildren()
    drawPage()

    marks.forEach(m=>{
        if (m[0] > mx) {
            m[2].remove()
            return;
        }
        if (m[0] == pagenum) {
            nowms.appendChild(m[2])
        } else if (m[0] > pagenum) {
            befms.appendChild(m[2])
        } else {
            aftms.appendChild(m[2])
        }
    })
}

export function press(dx, keys) {
    if (!avaliable()) return;
    var topage = marks.find(it=>{ return keys[it[1]] })
    if (topage !== undefined) {
        pagenum = topage[0]
    } else if (dx != 0) {
        if (dx == -2) pagenum = 0;
        else if (dx == 2) pagenum = maxPage();
        else pagenum += dx;
    } else { return; }
    if (pagenum < 0) pagenum = 0
    const mx = maxPage()
    if (pagenum > mx) pagenum = mx
    redraw()
}

