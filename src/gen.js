export var seed

// My custom randomness - an amalgamation of various algorithms
const _hashStrs = [0x27D4EB2D, 0x9E3779B1, 0x165667B1, 0xC2B2AE35, 0x85EBCA6B]
export function hash(...args) {
    let h = seed
    for (let i = 0; i < args.length; i++) {
        h ^= args[i] * _hashStrs[i]
    }
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    let out = (h | 0).toString()
    if (out.length < 3) {
        return h | 0
    }
    let hlen = Math.floor(out.length/3)
    return parseInt(out.slice(hlen, hlen*2))
}

var x_wonk
var y_wonk
var islandSze
var outerRingSze
var sandDist
export function setSeed(nseed) {
    // Sets the seed... and some other variables
    seed = nseed
    x_wonk = (hash(-999, 0)%10) / 20 + 0.5
    y_wonk = (hash(-999, 1)%10) / 20 + 0.5
    islandSze = 1000
    for (let i = 0; i < 10; i++) {
        islandSze += hash(-999, 2, i)%200
    }
    outerRingSze = (hash(-999, 3)%6) + 6
    outerRingSze *= outerRingSze

    sandDist = islandSze-outerRingSze*4

    tleCache = new Map();
}
/// Pick a new random seed
export function randSeed() {
    setSeed(Math.round(Math.random()*(10**15)))
    placeds = new Map();
}
/// Use a default seed
export function defltSeed() {
    setSeed(42) // Has a good array of stuff around the start
    placeds = new Map();
}

const cache = new Map();
const mxCacheLen = 18;
/// Cache the hash function for *speed*
function cachehash(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) { return cache.get(key); }
    const out = hash(...args);
    if (cache.size >= mxCacheLen) {
        cache.delete(cache.keys().next().value); // remove oldest
    }

    cache.set(key, out);
    return out;
}


/// Get a tile inside a plot based on the plot type
function getTileInner(tlx, tly, loclx, locly, pltsze, rx, ry, sandy) {
    if (sandy > 2) {
        return ["sand"]
    }
    if (sandy > 0) {
        if (sandy > 1 && cachehash(0, tlx, tly)%2 == 0) {
            return ["grass"]
        }
        return ["sand"]
    }
    const blocktyp = cachehash(0, tlx, tly)%3
    if (blocktyp == 0) {
        return ["footpath"]
    } else if (blocktyp == 1) {
        return ["grass"]
    } else {
        if (cachehash(1, rx, ry)%10 == 0) {
            return ["grass", "tree"]
        } return ["grass"]
    }
}
const plotSze = 10+5
const dirs = [
    [0, 0], [1, 0], [1, 1], [0, 1]
]
/// Converts a position to a 'real position' (much easier for making nicer patterns with)
export function realPos(x, y) {
    return [x-Math.floor((y-1)/2),
        -(x+Math.floor(y/2))]
}

// Gets a tile at a position. This also checks if a tile has been placed and uses that instead.

export function getTile(x, y) {
    return getRealTile(...realPos(x, y))
}
var placeds = new Map();
var tleCache = new Map();
export function getRealTile(rx, ry) {
    const key = rx + ',' + ry;
    if (placeds.has(key)) return placeds.get(key);
    if (tleCache.has(key)) return tleCache.get(key);
    const val = _getRealTile(rx, ry);
    tleCache.set(key, val);
    return val;
}

export function placeTile(rx, ry, t) {
    // Don't place a collision block under the player
    if (phys.isCollider(t)) {
        const [rpx, rpy] = phys.realPlayerPos()
        if (rx == rpx && ry == rpy) return;
    }
    const key = rx + ',' + ry;
    if (tiles.decor.includes(t)) {
        const ot = getRealTile(rx, ry)[0]
        if (tiles.nodecor.includes(ot)) return;
        if (ot) placeds.set(key, [ot, t])
        else placeds.set(key, [t])
    } else {
        placeds.set(key, [t])
    }
    tleCache = new Map()
}
export function getPlaced() {
    return Object.fromEntries(placeds)
}
export function setPlaced(nps) {
    placeds = new Map(Object.entries(nps))
}

let lastClear = 0
const clearEvery = 5
/// Clear the cache *just enough* to be efficient
export function cacheTick() {
    if (++lastClear > clearEvery) {
        tleCache = new Map()
    }
}

/// Generates a tile!
function _getRealTile(realx, realy) {
    // If outside the 'island', output water (or sand)
    let dist = realx*realx*x_wonk + realy*realy*y_wonk
    if (dist > islandSze) {
        if (dist > islandSze+outerRingSze+1) {
            return ["water"]
        }
        return ["sand"]
    }

    // Determine local position in a plot
    const loclx = ((realx%plotSze)+plotSze) % plotSze
    const locly = ((realy%plotSze)+plotSze) % plotSze
    const tlx = Math.floor(realx/plotSze)
    const tly = Math.floor(realy/plotSze)
    const sandy = dirs.reduce((prev, nxt)=>{
        let x = (tlx+nxt[0])*plotSze
        let y = (tly+nxt[1])*plotSze
        let dist = x*x*x_wonk + y*y*y_wonk
        return prev + (dist > sandDist? 1:0)
    }, 0)

    // Handle borders
    if (sandy > 1 && (
        loclx <= 2 || locly <= 2 || loclx >= plotSze-2 || locly >= plotSze-2
    )) {
        if (loclx == 0 && locly == 0) return ["footpath"]
        if ((loclx == 0 || locly == 0) && cachehash(0, tlx, tly)%2 == 0) {
            return ["footpath"]
        }
        return ["sand"]
    }

    if (loclx <= 1 || locly <= 1 || loclx == plotSze-1 || locly == plotSze-1) {
        var decor = []
        if (loclx != 0 && locly != 0 && hash(1, realx, realy)%200 == 0) {
            decor.push("cone")
        }
        if (loclx == 0 || locly == 0) {
            return ["road_dash", ...decor]
        }
        return ["road", ...decor]
    }
    if (loclx == 2 || locly == 2 || loclx >= plotSze-2 || locly >= plotSze-2) {
        return ["footpath"]
    }
    // Get the inner tile
    return getTileInner(tlx, tly, loclx+3, locly+3, plotSze-5, realx, realy, sandy)
}
