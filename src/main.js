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
    file.load(nxt)
}


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawLoading(0);
    load()
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial draw
