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
    if (name == lastName && last != "" && last != lastName && world_nams.includes(last)) {
        return world_nams.indexOf(last)
    }
    return world_nams.indexOf(name || lastName)
}

export function mknew() {
    name = ""
    last = ""
    gen.randSeed()
    phys.teleport(0, 0)
    bkpk.loadFounds()
    mouse.setsel()
    save()
}

function remember(setlast) {
    const good = name != "" && name != lastName
    if (good) {
        if (setlast) last = name;
        localStorage.setItem('last', name)
    } else {
        localStorage.setItem('last', "")
    }
}

export function load(nam) {
    name = nam || lastName
    remember(true)
    if (world_nams.includes(name)) {
        const [sd, x, y, placeds, founds] = worlds[name]
        gen.setSeed(sd)
        phys.teleport(x, y)
        bkpk.loadFounds(founds)
        gen.setPlaced(placeds)
    } else if (name == "" || name == lastName) {
        gen.defltSeed()
        phys.teleport(0, 0)
        bkpk.loadFounds()
    } else {
        gen.randSeed()
        phys.teleport(0, 0)
        bkpk.loadFounds()
        save()
    }
    mouse.setsel()
}
export function loadLast() {
    const stored = localStorage.getItem('last') || ''
    load(stored && world_nams.includes(stored) ? stored : lastName)
}
export function save() {
    const out = [gen.seed, phys.x, phys.y, gen.getPlaced(), bkpk.founds]
    worlds[lastName] = out
    if (name) worlds[name] = out
    localStorage.setItem('worlds', JSON.stringify(worlds));
    remember(false)
    gen_nams()
}

export function genName(check) {
    const firsts = [
        "Mossy", "Fern", "Misty", "Dew", "Amber", "Hazel", "Ember",
        "Cedar", "Maple", "Coral", "Peach", "Stone", "Ivory", "Brook",
        "Sandy", "Ashen", "Oaken", "Vale", "Sunny", "Wispy",
    ];
    const fl = firsts.length
    const lasts = [
        "Nook", "Cove", "Glen", "Vale", "Glade", "Haven", "Bloom",
        "Mead", "Creek", "Ridge", "Heath", "Shore", "Knoll", "Wood",
        "Ford", "Mere", "Wick", "Weald", "Moor",
    ];
    const ll = lasts.length
    if (check && world_nams.length >= fl*ll) {
        throw new Error("Too many worlds to guarantee a unique name!");
    }
    return firsts[Math.floor(Math.random() * fl)] +
        lasts[Math.floor(Math.random() * ll)]
}

export function rename(oldnam, newnam, set) {
    if (!newnam) return false;
    if (world_nams.indexOf(newnam) != -1 &&
        !confirm(`A world with the name '${newnam}' already exists, are you sure you want to override it?`)) {
            return false;
    }
    if (set || name == oldnam) {
        name = newnam
        remember(true)
    } else {
        worlds[newnam] = worlds[oldnam]
    }
    if (last == oldnam) last = newnam;
    delete worlds[oldnam]
    save()
    return true;
}
export function delworld(nam) {
    if (!confirm(`Are you sure you want to delete '${nam}'? It will be gone forever! (A long time!)`)) {
        return false;
    }
    last = ""
    if (name == nam) {
        name = ""
        remember(false)
    }
    mouse.setsel()
    delete worlds[nam]
    save()
    return true;
}
export function copyworld(nam) {
    var nnam
    do {
        nnam = genName(true)
    } while (world_nams.indexOf(nnam) != -1);
    worlds[nnam] = worlds[nam || lastName]
    localStorage.setItem('worlds', JSON.stringify(worlds))
    gen_nams()
    name = nnam
    remember(true)
}

//!Begin encryption
const getKey = (pw) => window.crypto.subtle.importKey("raw", new TextEncoder().encode(pw.padEnd(32)), "AES-GCM", false, ["encrypt", "decrypt"]);

async function encrypt(text) {
    const key = await getKey(prompt("Encrypt with a password:")??"");
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const cipher = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text));
    return btoa(String.fromCharCode(...iv, ...new Uint8Array(cipher)));
}

async function decrypt(base64) {
    const key = await getKey(prompt("Password:")??"");
    const buf = new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
    const plain = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: buf.slice(0, 12) }, key, buf.slice(12));
    return new TextDecoder().decode(plain);
}
//!End encryption

export var eximporting = false
//!Usage encryption (async only required for it)
export async function expor(nam) {
    if (eximporting) return;
    eximporting = true

    //!Usage encryption
    const txt = await encrypt(JSON.stringify(worlds[nam || lastName]))
    const blob = new Blob([txt], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.className = "hidden"
    a.href = url;
    if (nam == lastName) {
        a.download = genName().padEnd(10)+"[LastWorld].world"
    } else {
        a.download = nam+".world";
    }
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    eximporting = false
}
export function impor(nam) {
    if (eximporting) return;
    eximporting = true

    const input = document.createElement('input')
    input.className = "hidden"
    input.type = 'file'
    input.multiple = true
    input.accept = '.world'
    document.body.appendChild(input);
    input.addEventListener('change', async (e) => {
        const contents = await Promise.all(
            [...input.files].map(async (file) => {
                try {
                    //!Usage encryption
                    const txt = await decrypt(await file.text())
                    return [JSON.parse(txt), file.name]
                } catch (err) {
                    //!Usage encryption (text)
                    alert(`Failed to read/parse file '${file.name}'! Did you get the wrong password?`);
                    return null
                }
            })
        );
        if (contents.map(it=>{
            if (it === null) return false;
            var [dat, newnam] = it
            if (newnam.endsWith(".world")) newnam = newnam.slice(0, -6)
            newnam = newnam.replace("\x01", "").slice(0, 10)
            if (world_nams.indexOf(newnam) != -1 &&
                !confirm(`A world with the name '${newnam}' already exists, are you sure you want to override it?`)) {
                    return false;
            }
            worlds[newnam] = dat
            name = newnam
            return true
        }).indexOf(true) != -1) {
            world_nams.push(name)
            load(name)
            save()
            fsel.goCurWorld()
            fsel.redraw()
        }
        document.body.removeChild(input);
        eximporting = false
    });
    input.addEventListener('cancel', () => {
        document.body.removeChild(input);
        eximporting = false
    });
    input.click();
}
