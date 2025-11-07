import Redis from "ioredis";

const redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
});

const inFlight = new Map();
const isProd = process.env.NODE_ENV === "production";

/**
 * TTL dinámico por tipo de dato
 */
function getTTL(key) {
    if (!isProd) return 0; // sin expiración en local
    switch (true) {
        case key.startsWith("products"):
            return Number(process.env.CACHE_TTL_PRODUCTS) || 300; // 5 min
        case key.startsWith("users"):
            return Number(process.env.CACHE_TTL_USERS) || 600; // 10 min
        case key.startsWith("bills"):
            return Number(process.env.CACHE_TTL_BILLS) || 120; // 2 min
        case key.startsWith("reports"):
            return Number(process.env.CACHE_TTL_REPORTS) || 3600; // 1 hora
        case key.startsWith("shifts"):
            return Number(process.env.CACHE_TTL_SHIFTS) || 120;
        default:
            return Number(process.env.CACHE_TTL_DEFAULT) || 300;
    }
}

/**
 * Obtiene un valor del cache o lo genera si no existe
 */
export async function getOrSetCache(key, fetchFn, ttlSeconds = null) {
    try {
        const cached = await redisClient.get(key);
        if (cached) {
            console.log(`Cache hit → ${key}`);
            try {
                return JSON.parse(cached);
            } catch (err) {
                console.warn(`Cache corrupto, eliminando ${key}`, err);
                await redisClient.del(key);
            }
        }
    } catch (err) {
        console.error(`Redis GET error (${key})`, err);
    }

    if (inFlight.has(key)) return inFlight.get(key);

    console.log(`Cache miss → ${key}`);
    const promise = (async () => {
        const data = await fetchFn();
        try {
            if (data !== undefined) {
                const ttl = ttlSeconds !== null ? ttlSeconds : getTTL(key);
                if (ttl > 0) {
                    await redisClient.setex(key, ttl, JSON.stringify(data));
                } else {
                    await redisClient.set(key, JSON.stringify(data));
                }
            }
        } catch (err) {
            console.error(`Redis SET error (${key})`, err);
        }
        return data;
    })();

    inFlight.set(key, promise);
    try {
        return await promise;
    } finally {
        inFlight.delete(key);
    }
}

/**
 * Invalida una clave del cache
 */
export async function invalidateCache(key) {
    try {
        await redisClient.del(key);
        console.log(`Cache invalidado → ${key}`);
    } catch (err) {
        console.error(`Redis DEL error (${key})`, err);
    }
}

/**
 * Limpia todo el cache (solo para debugging o desarrollo)
 */
export async function clearAllCache() {
    try {
        await redisClient.flushall();
        console.log("Todo el cache Redis ha sido eliminado");
    } catch (err) {
        console.error("Redis FLUSH error", err);
    }
}

export { redisClient };
