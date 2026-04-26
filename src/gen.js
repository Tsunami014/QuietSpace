const seed = 42

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

var _cache = []
const mxCacheLen = 10
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


const plotSze = 10
export function getTile(x, y) {
    const realx = x-Math.floor((y-1)/2)
    const realy = x+Math.floor(y/2)
    const loclx = ((realx%plotSze)+plotSze) % plotSze
    const locly = ((realy%plotSze)+plotSze) % plotSze
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
    const tlx = Math.floor(realx/plotSze)
    const tly = Math.floor(realy/plotSze)
    if (cachehash(0, tlx, tly)%2 == 0) {
        return "footpath"
    } else {
        return "grass"
    }
}
