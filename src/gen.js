var seed

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
function setSeed(nseed) {
    seed = nseed
    x_wonk = (hash(-999, 0)%10) / 20 + 0.5
    y_wonk = (hash(-999, 1)%10) / 20 + 0.5
    islandSze = 1000
    for (let i = 0; i < 10; i++) {
        islandSze += hash(-999, 2, i)%200
    }
    outerRingSze = (hash(-999, 3)%5) + 5
    outerRingSze *= outerRingSze

    sandDist = islandSze-outerRingSze*4
}
setSeed(42)

var _cache = []
const mxCacheLen = 15+3
function cachehash(...args) {
    for (let i = _cache.length-1; i >= 0; i--) {
        const [args2, val] = _cache[i]
        if (args === args2) return val;
    }
    if (_cache.length+1 > mxCacheLen) {
        _cache = _cache.slice(1)
    }
    const out = hash(...args)
    _cache.push([args, out])
    return out
}


function getTileInner(tlx, tly, loclx, locly, pltsze, sandy) {
    if (sandy > 2) {
        return "sand"
    }
    if (sandy > 0) {
        if (sandy > 1 && cachehash(0, tlx, tly)%2 == 0) {
            return "grass"
        }
        return "sand"
    }
    if (cachehash(0, tlx, tly)%2 == 0) {
        return "footpath"
    } else {
        return "grass"
    }
}
const plotSze = 10+5
const dirs = [
    [0, 0], [1, 0], [1, 1], [0, 1]
]
export function getTile(x, y) {
    const realx = x-Math.floor((y-1)/2)
    const realy = x+Math.floor(y/2)

    let dist = realx*realx*x_wonk + realy*realy*y_wonk
    if (dist > islandSze) {
        if (dist > islandSze+outerRingSze*3) {
            return "water_deep"
        }
        if (dist > islandSze+outerRingSze*2) {
            return "water_med"
        }
        if (dist > islandSze+outerRingSze) {
            return "water_light"
        }
        return "sand"
    }

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

    if (sandy > 1 && (
        loclx <= 2 || locly <= 2 || loclx >= plotSze-2 || locly >= plotSze-2
    )) {
        if (loclx == 0 && locly == 0) return "footpath"
        if ((loclx == 0 || locly == 0) && cachehash(-1, tlx, tly)%2 == 0) {
            return "footpath"
        }
        return "sand"
    }

    if (loclx == 0) {
        if (locly == 0) {
            return "road_dash_ENSW"
        }
        return "road_dash_EW"
    } else if (locly == 0) {
        return "road_dash_NS"
    }
    if (loclx == 1) {
        if (locly == 1) {
            return "footpath_E"
        }
        if (locly == plotSze-1) {
            return "footpath_N"
        }
        return "footpath_EN"
    } else if (locly == 1) {
        if (loclx == plotSze-1) {
            return "footpath_S"
        }
        return "footpath_ES"
    } else if (loclx == plotSze-1) {
        if (locly == plotSze-1) {
            return "footpath_W"
        }
        return "footpath_SW"
    } else if (locly == plotSze-1) {
        return "footpath_NW"
    }
    if (loclx == 2 || locly == 2 || loclx == plotSze-2 || locly == plotSze-2) {
        return "footpath"
    }
    return getTileInner(tlx, tly, loclx+3, locly+3, plotSze-5, sandy)
}
