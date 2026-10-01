/*
 * Tabla editable de XP.
 *
 * Para cambiar la XP de un juego, modifica solo xpPerCamo en su fila.
 * Los valores se aplican al perfil, leaderboard y notificaciones.
 */
(function () {
    'use strict';

    window.CAMO_XP_CONFIG = {
        xpPerLevel: 2000,
        xpIncreasePerLevel: 200,
        levelsPerPrestige: 1000,
        games: [
            { game: 'Mobile', xpPerCamo: 10 },
            { game: 'default', xpPerCamo: 10 }
        ]
    };

    window.getXpPerCamo = function (game) {
        const row = window.CAMO_XP_CONFIG.games.find(item => item.game === game);
        const fallback = window.CAMO_XP_CONFIG.games.find(item => item.game === 'default');
        return Number(row?.xpPerCamo ?? fallback?.xpPerCamo ?? 10);
    };

    window.getXpClaimLedger = function (game) {
        const key = `camo-cod-hq-xp-claims-${String(game || 'default').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        try {
            const stored = JSON.parse(localStorage.getItem(key) || '[]');
            return { key, claims: new Set(Array.isArray(stored) ? stored.filter(value => typeof value === 'string') : []) };
        } catch (error) {
            console.warn('No se pudo leer el registro de XP', error);
            return { key, claims: new Set() };
        }
    };

    window.claimCamoXp = function (game, camoId) {
        if (typeof camoId !== 'string' || !camoId) return false;
        const ledger = window.getXpClaimLedger(game);
        if (ledger.claims.has(camoId)) return false;
        ledger.claims.add(camoId);
        try {
            localStorage.setItem(ledger.key, JSON.stringify([...ledger.claims]));
            return true;
        } catch (error) {
            console.warn('No se pudo guardar el registro de XP', error);
            return false;
        }
    };

    const tokenTypes = {
        x2: { multiplier: 2, label: 'x2', durationMinutes: 15 },
        x5: { multiplier: 5, label: 'x5', durationMinutes: 30 },
        x10: { multiplier: 10, label: 'x10', durationMinutes: 60 }
    };
    const gameNamesByFile = {
        'boi.html': 'Black Ops I',
        'boii.html': 'Black Ops II',
        'boiii.html': 'Black Ops III',
        'boiiii.html': 'Black Ops IIII',
        'bo6.html': 'Black Ops 6',
        'bo7.html': 'Black Ops 7',
        'codm.html': 'Mobile',
        'coldwar.html': 'Black Ops Cold War',
        'advanced.html': 'Advanced Warfare',
        'ghosts.html': 'Ghosts',
        'mw.html': 'Modern Warfare 2019',
        'mw2007.html': 'Modern Warfare',
        'mw2.html': 'Modern Warfare 2',
        'mw3.html': 'Modern Warfare 3',
        'mwii.html': 'Modern Warfare II',
        'mwiii.html': 'Modern Warfare III',
        'mw2remastered.html': 'Modern Warfare 2 Remastered',
        'mwr.html': 'Modern Warfare Remastered',
        'warzone.html': 'Warzone',
        'vanguard.html': 'Vanguard',
        'wwii.html': 'World War II',
        'infinite.html': 'Infinite Warfare'
    };
    const storagePrefix = 'camo-cod-hq-xp-tokens-v1';

    function getAuthenticatedUserId() {
        if (typeof window.CAMO_XP_USER_ID === 'string' && window.CAMO_XP_USER_ID) {
            return window.CAMO_XP_USER_ID;
        }
        const projectUrl = window.CAMO_SUPABASE_CONFIG?.url;
        const projectRef = projectUrl ? new URL(projectUrl).hostname.split('.')[0] : '';
        if (!projectRef) return 'guest';
        try {
            const session = JSON.parse(localStorage.getItem(`sb-${projectRef}-auth-token`) || 'null');
            const userId = session?.user?.id;
            return typeof userId === 'string' && userId ? userId : 'guest';
        } catch (error) {
            console.warn('No se pudo identificar la cuenta para las fichas de XP', error);
            return 'guest';
        }
    }

    function readTokenState(userId) {
        const key = `${storagePrefix}-${userId || getAuthenticatedUserId()}`;
        const defaults = {
            inventory: { x2: 1, x5: 1, x10: 1 },
            durations: { x2: tokenTypes.x2.durationMinutes, x5: tokenTypes.x5.durationMinutes, x10: tokenTypes.x10.durationMinutes },
            active: null,
            achievements: {},
            bonusXp: 0
        };
        try {
            const saved = JSON.parse(localStorage.getItem(key) || 'null');
            const state = {
                ...defaults,
                ...(saved && typeof saved === 'object' ? saved : {}),
                inventory: { ...defaults.inventory, ...(saved?.inventory || {}) },
                durations: { ...defaults.durations, ...(saved?.durations || {}) },
                achievements: { ...(saved?.achievements || {}) },
                bonusXp: Math.max(0, Number(saved?.bonusXp) || 0)
            };
            Object.keys(tokenTypes).forEach(type => {
                state.inventory[type] = Math.max(0, Math.floor(Number(state.inventory[type]) || 0));
                state.durations[type] = tokenTypes[type].durationMinutes;
            });
            if (saved === null) saveTokenState(key, state);
            if (state.active) {
                const activeType = tokenTypes[state.active.type];
                const startedAt = Number(state.active.startedAt);
                const fixedExpiresAt = activeType && Number.isFinite(startedAt)
                    ? startedAt + activeType.durationMinutes * 60 * 1000
                    : NaN;
                if (!Number.isFinite(fixedExpiresAt) || fixedExpiresAt <= Date.now()) {
                    state.active = null;
                    saveTokenState(key, state);
                } else if (Number(state.active.expiresAt) !== fixedExpiresAt) {
                    state.active.expiresAt = fixedExpiresAt;
                    saveTokenState(key, state);
                }
            }
            return { key, state };
        } catch (error) {
            console.warn('No se pudo leer el inventario de fichas XP', error);
            return { key, state: defaults };
        }
    }

    function saveTokenState(key, state) {
        try {
            localStorage.setItem(key, JSON.stringify(state));
            return true;
        } catch (error) {
            console.warn('No se pudo guardar el inventario de fichas XP', error);
            return false;
        }
    }

    function getTokenState(userId) {
        return readTokenState(userId).state;
    }

    function getActiveToken(userId) {
        return getTokenState(userId).active;
    }

    function activateToken(type, userId) {
        if (!tokenTypes[type]) return { ok: false, reason: 'invalid' };
        const { key, state } = readTokenState(userId);
        if (state.active) return { ok: false, reason: 'active', state };
        if (state.inventory[type] < 1) return { ok: false, reason: 'empty', state };
        const now = Date.now();
        state.inventory[type] -= 1;
        state.active = {
            type,
            startedAt: now,
            expiresAt: now + tokenTypes[type].durationMinutes * 60 * 1000
        };
        if (!saveTokenState(key, state)) return { ok: false, reason: 'storage', state };
        return { ok: true, state };
    }

    function deactivateToken(userId) {
        const { key, state } = readTokenState(userId);
        if (!state.active) return { ok: false, state };
        state.active = null;
        return { ok: saveTokenState(key, state), state };
    }

    function grantTokenForAchievement(achievementId, type, userId) {
        if (!achievementId || !tokenTypes[type]) return false;
        const { key, state } = readTokenState(userId);
        if (state.achievements[achievementId]) return false;
        state.achievements[achievementId] = type;
        state.inventory[type] += 1;
        return saveTokenState(key, state);
    }

    function grantRandomTokenForAchievement(achievementId, userId) {
        if (!achievementId) return null;
        const { key, state } = readTokenState(userId);
        if (state.achievements[achievementId]) return null;
        const types = Object.keys(tokenTypes);
        const type = types[Math.floor(Math.random() * types.length)];
        state.achievements[achievementId] = type;
        state.inventory[type] += 1;
        return saveTokenState(key, state) ? type : null;
    }

    function getXpMultiplier(userId) {
        const active = getActiveToken(userId);
        return active ? tokenTypes[active.type].multiplier : 1;
    }

    function getBonusXp(userId) {
        return getTokenState(userId).bonusXp;
    }

    function getXpHistoryKey(userId) {
        return `camo-cod-hq-xp-history-v1-${userId || getAuthenticatedUserId()}`;
    }

    function getXpHistory(userId) {
        const key = getXpHistoryKey(userId);
        try {
            const saved = JSON.parse(localStorage.getItem(key) || '[]');
            if (!Array.isArray(saved)) return [];
            return saved
                .filter(entry =>
                    entry &&
                    typeof entry.game === 'string' &&
                    typeof entry.date === 'string' &&
                    Number.isFinite(Number(entry.xp)) &&
                    Number(entry.xp) > 0
                )
                .slice(0, 10);
        } catch (error) {
            console.warn('No se pudo leer el historial de XP', error);
            return [];
        }
    }

    function saveXpHistory(userId, entry) {
        const history = getXpHistory(userId);
        const key = getXpHistoryKey(userId);
        try {
            localStorage.setItem(key, JSON.stringify([entry, ...history].slice(0, 10)));
        } catch (error) {
            console.warn('No se pudo guardar el historial de XP', error);
        }
    }

    function awardCamoXp(game, camoId, baseXp) {
        const amount = Math.max(0, Number(baseXp) || window.getXpPerCamo(game));
        if (!amount || !window.claimCamoXp(game, camoId)) return 0;
        const userId = getAuthenticatedUserId();
        const { key, state } = readTokenState(userId);
        const multiplier = state.active ? tokenTypes[state.active.type]?.multiplier || 1 : 1;
        state.bonusXp += amount * (multiplier - 1);
        const tokenStateSaved = saveTokenState(key, state);
        const appliedMultiplier = tokenStateSaved ? multiplier : 1;
        const xp = amount * appliedMultiplier;
        saveXpHistory(userId, {
            date: new Date().toISOString(),
            game: String(game || 'Juego'),
            baseXp: amount,
            multiplier: appliedMultiplier,
            xp
        });
        return xp;
    }

    function getSkinId(skin) {
        const card = skin.closest('.weapon-card');
        if (!card) return null;
        if (skin.classList.contains('codm-special-skin')) {
            return `${card.dataset.name}:special:${skin.dataset.specialGroup || ''}:${skin.dataset.specialIndex || ''}`;
        }
        return `${card.dataset.name}:standard::${Array.from(card.querySelectorAll('.skin')).indexOf(skin)}`;
    }

    function getCurrentGame() {
        return gameNamesByFile[location.pathname.split('/').pop().toLowerCase()] || '';
    }

    function layoutXpNotifications() {
        const priority = {
            'xp-notification': 0,
            'camo-shared-xp-notification': 1,
            'camo-token-reward': 2
        };
        const notifications = Array.from(document.querySelectorAll(
            '.xp-notification, .camo-shared-xp-notification, .camo-token-reward'
        )).sort((first, second) =>
            (priority[first.classList[0]] ?? 3) - (priority[second.classList[0]] ?? 3)
        );
        let top = 16;

        notifications.forEach(notification => {
            Object.assign(notification.style, {
                position: 'fixed',
                top: `${top}px`,
                right: '16px',
                left: 'auto',
                maxWidth: 'calc(100vw - 48px)',
                boxSizing: 'border-box'
            });
            top += notification.getBoundingClientRect().height + 10;
        });
    }

    function showXpNotification(xp, multiplier) {
        const previous = document.querySelector('.camo-shared-xp-notification');
        if (previous) {
            previous.remove();
            layoutXpNotifications();
        }
        const notification = document.createElement('div');
        notification.className = 'camo-shared-xp-notification';
        notification.setAttribute('role', 'status');
        notification.textContent = `+${xp.toLocaleString('es-ES')} XP${multiplier > 1 ? ` (x${multiplier})` : ''}`;
        Object.assign(notification.style, {
            position: 'fixed', top: '16px', right: '16px', zIndex: '9999',
            display: 'grid', gap: '4px', padding: '14px 18px',
            border: '1px solid var(--theme-accent, #06b6d4)', borderRadius: '10px',
            background: 'rgba(5, 10, 16, .96)', color: 'var(--theme-text, #fff)',
            fontWeight: '800', boxShadow: '0 8px 30px rgba(0,0,0,.4)'
        });
        document.body.appendChild(notification);
        layoutXpNotifications();
        window.setTimeout(() => {
            notification.remove();
            layoutXpNotifications();
        }, 2600);
    }

    function seedExistingClaims(game) {
        document.querySelectorAll('.weapon-card[data-name] .skin.checked, .weapon-card[data-name] .codm-special-skin.checked').forEach(skin => {
            const id = getSkinId(skin);
            if (id) window.claimCamoXp(game, id);
        });
    }

    function recordNewCamoClaims(game) {
        let gainedXp = 0;
        let gainedCamos = 0;
        document.querySelectorAll('.weapon-card[data-name] .skin.checked, .weapon-card[data-name] .codm-special-skin.checked').forEach(skin => {
            const id = getSkinId(skin);
            if (!id) return;
            const xp = awardCamoXp(game, id, window.getXpPerCamo(game));
            if (xp > 0) {
                gainedXp += xp;
                gainedCamos += 1;
            }
        });
        const multiplier = gainedCamos ? gainedXp / (gainedCamos * window.getXpPerCamo(game)) : 1;
        if (gainedXp > 0) showXpNotification(gainedXp, multiplier);
        return { gainedCamos, gainedXp, multiplier };
    }

    function showTokenReward(type, achievement) {
        const previous = document.querySelector('.camo-token-reward');
        if (previous) {
            previous.remove();
            layoutXpNotifications();
        }
        const notification = document.createElement('div');
        notification.className = 'camo-token-reward';
        notification.setAttribute('role', 'status');
        notification.textContent = `¡Ficha aleatoria ${tokenTypes[type].label} conseguida! ${achievement}`;
        Object.assign(notification.style, {
            position: 'fixed', top: '16px', right: '16px', zIndex: '9999',
            padding: '14px 18px', border: '1px solid var(--theme-accent, #06b6d4)',
            borderRadius: '10px', background: 'rgba(5, 10, 16, .96)',
            color: 'var(--theme-text, #fff)', fontWeight: '800',
            boxShadow: '0 8px 30px rgba(0,0,0,.4)'
        });
        document.body.appendChild(notification);
        layoutXpNotifications();
        window.setTimeout(() => {
            notification.remove();
            layoutXpNotifications();
        }, 4000);
    }

    function checkWeaponTokenRewards(game) {
        const masteryClasses = ['mastery-preview', 'mastery-preview-2', 'mastery-preview-3', 'mastery-preview-4'];
        const masteryNames = ['oro', 'platino', 'damasco', 'diamante'];
        document.querySelectorAll('.weapon-card[data-name]').forEach(card => {
            const weapon = card.dataset.name;
            if (!weapon) return;
            const baseCamos = Array.from(card.querySelectorAll('.skin.checked'))
                .filter(skin => !masteryClasses.some(className => skin.classList.contains(className)))
                .length;
            if (baseCamos >= 100) {
                const type = grantRandomTokenForAchievement(`weapon-100:${game}:${weapon}`);
                if (type) showTokenReward(type, `100 camuflajes de ${weapon}.`);
            }
            masteryClasses.forEach((className, index) => {
                if (!card.querySelector(`.skin.${className}.checked`)) return;
                const type = grantRandomTokenForAchievement(`mastery:${game}:${weapon}:${masteryNames[index]}`);
                if (type) showTokenReward(type, `Camuflaje de completista ${masteryNames[index]} de ${weapon}.`);
            });
        });
    }

    window.CAMO_XP_TOKENS = {
        types: tokenTypes,
        getUserId: getAuthenticatedUserId,
        getState: getTokenState,
        getActiveToken,
        getMultiplier: getXpMultiplier,
        getBonusXp,
        getXpHistory,
        activate: activateToken,
        deactivate: deactivateToken,
        grantForAchievement: grantTokenForAchievement,
        grantRandomForAchievement: grantRandomTokenForAchievement,
        seedExistingClaims,
        awardCamoXp,
        layoutNotifications: layoutXpNotifications,
    };

    document.addEventListener('pointerdown', () => {
        const game = getCurrentGame();
        if (game) seedExistingClaims(game);
    }, true);
    document.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const game = getCurrentGame();
        if (game) seedExistingClaims(game);
    }, true);
    document.addEventListener('click', event => {
        const target = event.target instanceof Element ? event.target.closest('.skin, .codm-special-skin') : null;
        const game = getCurrentGame();
        if (!target || !game) return;
        window.setTimeout(() => {
            recordNewCamoClaims(game);
            checkWeaponTokenRewards(game);
        }, 0);
    });
    let rewardScanPending = false;
    const rewardObserver = new MutationObserver(records => {
        const checkedSkinChanged = records.some(record =>
            record.target instanceof Element
            && record.target.matches('.skin')
            && record.target.closest('.weapon-card')
        );
        if (!checkedSkinChanged || rewardScanPending) return;
        rewardScanPending = true;
        window.setTimeout(() => {
            rewardScanPending = false;
            const game = getCurrentGame();
            if (game) checkWeaponTokenRewards(game);
        }, 0);
    });
    rewardObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true
    });
    document.addEventListener('DOMContentLoaded', () => {
        const game = getCurrentGame();
        if (game) {
            getTokenState();
            window.setTimeout(() => {
                seedExistingClaims(game);
                checkWeaponTokenRewards(game);
            }, 0);
        }
    });

    window.getLevelInfoFromXp = function (xp) {
        const config = window.CAMO_XP_CONFIG;
        const totalXp = Math.max(0, Number(xp) || 0);
        const baseXp = Math.max(1, Number(config.xpPerLevel) || 1000);
        const increase = Math.max(0, Number(config.xpIncreasePerLevel) || 0);
        let level = 0;
        let xpIntoLevel = totalXp;
        let xpForNextLevel = baseXp;

        while (xpIntoLevel >= xpForNextLevel) {
            xpIntoLevel -= xpForNextLevel;
            level += 1;
            xpForNextLevel = baseXp + increase * level;
        }

        return {
            totalLevels: level,
            level: level % config.levelsPerPrestige,
            prestige: Math.floor(level / config.levelsPerPrestige),
            currentLevelXp: xpIntoLevel,
            xpForNextLevel
        };
    };
}());
