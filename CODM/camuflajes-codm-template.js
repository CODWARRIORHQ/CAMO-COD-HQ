(() => {
    // 1. Ruta hacia las imágenes específicas de CODM
    const rutaCamuflaje = (categoria, nombre) => `camuflajes/${categoria}/${encodeURI(nombre)}`;
    const archivosCamuflaje = {
        arena: [
            'Serpiente_del_desierto-1.png',
            'Comando-2.png',
            'Descuartizar-3.png',
            'Serpiente-marroqui-4.png',
            'Repiqueteo-5.png',
            'Lago-de-china-6.png',
            'Traje-diplomatico-7.png',
            'Valla-metalica-8.png',
            'Anochecer-9.png',
            'Granada-de-humo-10.png'
        ],
        dragon: [
            'H2O-1.png',
            'Mugre-2.png',
            'Musgo-3.png',
            'Marcado-4.png',
            'Maximo-negro-5.png',
            'Asfalto-6.png',
            'Escena-del-crimen-7.png',
            'Rosa-neon-8.png',
            'Pionero-9.png',
            'Follaje-10.png'
        ],
        astilla: [
            'Tundra-1.png',
            'Sotobosque-2.png',
            'Escarcha-3.png',
            'Ice-breaker-4.png',
            'Ruinas-5.png',
            'Espuma-de-mar-artico-6.png',
            'Angulos-7.png',
            'Luz-otoñal-8.png',
            'Abstraccion-artica-9.png',
            'Bordes-afilados-10.png'
        ],
        tigre: [
            'Zona-descuidada-1.png',
            'Avalancha-2.png',
            'Bosque-humedo-3.png',
            'Abominable-4.png',
            'Velo-descolorido-5.png',
            'Bestia-salvaje-6.png',
            'Rayas-de-tigre-7.png',
            'Gato-del-desierto-8.png',
            'Tigre-rojo-9.png',
            'Tigre-azul-10.png'
        ],
        selva: [
            'Pantano-1.png',
            'Bosque-moderno-2.png',
            'Desertico-hibrido-3.png',
            'Baile-sobre-arena-4.png',
            'Cienaga-5.png',
            'Maleza-asesina-6.png',
            'Verde-del-warcom-7.png',
            'Azul-del-warcom-8.png',
            'Helada-nocturna-9.png',
            'Dosel-10.png'
        ],
        reptil: [
            'Piton-1.png',
            'Serpiente-de-cascabel-2.png',
            'Komodo-3.png',
            'Iguana-azul-4.png',
            'Chupacabras-5.png',
            'Piton-rosa-6.png',
            'Anaconda-7.png',
            'Serpiente-toro-8.png',
            'Gecko-9.png',
            'Culebra-10.png'
        ],
        completista: [
            'Oro.png',
            'Platino.png',
            'Damasco.png',
            'Diamante.png'
        ]
    };
    const obtenerArchivoCamuflaje = (categoria, index) => archivosCamuflaje[categoria]?.[index] || `${categoria}_${index + 1}.png`;
    const nombresTorneos = [
        'Red-sprite-T1.png',
        'Glacial-ripple-T2.png',
        'Policromatico-T3.png',
        'Magma-abrasador-T4.png',
        'Golden-emeral-T5.png',
        'Fluorescente-T6.png',
        'Pixelated-aggression-T7.png',
        'Making-waves-T8.png',
        'Patron-de-asalto-T9.png',
        'Icelocked-T10.png',
        'Opalescence-T11.png',
        'Oportunidad-dorada-12.png',
        'Futurista-T13.png',
        'Carmine-T14.png',
        'Mystic-burst-T15.png',
        'Nephrite-T16.png',
        'Shimmer-T17.png',
        'Ivory-T18.png',
        'Gambito-hundido-T19.png',
        'Scorch melt-T20.png',
        'T-3 Infused-T21.png',
        'Rime-T22.png',
        'Victoria-de-griffin-T23.png',
        'Tinte-blanco-T24.png',
        'Mercurial-T25.png'
    ];
    const requisitosEspeciales = {
        torneos: Array(25).fill(0),
        zombies: [0],
        cajas: Array(10).fill(0),
        dmz: Array(20).fill(0)
    };
    const imagenesCajas = [
        'Aurora-de-ensueño-1.png',
        'Power-nova-2.png',
        'Ocean-waves-3.png',
        'Psychic-distorsion-4.png',
        'Scorh-melt-5.png',
        'Gilded-mist-6.png',
        'Incandescente-7.png',
        'Amatista-fundida-8.png',
        'Incendio-forestal-9.png'
    ].map(nombre => {
        const numero = Number(nombre.match(/-(\d+)\.png$/)?.[1]);
        return {
            index: numero - 1,
            image: `camuflajes/cajas especiales/${encodeURI(nombre)}`,
            name: nombre.replace(/-\d+\.png$/i, '').replace(/-/g, ' ')
        };
    });
    const imagenesDMZ = [
        ['Flujo-crepuscular-1.png', 'Flujo-berenjena-2.png', 'Flujo-del-sol-violeta-3.png', 'Flujo-boreal-4.png', 'Flujo-amatista-5.png', 'Flujo-de-aguas-profundas-6.png', 'Flujo-del-naufrago-7.png', 'Flujo-de-hoja-ambar-8.png', 'Flujo-ultravioleta-9.png', 'Flujo-de-crepusculo-malva-10.png']
            .map(nombre => `camuflajes/DMZ-T1/${encodeURI(nombre)}`),
        ['Turquoise-1.png', 'Fluorite-2.png', 'Ruby-3.png', 'Topaz-4.png', 'Emerald-5.png', 'Sapphire-6.png', 'Larimar-7.png', 'Gold-8.png', 'Amethyst-9.png', 'Ametrine-10.png']
            .map(nombre => `camuflajes/DMZ-T2/${encodeURI(nombre)}`)
    ];
    const imagenZombies = 'camuflajes/zombies/Cristal-de-eter.png';

    // 2. Las imágenes deben guardarse como camuflajes/<carpeta>/<carpeta>_<número>.png
    const categorias = [
        ['arena', 'Arena', 0, 0, 10],
        ['dragon', 'Dragon', 30, 30, 10],
        ['astilla', 'Astilla', 40, 40, 10],
        ['tigre', 'Tigre', 60, 60, 10],
        ['selva', 'Selva', 10, 10, 10],
        ['reptil', 'Reptil', 80, 80, 10],
        ['completista', 'Completista', 100, null, 4]
    ];

    const nombresCategorias = categorias.map(([, nombre]) => nombre);

    // 4. Bajas o requisitos por camuflaje según CODM
    const bajasPorCamuflaje = [
        0, 25, 50, 100, 150, 225, 325, 450, 600, 800,
        0, 5, 10, 20, 30, 45, 60, 80, 100, 125,
        0, 5, 15, 30, 50, 70, 90, 110, 135, 160,
        0, 5, 10, 15, 20, 25, 35, 45, 60, 75,
        0, 5, 10, 15, 20, 25, 35, 55, 75, 100,
        0, 5, 10, 15, 25, 35, 45, 60, 75,100,
        0, 10, 20, 30, 50, 70, 90, 120, 150, 180,
        0, 5, 10, 15, 20, 25, 30, 35, 40, 50,
        0, 5, 15, 25, 35, 45, 60, 75, 90, 110,
        0, 2, 4, 7, 10, 14, 18, 23, 28, 35
    ];

    const nombresCompletista = ['Oro', 'Platino', 'Damasco', 'Diamante'];
    const camuflajes = categorias.flatMap(([categoria, , progressStart, requirementStart, cantidad], categoriaIndex) => Array.from({ length: cantidad }, (_, index) => ({
        title: requirementStart === null ? nombresCompletista[index] : `${bajasPorCamuflaje[requirementStart + index]} bajas`,
        image: rutaCamuflaje(categoria, obtenerArchivoCamuflaje(categoria, index)),
        categoryIndex: categoriaIndex + 1,
        progressIndex: progressStart + index,
        className: requirementStart === null ? `mastery-preview${index ? `-${index + 1}` : ''}` : ''
    })));

    const imagenesCategorias = categorias.reduce((imagenes, [categoria], index) => {
        imagenes[`data-toggle${index + 1}`] = rutaCamuflaje(categoria, obtenerArchivoCamuflaje(categoria, 0));
        return imagenes;
    }, {});

    // 5. Nombre de función único para evitar sobrenombrado/sobreescritura
    window.sincronizarCamuflajesEntreArmas = () => {
        document.querySelectorAll('.weapon-card[data-name] .camo-section').forEach(seccion => {
            Object.entries(imagenesCategorias).forEach(([atributo, valor]) => seccion.setAttribute(atributo, valor));
            seccion.replaceChildren(...camuflajes.map(({ title, image, categoryIndex, progressIndex, className }) => {
                const item = document.createElement('div');
                item.className = `codm-base-card${className ? ` ${className}` : ''}`;
                item.dataset.category = String(categoryIndex);

                const skin = document.createElement('div');
                skin.className = `skin${className ? ` ${className}` : ''}`;
                skin.dataset.title = title;
                skin.title = title;
                skin.dataset.category = String(categoryIndex);
                skin.dataset.progressIndex = String(progressIndex);
                skin.style.backgroundImage = `url("${image.replace(/"/g, '\\"')}")`;

                const name = document.createElement('span');
                name.className = 'codm-base-name';
                name.textContent = decodeURIComponent(image.split('/').pop())
                    .replace(/\.(png|jpe?g|webp)$/i, '')
                    .replace(/-\d+$/, '')
                    .replace(/[-_]/g, ' ');

                item.append(skin, name);
                return item;
            }));
        });
    };

    // 6. Variables globales con prefijo CODM
    window.CODM_CAMUFLAJES = camuflajes;
    window.CODM_NOMBRES_CATEGORIAS = nombresCategorias;
    window.CODM_REQUISITOS_ESPECIALES = requisitosEspeciales;
    window.CODM_CAJAS_IMAGES = imagenesCajas;
    window.CODM_DMZ_IMAGES = imagenesDMZ;
    window.CODM_ZOMBIE_IMAGE = imagenZombies;
    window.CODM_TORNEOS = nombresTorneos.map(nombre => ({
        nombre,
        ruta: nombre ? `camuflajes/torneo/${encodeURI(nombre)}` : ''
    }));
})();
