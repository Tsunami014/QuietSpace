const seed = 42

// My custom randomness - an amalgamation of various algorithms
const _hashStrs = [0x27D4EB2D, 0x9E3779B1, 0x165667B1, 0xC2B2AE35, 0x85EBCA6B]
function hash(...args) {
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

export function getTile(x, y) {
    if (hash(x, y)%2 == 0) {
        return "road"
    } else {
        return "road_cone"
    }
}
