const canvas1 = document.getElementById('canvas1');
const canvas2 = document.getElementById('canvas2');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');

var tiles;
var player;
var gen;
var draw;
var phys;

const pbhei = 40
const pbgap = 4
function drawLoading(progress) {
    resizeCanvas();
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
    const max = 14;
    var i = 0
    function nxt() {
        if (i <= max) {
            drawLoading(i/max)
        }
        i++
    }
    draw = await import("/src/draw.js")
    nxt()
    tiles = await import("/src/tiles.js")
    resizeCanvas(true) // Does this while loading! (needs draw to be loaded)
    nxt()
    phys = await import("/src/phys.js")
    nxt()
    await tiles.load(nxt)
    gen = await import("/src/gen.js")
    nxt()
    player = await import("/src/player.js")
    nxt()
    await player.load(nxt)
    nxt()

    if (i > max) {
        console.warn("Went over maximum by "+(i-max)+" (should be "+i+")")
    } else if (i < max) {
        console.warn("Went under maximum by "+(max-i)+" (should be "+i+")")
    }
}

// Keep keys in a dict
const keys = {}
window.addEventListener('keydown', (e) => keys[e.key] = true)
window.addEventListener('keyup', (e) => keys[e.key] = false)

function tick() {
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
    gen.cacheTick()
    var dx = 0
    var dy = 0
    if (keys['p']) console.log(phys.getUnder())
    if (keys['ArrowUp'])    dy = -1
    if (keys['ArrowDown'])  dy = 1
    if (keys['ArrowLeft'])  dx = -1
    if (keys['ArrowRight']) dx = 1
    let ox = phys.x
    if (phys.tick(dx, dy)) {
        if (ox != phys.x) player.setdir(Math.sign(phys.x-ox))
        draw.draw()
    }
    requestAnimationFrame(tick)
}


function resizeCanvas(setTles) {
    canvas1.width = window.innerWidth;
    canvas1.height = window.innerHeight;
    canvas2.width = window.innerWidth;
    canvas2.height = window.innerHeight;
    if (setTles) {
        const [cols, rows, blk, hblk, qblk] = draw.getSizes()
        tiles.setTleSzes(blk, hblk)
    }
}

async function init() {
    resizeCanvas();
    drawLoading(0);
    await load()
    draw.draw()
    player.show()
    requestAnimationFrame(tick)
}
init()
