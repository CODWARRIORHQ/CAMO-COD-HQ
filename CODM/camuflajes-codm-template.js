(() => {
    // 1. Ruta hacia las imágenes específicas de CODM
    const rutaCamuflaje = (categoria, nombre) => `Camuflajes/${categoria}/${encodeURI(nombre)}`;
    const rutaTorneo = nombre => `camuflajes/${encodeURI(nombre)}`;
    const nombresTorneos = ['Oro_codm.png', ...Array(29).fill('')];
    const requisitosEspeciales = {
        torneos: Array(30).fill(0),
        zombies: [0],
        cajas: Array(15).fill(0),
        dmz: Array(20).fill(0)
    };

    // 2. Definición de categorías e imágenes de CODM (sustituye las cadenas por los nombres reales de tus fotos)
    const categorias = [
        ['spray', ['Serpiente_del_Desierto_MW2019.png', 'Comando_MW2019.png', 'Rip NTear_MW2019.png', 'Serpiente_marroquí_MW2019.png', 'Golpeteo_MW2019.png', 'Lago_China_MW2019.png', 'Traje_de_rayas_MW2019.png', 'Eslabón_de_cadena_MW2019.png', 'Nightfall_MW2019.png', 'Humo_MW2019.png']],
        ['bosque', ['Pantano_MW2019.png', 'Bosque_moderno_MW2019.png', 'Híbrido_del_Desierto_MW2019.png', 'Danza_de_la_Arena_MW2019.png', 'Marismas_MW2019.png', 'Kill_Brush_MW2019.png', 'Verdes_de_WARCOM_MW2019.png', 'WARCOM_Blues_MW2019.png', 'Nightfrost_MW2019.png', 'Dosel_MW2019.png']],
        ['digital', ['Urban_Digital_MW2019.png', 'Jungle_Digital_MW2019.png', 'Arctic_Digital_MW2019.png', 'Forest_Digital_MW2019.png', 'Marsh_Digital_MW2019.png', 'Bark_Digital_MW2019.png', 'Blue_Digital_MW2019.png', 'Classic_Digital_MW2019.png', 'Desert_Digital_MW2019.png', 'Green_Digital_MW2019.png']],
        ['dragon', ['H20_MW2019.png', 'Tierra_MW2019.png', 'Moss_MW2019.png', 'Etiquetado_MW2019.png', 'Black_Top_MW2019.png', 'Asfalto_MW2019.png', 'Escena_del_crimen_MW2019.png', 'Neón_Rosa_MW2019.png', 'Pionero_MW2019.png', 'Follaje_MW2019.png']],
        ['escindida', ['Tundra_MW2019.png', 'Sotobosque_MW2019.png', 'Congelación_MW2019.png', 'Rompehielos_MW2019.png', 'Ruinas_MW2019.png', 'Espuma_de_Mar_Ártico_MW2019.png', 'Ángulos_MW2019.png', 'Deslumbramiento_de_otoño_MW2019.png', 'Resumen_Ártico_MW2019.png', 'Aristas_afilados_MW2019.png']],
        ['topo', ['Fuera_de_la_red_MW2019.png', 'Mares_nocturnos_MW2019.png', 'Operaciones_en_Marsh_MW2019.png', 'Forestación_MW2019.png', 'Fósforo_MW2019.png', 'Senderos_vectoriales_MW2019.png', 'Viaje_Topo_MW2019.png', 'Estéril_MW2019.png', 'Desaparecidos_MW2019.png', 'Tormenta_de_Arena_MW2019.png']],
        ['tiger', ['Cubierto_de_maleza_MW2019.png', 'Deslizamiento_de_tierra_MW2019.png', 'Bosque_Húmedo_MW2019.png', 'Abominable_MW2019.png', 'Velo_desvaído_MW2019.png', 'Bestia_Salvaje_MW2019.png', 'Rayas_de_tigre_MW2019.png', 'Gato_del_Desierto_MW2019.png', 'Tigre_Rojo_MW2019.png', 'Tigre_Azul_MW2019.png']],
        ['rayas', ['Praderas_MW2019.png','Melena _de_los_Tigres_MW2019.png','El_Kan_MW2019.png','Savannah_MW2019.png','Zebra_MW2019.png','Bluegrass_MW2019.png','Africa_MW2019.png','Nu_Wave_Zebra_MW2019.png','Greengrass_MW2019.png','Cebra_Rosa_MW2019.png']],
        ['reptil', ['Python_MW2019.png','Serpiente_de_cascabel_MW2019.png','Komodo_MW2019.png','Iguana_azul_MW2019.png', 'Chupacabras_MW2019.png', 'Pitón_Rosa_MW2019.png', 'Anaconda_MW2019.png', 'Serpiente_toro_MW2019.png', 'Gecko_MW2019.png', 'Serpiente_de_liga_MW2019.png']],
        ['calaveras', ['Necropolis_MW2019.png', 'Excavador_de_cadáveres_MW2019.png', 'Osario_MW2019.png', 'Apariciones_MW2019.png', 'Fantasma_MW2019.png', 'Espectro_del_Bosque_MW2019.png', 'Hemofílico_MW2019.png', 'Engaños_MW2019.png', 'Cthulhu_MW2019.png', 'Lichyard_MW2019.png']],
        ['completista', ['Oro_MW2019.png', 'Platino_MW2019.png', 'Damasco_MW2019.png', 'Diamante_CODM.png']]
    ];

    // 3. Nombres descriptivos de los desafíos de CODM
    const nombresCategorias = [
        'Spray (Bajas Normales)',
        'Bosque (Tiros A La Cabeza)',
        'Digital (Bajas Agachado)',
        'Dragón (Bajas Desde La Cadera)',
        'Escindida (Bajas Con Tiros Lejanos)',
        'Topo (Bajas Con El Arma Apollada)',
        'Tigre (Bajas Con Todos Los Accesorios Equipados)',
        'Rayas (Bajas Poco Despues De Recargar)',
        'Reptil (Bajas Sin Ningun Accesorio Equipado)',
        'Calaveras (3 Bajas Sin Morir)',
        'Completista'
    ];

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
    const camuflajes = categorias.flatMap(([categoria, nombres], categoriaIndex) => nombres.map((nombre, index) => ({
        title: categoriaIndex === 10 ? nombresCompletista[index] : `${bajasPorCamuflaje[categoriaIndex * 10 + index]} bajas`,
        image: rutaCamuflaje(categoria, nombre),
        className: categoriaIndex === 10 ? `mastery-preview${index ? `-${index + 1}` : ''}` : ''
    })));

    const imagenesCategorias = categorias.reduce((imagenes, [categoria, nombres], index) => {
        imagenes[`data-toggle${index + 1}`] = rutaCamuflaje(categoria, nombres[0]);
        return imagenes;
    }, {});

    // 5. Nombre de función único para evitar sobrenombrado/sobreescritura
    window.sincronizarCamuflajesEntreArmas = () => {
        document.querySelectorAll('.weapon-card[data-name] .camo-section').forEach(seccion => {
            Object.entries(imagenesCategorias).forEach(([atributo, valor]) => seccion.setAttribute(atributo, valor));
            seccion.replaceChildren(...camuflajes.map(({ title, image, className }) => {
                const skin = document.createElement('div');
                skin.className = `skin${className ? ` ${className}` : ''}`;
                skin.dataset.title = title;
                skin.style.backgroundImage = `url("${image.replace(/"/g, '\\"')}")`;
                return skin;
            }));
        });
    };

    // 6. Variables globales con prefijo CODM
    window.CODM_CAMUFLAJES = camuflajes;
    window.CODM_NOMBRES_CATEGORIAS = nombresCategorias;
    window.CODM_REQUISITOS_ESPECIALES = requisitosEspeciales;
    window.CODM_TORNEOS = nombresTorneos.map(nombre => ({
        nombre,
        ruta: nombre ? rutaTorneo(nombre) : ''
    }));
})();
