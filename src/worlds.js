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

var name = ""
export function load(nam) {
    name = nam
    if (world_nams.includes(nam)) {
        const [sd, dat] = worlds[nam]
        gen.setSeed(sd)
    } else {
        gen.randSeed()
        save()
    }
}
export function save() {
    if (name != "") {
        worlds[name] = [gen.seed, []]
        gen_nams()
    }
    localStorage.setItem('worlds', JSON.stringify(worlds));
}
