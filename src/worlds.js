export var worlds;
export var world_nams;

function gen_nams() {
    world_nams = Object.keys(worlds).sort()
}

export function load_all() {
    const dat = localStorage.getItem('worlds');
    if (dat) {
        worlds = JSON.parse(dat)
    } else {
        worlds = {}
    }
    gen_nams()
}

var name = "!Last world"
export function world_idx() {
    return world_nams.indexOf(name)
}

export function mknew() {
    name = "!Last world"
    gen.randSeed()
    phys.teleport(0, 0)
    save()
}

export function load(nam) {
    name = nam
    if (world_nams.includes(nam)) {
        const [sd, x, y, placeds] = worlds[nam]
        gen.setSeed(sd)
        phys.teleport(x, y)
        gen.setPlaced(placeds)
    } else {
        gen.randSeed()
        save()
    }
}
export function save() {
    worlds[name] = [gen.seed, phys.x, phys.y, gen.getPlaced()]
    localStorage.setItem('worlds', JSON.stringify(worlds));
    gen_nams()
}
