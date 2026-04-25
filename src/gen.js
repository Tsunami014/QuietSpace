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
        const [val, args] = _cache[i]
        if (val === args) return resp;
    }
    if (_cache.length+1 > mxCacheLen) {
        _cache = _cache.slice(1)
    }
    const out = hash(...args)
    _cache.push([args, out])
    return out
}


export function getTile(x, y) {
    const realpos = [x-Math.floor((y-1)/2), x+Math.floor(y/2)]
    const tl = [Math.floor(realpos[0]/10), Math.floor(realpos[1]/10)]
    const loclpos = [realpos[0]%10, realpos[1]%10]
    if (loclpos[0] == 0) {
        if (loclpos[1] == 0) {
            return "road_dash_ENSW"
        }
        return "road_dash_EW"
    } else if (loclpos[1] == 0) {
        return "road_dash_NS"
    }
    if (cachehash(0, ...tl)%2 == 0) {
        return "footpath"
    } else {
        return "grass"
    }
}
