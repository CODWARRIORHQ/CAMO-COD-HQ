(() => {
    const rutaCamuflaje = (categoria, nombre) => `Camuflajes/${categoria}/${nombre}`;

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
        ['completista', ['Oro_MW2019.png', 'Platino_MW2019.png', 'Damasco_MW2019.png', 'Obsidiana_MW2019.png']]
    ];

    const nombresCategorias = [
        'Spray (Bajas Normales)',
        'Bosque (Tiros a la Cabeza)',
        'Digital (Bajas Agachado)',
        'Dragón',
        'Escindida',
        'Topo',
        'Tigre',
        'Rayas',
        'Reptil',
        'Calaveras',
        'Completista'
    ];

    const bajasPorCamuflaje = [
        0, 25, 50, 100, 150, 225, 325, 450, 600, 800,
        0, 5, 10, 20, 30, 45, 60, 80, 100, 125,
        0, 5, 15, 30, 50, 70, 90, 110, 135, 160,
        155, 160, 165, 170, 175, 180, 185, 190, 195, 200,
        205, 210, 215, 220, 225, 230, 235, 240, 245, 250,
        255, 260, 265, 270, 275, 280, 285, 290, 295, 300,
        305, 310, 315, 320, 325, 330, 335, 340, 345, 350,
        355, 360, 365, 370, 375, 380, 385, 390, 395, 400,
        405, 410, 415, 420, 425, 430, 435, 440, 445, 450,
        455, 460, 465, 470, 475, 480, 485, 490, 495, 500
    ];

    const camuflajes = categorias.flatMap(([categoria, nombres], categoriaIndex) => nombres.map((nombre, index) => ({
        title: categoriaIndex === 10 ? `Categoría 11 - ${index + 1}` : `${bajasPorCamuflaje[categoriaIndex * 10 + index]} bajas`,
        image: rutaCamuflaje(categoria, nombre),
        className: categoriaIndex === 10 ? `mastery-preview${index ? `-${index + 1}` : ''}` : ''
    })));

    const imagenesCategorias = categorias.reduce((imagenes, [categoria, nombres], index) => {
        imagenes[`data-toggle${index + 1}`] = rutaCamuflaje(categoria, nombres[0]);
        return imagenes;
    }, {});

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

    window.MW2019_CAMUFLAJES = camuflajes;
    window.MW2019_NOMBRES_CATEGORIAS = nombresCategorias;
})();
