(() => {
    const rutaUem = nombre => `../uem/camuflajes/${nombre}`;
    const camuflajes = [
        { title: '1xp', image: 'Camuflajes/DEVGRU.png' },
        { title: '2xp', image: rutaUem('camo_2_diamante.png') },
        { title: '3xp', image: rutaUem('camo_3_escarcha.png') },
        { title: '4xp', image: rutaUem('camo_4_Marea_Negra.png') },
        { title: '5xp', image: rutaUem('camo_5_Cubierta_de_nebulosa.png') },
        { title: '6xp', image: rutaUem('camo_6_Medianoche_liquido.png') },
        { title: '7xp', image: rutaUem('camo_7_Helado_estelar.png') },
        { title: '8xp', image: rutaUem('camo_8_Estrella_de_galaxias.png') },
        { title: '9xp', image: rutaUem('camo_9_camuflaje_de_sangre.png') },
        { title: '10xp', image: rutaUem('camo_10_esmeralda_encantada.png') },
        { title: '11xp', image: rutaUem('camo_11_velo_de_orion.png') },
        { title: '12xp', image: rutaUem('camo_12_eclipse_estelar.png') },
        { title: '13xp', image: rutaUem('camo_13_profundidad_profunda.png') },
        { title: '14xp', image: rutaUem('camo_14_Vorágine_amarilla.png') },
        { title: '15xp', image: rutaUem('camo_15_tormenta_roja_astral.png') },
        { title: '16xp', image: rutaUem('camo_16_aurora_verde.png') },
        { title: '17xp', image: rutaUem('camo_17_cosmos_blanco.png') },
        { title: '18xp', image: rutaUem('camo_18_Drift_de_Andrómeda.png') },
        { title: '19xp', image: rutaUem('camo_19_resplandor_acido.png') },
        { title: '20xp', image: rutaUem('camo_20_amatista_galactica.png') },
        { title: '21xp', image: rutaUem('camo_21_diamantes_electrificados.png') },
        { title: '22xp', image: rutaUem('camo_22.png') },
        { title: '23xp', image: rutaUem('camo_23.png') },
        { title: '24xp', image: rutaUem('camo_24.png') },
        { title: '25xp', image: rutaUem('camo_25.png') },
        ...Array.from({ length: 22 }, (_, index) => ({ title: `${index + 26}xp`, image: rutaUem('camo_14_Vorágine_amarilla.png') })),
        { title: '48xp', image: rutaUem('camo_19_resplandor_acido.png') },
        { title: '49xp', image: rutaUem('camo_20_amatista_galactica.png') },
        { title: '50xp', image: rutaUem('camo_21_diamantes_electrificados.png') },
        { title: '51xp', image: rutaUem('camo_20_amatista_galactica.png') },
        { title: '52xp', image: rutaUem('camo_21_diamantes_electrificados.png') },
        { title: '53xp', image: rutaUem('camo_22.png') },
        { title: '54xp', image: rutaUem('camo_23.png') },
        { title: '55xp', image: rutaUem('camo_24.png') },
        { title: '56xp', image: rutaUem('camo_25.png') },
        ...Array.from({ length: 21 }, (_, index) => ({ title: `${index + 57}xp`, image: rutaUem('camo_14_Vorágine_amarilla.png') })),
        { title: '78xp', image: rutaUem('camo_19_resplandor_acido.png') },
        { title: '79xp', image: rutaUem('camo_20_amatista_galactica.png') },
        { title: '80xp', image: rutaUem('camo_21_diamantes_electrificados.png') },
        { title: '81xp', image: rutaUem('camo_20_amatista_galactica.png') },
        { title: '82xp', image: rutaUem('camo_21_diamantes_electrificados.png') },
        { title: '83xp', image: rutaUem('camo_22.png') },
        { title: '84xp', image: rutaUem('camo_23.png') },
        { title: '85xp', image: rutaUem('camo_24.png') },
        { title: '86xp', image: rutaUem('camo_25.png') },
        ...Array.from({ length: 13 }, (_, index) => ({ title: `${index + 87}xp`, image: rutaUem('camo_14_Vorágine_amarilla.png') })),
        { title: '100xp', image: 'Camuflajes/ORO.png', className: 'mastery-preview' },
        { title: 'Nuevo grande', image: rutaUem('camo_21_diamantes_electrificados.png'), className: 'mastery-preview-2' },
        { title: 'Nuevo grande 2', image: rutaUem('camo_21_diamantes_electrificados.png'), className: 'mastery-preview-3' },
        { title: 'Nuevo grande 3', image: rutaUem('camo_21_diamantes_electrificados.png'), className: 'mastery-preview-4' },
        { title: 'Nuevo grande 3', image: rutaUem('camo_21_diamantes_electrificados.png'), className: 'mastery-preview-4' }
    ];

    const imagenesCategorias = camuflajes.slice(0, 11).reduce((imagenes, camuflaje, index) => {
        imagenes[`data-toggle${index + 1}`] = camuflaje.image;
        return imagenes;
    }, {});

    window.sincronizarCamuflajesEntreArmas = () => {
        document.querySelectorAll('.weapon-card[data-name] .camo-section').forEach(seccion => {
            Object.entries(imagenesCategorias).forEach(([atributo, valor]) => {
                seccion.setAttribute(atributo, valor);
            });

            seccion.replaceChildren(...camuflajes.map(({ title, image, className }) => {
                const skin = document.createElement('div');
                skin.className = `skin${className ? ` ${className}` : ''}`;
                skin.dataset.title = title;
                skin.style.backgroundImage = `url(${image})`;
                return skin;
            }));
        });
    };

    window.MW2019_CAMUFLAJES = camuflajes;
})();
