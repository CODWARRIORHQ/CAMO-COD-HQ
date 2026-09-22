(() => {
    const boiiiCatalogo = {
        campania: Array.from({ length: 30 }, (_, index) => `Campaña ${index + 1}`),
        multijugador: Array.from({ length: 30 }, (_, index) => `Multijugador ${index + 1}`),
        zombis: Array.from({ length: 11 }, (_, index) => `Zombis ${index + 1}`),
        mercadoNegro: Array.from({ length: 40 }, (_, index) => `Mercado negro ${index + 1}`),
        extras: Array.from({ length: 30 }, (_, index) => `Extras ${index + 1}`)
    };

    const requisitos = {
        torneos: Array(boiiiCatalogo.campania.length).fill(0),
        multiplayer: Array(boiiiCatalogo.multijugador.length).fill(0),
        zombies: Array(boiiiCatalogo.zombis.length).fill(0),
        cajas: Array(boiiiCatalogo.mercadoNegro.length).fill(0),
        dmz: Array(boiiiCatalogo.extras.length).fill(0)
    };

    window.sincronizarCamuflajesEntreArmas = () => {
        document.querySelectorAll('.weapon-card[data-name] .camo-section').forEach(section => {
            section.replaceChildren();
        });
    };

    window.BOIII_CATALOGO = boiiiCatalogo;
    window.BOIII_REQUISITOS = requisitos;
})();
