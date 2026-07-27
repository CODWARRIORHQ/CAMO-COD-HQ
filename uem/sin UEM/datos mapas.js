// datos.js
const baseMaps = [
            { title: "BOX MAP X", 
                author: "Rybs", 
                xp: "1.04", 
                recommended: true, 
                tags: ["TOTALMENTE OK"],
                url: "https://steamcommunity.com/sharedfiles/filedetails/?id=3409188400&searchtext=box+ma+x"
            },

            { title: "CHICK-FIL-A", 
                author: "Casaar", 
                xp: "N/A", 
                recommended: false, 
                tags: ["MAPAS ROTOS"],
                url: "https://steamcommunity.com/sharedfiles/filedetails/?id=3412671295&searchtext=chick"
            },

            { title: "LIGHTHOUSE", 
                author: "Figglebottom, DINGUS", 
                xp: "0.4", 
                recommended: false, 
                tags: ["TOTALMENTE OK"],
                url:"https://steamcommunity.com/sharedfiles/filedetails/?id=3412100993&searchtext=LIGHTHOUSE"
            },

            { title: "METRO ARENA", 
                author: "vufiab", 
                xp: "0.509", 
                recommended: false, 
                tags: ["TOTALMENTE OK"],
                url:"https://steamcommunity.com/sharedfiles/filedetails/?id=3366549344&searchtext=METRO+ARENA"
            },

            { title: "FALLEN KINGDOM", 
                author: "allen Kingdom", 
                xp: "1", 
                recommended: true, 
                tags: ["TOTALMENTE OK"],
                url:"https://steamcommunity.com/sharedfiles/filedetails/?id=3410319693&searchtext=FALLEN+KINGDOM"
            },

            { title: "BLUE ARCHIVE - CLASSROOM", 
                author: "vufiab", 
                xp: "0.33000001", 
                recommended: false, 
                tags: ["TOTALMENTE OK"],
                url:"https://steamcommunity.com/sharedfiles/filedetails/?id=3384840484&searchtext=BLUE+ARCHIVE+-+CLASSROOM"
            },

            { title: "STADT DER UNTOTEN", 
                author: "PennySaver", 
                xp: "1.03", 
                recommended: false, 
                tags: ["TOTALMENTE OK"],
                url:"https://steamcommunity.com/sharedfiles/filedetails/?id=3407635141&searchtext=STADT+DER+UNTOTEN"
            },

            { title: "STONEFORGE BASTION", 
                author: "AndreyGorbin", 
                xp: "1", 
                recommended: false, 
                tags: ["TOTALMENTE OK"],
                url:"https://steamcommunity.com/sharedfiles/filedetails/?id=3385378592&searchtext=STONEFORGE+BASTION"
            },

            { title: "NECRO FOREST REMASTERED V1.3", 
                author: "F Ossy29", 
                xp: "1", 
                recommended: true, 
                tags: ["TOTALMENTE OK"],
                url:"https://steamcommunity.com/sharedfiles/filedetails/?id=778132839&searchtext=NECRO+FOREST+REMASTERED+V1.3"
            },

            { title: "VINCENT STREET Z", 
                author: "Dr. Fresco", 
                xp: "1.01", 
                recommended: false, 
                tags: ["TOTALMENTE OK"],
                url:"https://steamcommunity.com/sharedfiles/filedetails/?id=773066643&searchtext=VINCENT+STREET+Z"
            },

            { title: "HAUNTED GRAVEYARD", 
                author: "YoshiwayRin Zombies", 
                xp: "1.03", 
                recommended: false, 
                tags: ["MAPAS ROTOS"],
                url:"https://steamcommunity.com/sharedfiles/filedetails/?id=780581863&searchtext=HAUNTED+GRAVEYARD"
            },

            { title: "VERFALLEN 2.0 DERELICT", 
                author: "Kiervania, ButchyStreams, Crickle, YahaneFayMapper", 
                xp: "0.49", 
                recommended: false, 
                tags: ["TOTALMENTE OK"],
                url:"https://steamcommunity.com/sharedfiles/filedetails/?id=833031133&searchtext=VERFALLEN+2.0+DERELICT"
            },

        ];

// Generar mapas adicionales para demo (hasta 6000) - carga perezosa
// Para evitar crear 6000 objetos en memoria y mejorar rendimiento, se expone
// un proxy que genera y cachea cada mapa cuando se accede por índice.
const TOTAL_MAPS = 6000;

function createMap(i) {
    const baseMap = baseMaps[i % baseMaps.length];
    const mapa = {
        title: `${baseMap.title} #${i + 1}`,
        author: baseMap.author,
        xp: baseMap.xp,
        // Para los índices originales mantenemos la propiedad recommended si existe
        recommended: (i < baseMaps.length) ? baseMap.recommended : (Math.random() > 0.7),
        tags: baseMap.tags,
        url: baseMap.url // solo si el mapa base la define
    };
    return mapa;
}

const _cache = new Map();
const handler = {
    get(target, prop) {
        // length debe reflejar el total disponible
        if (prop === 'length') return TOTAL_MAPS;
        // Acceso numérico: crear y cachear el mapa
        if (typeof prop === 'string' && /^[0-9]+$/.test(prop)) {
            const idx = Number(prop);
            if (_cache.has(idx)) return _cache.get(idx);
            const obj = createMap(idx);
            _cache.set(idx, obj);
            return obj;
        }
        // delegar otras propiedades (métodos de Array como filter, indexOf usarán length y get)
        return Reflect.get(target, prop);
    }
};

window.mapsData = new Proxy([], handler);
window.TOTAL_MAPS = TOTAL_MAPS;
// Utilidades convenientes
window.getMap = function(i) {
    if (i < 0 || i >= TOTAL_MAPS) return undefined;
    if (_cache.has(i)) return _cache.get(i);
    const m = createMap(i);
    _cache.set(i, m);
    return m;
};

window.getMapsSlice = function(start, end) {
    const res = [];
    const s = Math.max(0, start || 0);
    const e = Math.min(TOTAL_MAPS, end === undefined ? TOTAL_MAPS : end);
    for (let i = s; i < e; i++) res.push(window.getMap(i));
    return res;
};