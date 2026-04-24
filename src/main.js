const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


const pbhei = 40
const pbgap = 4
function drawLoading(progress) {
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
    const max = 6;
    var i = 0
    function nxt() {
        if (i >= max) {
            console.warn("Went over maximum by "+i)
        } else {
            drawLoading((++i)/max)
        }
    }
    file = await import("/src/tiles.js")
    nxt()
    await file.load(nxt)

    if (i < max-1) {
        console.warn("Went under maximum by "+(max-i))
    }
}


var x = 0
var y = 0

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, 10, 10)
}

// Keep keys in a dict
const keys = {}
window.addEventListener('keydown', (e) => keys[e.key] = true)
window.addEventListener('keyup', (e) => keys[e.key] = false)

function tick() {
    var oldx = x
    var oldy = y
    if (keys['ArrowUp']) {
        y -= 2
    }
    if (keys['ArrowDown']) {
        y += 2
    }
    if (keys['ArrowLeft']) {
        x -= 1
    }
    if (keys['ArrowRight']) {
        x += 1
    }
    if (oldx != x || oldy != y) {
        draw()
    }
}


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

async function init() {
    resizeCanvas();
    drawLoading(0);
    await load()
    draw()
    setInterval(tick, 17)
}
init()
