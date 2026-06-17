window.canvas1 = document.getElementById('canvas1');
window.canvas2 = document.getElementById('canvas2');
window.ctx1 = canvas1.getContext('2d');
window.ctx2 = canvas2.getContext('2d');

const pbhei = 40
const pbgap = 4
function drawLoading(progress) {
    resizeCanvas(false);
    const pbx = canvas1.width / 6
    const pby = (canvas1.height - pbhei) / 2;
    const pbwid = canvas1.width - pbx*2;
    ctx2.clearRect(0, 0, canvas1.width, canvas1.height); 
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height); 
    ctx1.font = "bold 32px sans serif";
    ctx1.fillStyle = "black";
    ctx1.fillText("Loading...", pbx, pby-32-2);
    ctx1.beginPath()
    ctx1.roundRect(pbx, pby, pbwid, pbhei, pbhei/3);
    ctx1.fill();
    ctx1.fillStyle = 'cornflowerblue';
    const nhei = pbhei - pbgap*2
    ctx1.beginPath()
    ctx1.roundRect(pbx+pbgap, pby+pbgap, (pbwid - pbgap*2)*progress, nhei, nhei/3);
    ctx1.fill();
}

async function load() {
    const max = 22;
    var i = 0
    function nxt() {
        if (i <= max) {
            drawLoading(i/max)
        }
        i++
    }
    window.worlds = await import("./worlds.js")
    nxt()
    window.worlds.load_all()
    nxt()
    window.bkpk = await import("./bkpk.js")
    bkpk.init()
    nxt()
    window.fsel = await import("./filesel.js")
    nxt()
    await fsel.init(nxt)
    nxt()
    window.draw = await import("./draw.js")
    nxt()
    window.tiles = await import("./tiles.js")
    resizeCanvas(true) // Does this while loading! (needs draw to be loaded)
    nxt()
    window.phys = await import("./phys.js")
    nxt()
    await tiles.load(nxt)
    nxt()
    window.gen = await import("./gen.js")
    gen.randSeed()
    nxt()
    window.player = await import("./player.js")
    nxt()
    await player.load(nxt)
    nxt()
    window.mouse = await import("./mouse.js")
    nxt()
    worlds.loadLast()

    if (i > max) {
        console.warn("Went over maximum by "+(i-max)+" (should be "+i+")")
    } else if (i < max) {
        console.warn("Went under maximum by "+(max-i)+" (should be "+i+")")
    }
    fsel.toggle()
}

// Keep keys in a dict
const keys = {}
window.addEventListener('keydown', (e) => keys[e.key] = true)
window.addEventListener('keyup', (e) => keys[e.key] = false)

var lastks = {}
var lastpress = 0
window.nxttog = false // So the menu can vanish at the same time as world load
function tick() {
    if (nxttog || (keys['Escape'] && !lastks['Escape'])) {
        nxttog = false
        if (bkpk.open) {
            bkpk.toggle()
        } else if (!worlds.eximporting) {
            fsel.toggle()
        }
    }

    var dx = 0
    if (keys['ArrowLeft'] || keys['a']) dx = -1
    if (keys['ArrowRight'] || keys['d']) dx = 1

    if (fsel.fselopen) {
        if (canvas1.width !== window.innerWidth || canvas1.height !== window.innerHeight) {
            resizeCanvas(true)
        }
        var ddx = 0;
        if (keys['PageDown'] || keys['Home']) ddx = -2;
        if (keys['PageUp'] || keys['End']) ddx = 2;
        if (ddx == 0 && lastpress != dx) ddx = dx;
        fsel.press(ddx, keys, lastks)
        lastpress = dx
        lastks = { ...keys }

        draw.draw()
        requestAnimationFrame(tick)
        return
    }
    lastpress = dx

    mouse.press(keys, lastks)
    if (keys['r'] && !lastks['r']) bkpk.toggle()
    if (bkpk.open && keys['f'] && !lastks['f']) bkpk.select()
    if (bkpk.open) {
        if (canvas1.width !== window.innerWidth || canvas1.height !== window.innerHeight) {
            resizeCanvas(true)
        }
        bkpk.draw()
        lastks = { ...keys }
        draw.draw()
        requestAnimationFrame(tick)
        return
    }
    lastks = { ...keys }
    if (canvas1.width !== window.innerWidth || canvas1.height !== window.innerHeight) {
        resizeCanvas(true)
        if (!tiles.pixel) {
            player.hide()
            tiles.reloadAllTiles().then(()=>{
                draw.draw()
                player.show()
                tick()
            })
            return
        }
        draw.draw()
    }
    var dy = 0
    if (keys['ArrowUp'] || keys['w']) dy = -1
    if (keys['ArrowDown'] || keys['s']) dy = 1
    let ox = phys.x
    if (phys.tick(dx, dy)) {
        mouse.move()
        gen.cacheTick()
        if (ox != phys.x) player.setdir(Math.sign(phys.x-ox))
    }
    draw.draw()
    requestAnimationFrame(tick)
}


function resizeCanvas(loaded) {
    canvas1.width = window.innerWidth;
    canvas1.height = window.innerHeight;
    canvas2.width = window.innerWidth;
    canvas2.height = window.innerHeight;
    if (loaded) {
        const [cols, rows, blk, hblk, qblk] = draw.getSizes()
        bkpk.resized(blk)
        fsel.redraw()
        tiles.setTleSzes(blk, hblk)
    }
}

async function init() {
    resizeCanvas(false);
    drawLoading(0);
    await load()
    draw.draw()
    player.show()
    requestAnimationFrame(tick)
}
init()
