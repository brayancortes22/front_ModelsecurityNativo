/**
 * Servicio de caché para reducir peticiones repetitivas a la API
 * Almacena resultados de peticiones HTTP para evitar llamadas innecesarias
 */

const CacheService = {
    // Almacén de datos en caché con timestamp
    cache: {},
    
    // Tiempo de caducidad predeterminado en milisegundos (5 minutos)
    defaultExpiry: 5 * 60 * 1000,
    
    /**
     * Obtiene datos de la caché o ejecuta la función para obtenerlos
     * @param {string} key - Clave para identificar los datos en caché
     * @param {Function} fetchFunction - Función que obtiene los datos si no están en caché
     * @param {number} expiryTime - Tiempo en ms hasta que los datos expiren (opcional)
     * @returns {Promise<any>} - Los datos solicitados
     */
    async get(key, fetchFunction, expiryTime = this.defaultExpiry) {
        // Verificar si ya existe en caché y no ha expirado
        const cachedData = this.cache[key];
        const now = Date.now();
        
        if (cachedData && (now - cachedData.timestamp < expiryTime)) {
            console.log(`Usando datos en caché para: ${key}`);
            return cachedData.data;
        }
        
        // Si no está en caché o expiró, obtener datos frescos
        console.log(`Obteniendo datos frescos para: ${key}`);
        try {
            const data = await fetchFunction();
            
            // Guardar en caché
            this.cache[key] = {
                data: data,
                timestamp: now
            };
            
            return data;
        } catch (error) {
            // Si hay un error y tenemos datos en caché, los usamos aunque estén expirados
            if (cachedData) {
                console.warn(`Error al obtener datos frescos, usando caché expirada para: ${key}`);
                return cachedData.data;
            }
            throw error;
        }
    },
    
    /**
     * Invalida una entrada de la caché
     * @param {string} key - Clave de la caché a invalidar
     */
    invalidate(key) {
        if (this.cache[key]) {
            delete this.cache[key];
            console.log(`Caché invalidada para: ${key}`);
        }
    },
    
    /**
     * Invalida todas las entradas de la caché
     */
    invalidateAll() {
        this.cache = {};
        console.log('Caché completamente invalidada');
    }
};