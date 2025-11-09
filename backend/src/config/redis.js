import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
};


const redis = new Redis(redisConfig);

redis.on("connect", () => {
  console.log("Redis conectado exitosamente");
});

redis.on("error", (err) => {
  console.error("Error de conexión Redis:", err.message);
});

redis.on("ready", () => {
  console.log("Redis listo para usar");
});

/**
 * Guardar valor en caché con TTL
 * @param {string} key - Clave del caché
 * @param {*} value - Valor a guardar (será serializado a JSON)
 * @param {number} ttl - Tiempo de vida en segundos (default: 300)
 */
export async function setCache(key, value, ttl = 300) {
  try {
    const serialized = JSON.stringify(value);
    await redis.setex(key, ttl, serialized);
    console.log(`Cache SET: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error(`Error setting cache for ${key}:`, error);
    return false;
  }
}

/**
 * Obtener valor del caché
 * @param {string} key - Clave del caché
 * @returns {*} Valor deserializado o null si no existe
 */
export async function getCache(key) {
  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(` Cache HIT: ${key}`);
      return JSON.parse(cached);
    }
    console.log(`Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error(` Error getting cache for ${key}:`, error);
    return null;
  }
}

/**
 * Eliminar una clave del caché
 * @param {string} key - Clave a eliminar
 */
export async function deleteCache(key) {
  try {
    await redis.del(key);
    console.log(`Cache DELETE: ${key}`);
    return true;
  } catch (error) {
    console.error(`Error deleting cache for ${key}:`, error);
    return false;
  }
}

/**
 * Eliminar múltiples claves con patrón
 * @param {string} pattern - Patrón de búsqueda (ej: "users:*")
 */
export async function deleteCachePattern(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Cache DELETE PATTERN: ${pattern} (${keys.length} keys)`);
    }
    return keys.length;
  } catch (error) {
    console.error(`Error deleting cache pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Patrón Cache-Aside: Obtener del caché o de la fuente
 * @param {string} key - Clave del caché
 * @param {Function} fetchFunction - Función para obtener datos si no están en caché
 * @param {number} ttl - Tiempo de vida en segundos
 */
export async function getOrSetCache(key, fetchFunction, ttl = 300) {
  try {
    // Intentar obtener del caché
    const cached = await getCache(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - obtener de la fuente
    console.log(`Fetching data from source: ${key}`);
    const data = await fetchFunction();
    
    // Guardar en caché
    await setCache(key, data, ttl);
    
    return data;
  } catch (error) {
    console.error(`Error in getOrSetCache for ${key}:`, error);
    // Si falla Redis, intentar obtener directamente de la fuente
    return await fetchFunction();
  }
}

export { redis };
export default redis;