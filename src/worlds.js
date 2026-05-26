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
const lastName = "\x01Last world"
export function world_idx() {
    return world_nams.indexOf(name || lastName)
}

export function mknew() {
    name = ""
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
    const out = [gen.seed, phys.x, phys.y, gen.getPlaced()]
    worlds[lastName] = out
    if (name) worlds[name] = out
    localStorage.setItem('worlds', JSON.stringify(worlds));
    gen_nams()
}

export function rename(oldnam, newnam) {
    if (!newnam) return false;
    if (world_nams.indexOf(newnam) === undefined &&
        !confirm(`A world with the name '${newnam}' already exists, are you sure you want to override it?`)) {
            return false;
    }
    if (name == oldnam) {
        name = newnam
    } else {
        worlds[newnam] = worlds[oldnam]
    }
    delete worlds[oldnam]
    save()
    return true;
}
