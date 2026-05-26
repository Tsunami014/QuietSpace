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
export var last = ""
const lastName = "\x01Last world"
export function world_idx() {
    if (name == lastName && last != "" && last != lastName) {
        return world_nams.indexOf(last)
    }
    return world_nams.indexOf(name || lastName)
}

export function mknew() {
    name = ""
    last = ""
    gen.randSeed()
    phys.teleport(0, 0)
    save()
}

export function load(nam) {
    name = nam
    if (nam != "" && nam != lastName) last = nam;
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

export function rename(oldnam, newnam, set) {
    if (!newnam) return false;
    if (world_nams.indexOf(newnam) === undefined &&
        !confirm(`A world with the name '${newnam}' already exists, are you sure you want to override it?`)) {
            return false;
    }
    if (set || name == oldnam) {
        name = newnam
    } else {
        worlds[newnam] = worlds[oldnam]
    }
    delete worlds[oldnam]
    save()
    return true;
}
export function delworld(nam) {
    if (!confirm(`Are you sure you want to delete '${nam}'? It will be gone forever! (A long time!)`)) {
        return false;
    }
    if (name == nam) name = "";
    delete worlds[nam]
    save()
    return true;
}
