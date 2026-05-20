const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var tiles;
var player;
var gen;
var draw;
var phys;

const pbhei = 40
const pbgap = 4
function drawLoading(progress) {
    resizeCanvas();
    const pbx = canvas.width / 6
    const pby = (canvas.height - pbhei) / 2;
    const pbwid = canvas.width - pbx*2;
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.font = "bold 32px sans serif";
    ctx.fillStyle = "black";
    ctx.fillText("Loading...", pbx, pby-32-2);
    ctx.beginPath()
    ctx.roundRect(pbx, pby, pbwid, pbhei, pbhei/3);
    ctx.fill();
    ctx.fillStyle = 'cornflowerblue';
    const nhei = pbhei - pbgap*2
    ctx.beginPath()
    ctx.roundRect(pbx+pbgap, pby+pbgap, (pbwid - pbgap*2)*progress, nhei, nhei/3);
    ctx.fill();
}

async function load() {
    const max = 12;
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
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
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
    var dx = 0
    var dy = 0
    if (keys['p']) console.log(phys.getUnder())
    if (keys['ArrowUp'])    dy = -1
    if (keys['ArrowDown'])  dy = 1
    if (keys['ArrowLeft'])  dx = -1
    if (keys['ArrowRight']) dx = 1
    if (dx != 0) player.setdir(dx)
    if (phys.tick(dx, dy)) {
        draw.draw()
    }
    requestAnimationFrame(tick)
}


function resizeCanvas(setTles) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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
