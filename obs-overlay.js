(() => {
  const params = new URLSearchParams(location.search);
  const game = params.get('game') === 'mw2019' ? 'mw2019' : 'codm';
  const mode = ['general', 'list', 'weapon'].includes(params.get('mode')) ? params.get('mode') : 'general';
  const weapon = params.get('weapon') || '';
  const weaponTotal = Number(params.get('total')) > 0 ? Number(params.get('total')) : game === 'mw2019' ? 104 : 104;
  const keys = game === 'mw2019'
    ? { name: 'Modern Warfare 2019', progress: 'camo-cod-hq-mw2019-progress' }
    : { name: 'Call of Duty: Mobile', progress: 'camo-cod-hq-codm-progress' };
  const gameName = document.querySelector('#gameName');
  const overallPercent = document.querySelector('#overallPercent');
  const overallCount = document.querySelector('#overallCount');
  const overallFill = document.querySelector('#overallFill');
  const typeBreakdown = document.querySelector('#typeBreakdown');
  const generalStatus = document.querySelector('#generalStatus');
  const weaponView = document.querySelector('#weaponView');
  const listView = document.querySelector('#listView');
  const emptyMessage = document.querySelector('#emptyMessage');
  const connectionStatus = document.querySelector('#connectionStatus');
  const decodeSnapshot = value => {
    try {
      const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
      const decoded = JSON.parse(new TextDecoder().decode(bytes));
      return decoded && typeof decoded === 'object' ? decoded : null;
    } catch (error) {
      console.warn('No se pudo leer la instantánea del overlay', error);
      return null;
    }
  };
  const rawSnapshot = params.get('snapshot') ? decodeSnapshot(params.get('snapshot')) : null;
  const snapshotEnvelope = rawSnapshot && rawSnapshot.progress ? rawSnapshot : null;
  const snapshot = snapshotEnvelope ? snapshotEnvelope.progress : rawSnapshot;
  const typeTotals = snapshotEnvelope?.typeTotals || (game === 'codm'
    ? { base: 1144, torneos: 330, zombies: 11, cajas: 165, dmz: 220 }
    : { base: 3328 });
  const weaponTotalsByType = snapshotEnvelope?.weaponTotals || {};
  const typeProgress = snapshotEnvelope?.typeProgress || {};
  const selectedTypes = snapshotEnvelope?.selectedTypes || (game === 'codm'
    ? ['base', 'torneos', 'zombies', 'cajas', 'dmz']
    : ['base']);
  const codmWeaponTypeTotals = { base: 104, torneos: 30, zombies: 1, cajas: 15, dmz: 20 };
  const formatPercent = (completed, total) => total
    ? Math.min(100, Math.round((completed / total) * 100))
    : 0;
  const readProgress = () => {
    if (snapshot) return snapshot;
    try {
      const parsed = JSON.parse(localStorage.getItem(keys.progress) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      console.warn('No se pudo leer el progreso del overlay', error);
      return {};
    }
  };
  if (connectionStatus && snapshot) connectionStatus.textContent = 'SINCRONIZADO';
  const count = value => Array.isArray(value) ? value.length : 0;
  const getTypeCount = name => {
    const values = Array.isArray(snapshot?.[name]) ? snapshot[name] : [];
    if (!typeProgress[name]) return count(values);
    return selectedTypes.reduce((total, type) => {
      const rawCount = Number(typeProgress[name][type]) || 0;
      const availableCount = type === 'base'
        ? values.filter(value => Number.isInteger(value)).length
        : values.filter(value => typeof value === 'string' && value.startsWith(`special-${type}-`)).length;
      const categoryLimit = weaponTotalsByType[name]?.[type]
        || (game === 'codm' ? codmWeaponTypeTotals[type] : typeTotals[type])
        || rawCount;
      return total + Math.min(Math.max(0, rawCount), availableCount, categoryLimit);
    }, 0);
  };
  const getTypeTotal = name => weaponTotalsByType[name]
    ? selectedTypes.reduce((total, type) => total + (weaponTotalsByType[name][type] || 0), 0)
    : weaponTotal;
  const selectedWeaponNames = mode === 'weapon'
    ? [weapon]
    : mode === 'list'
      ? (params.get('weapons')?.split(',').map(name => name.trim()).filter(Boolean) || [])
      : [];
  const getCategoryTotal = type => {
    if (mode === 'weapon' && weaponTotalsByType[weapon]) return weaponTotalsByType[weapon][type] || 0;
    if (mode === 'weapon') return game === 'codm' ? codmWeaponTypeTotals[type] || 0 : typeTotals[type] || weaponTotal;
    if (mode === 'list' && selectedWeaponNames.length) {
      return selectedWeaponNames.reduce((total, name) => total + (weaponTotalsByType[name]?.[type] || (game === 'codm' ? codmWeaponTypeTotals[type] : typeTotals[type]) || 0), 0);
    }
    return typeTotals[type] || 0;
  };
  const selectedCatalogTotal = selectedTypes.reduce((total, type) => total + getCategoryTotal(type), 0);
  const render = () => {
    const progress = readProgress();
    const entries = Object.entries(progress).filter(([, value]) => Array.isArray(value));
    const completed = entries.reduce((total, [name]) => total + getTypeCount(name), 0);
    const catalogTotal = selectedTypes.reduce((total, type) => total + (typeTotals[type] || 0), 0);
    const requestedTotal = Number(params.get('total'));
    const total = requestedTotal > 0 && requestedTotal !== 60
        ? requestedTotal
        : selectedCatalogTotal || catalogTotal || Math.max(completed, weaponTotal);
    const percent = formatPercent(completed, total);
    gameName.textContent = keys.name;
    overallPercent.textContent = `${percent}%`;
    overallCount.textContent = `${completed} / ${total} camuflajes`;
    overallFill.style.width = `${percent}%`;
    const labels = { base: 'Base', torneos: 'Torneo', zombies: 'Zombies', cajas: 'Cajas', dmz: 'DMZ' };
    const totalsByType = selectedTypes.reduce((result, type) => {
      result[type] = Object.entries(progress).reduce((total, [name, value]) => {
        const categoryProgress = typeProgress[name];
        if (categoryProgress) {
          const rawCount = Number(categoryProgress[type]) || 0;
          const availableCount = type === 'base'
            ? value.filter(item => Number.isInteger(item)).length
            : value.filter(item => typeof item === 'string' && item.startsWith(`special-${type}-`)).length;
          const categoryLimit = weaponTotalsByType[name]?.[type]
            || (game === 'codm' ? codmWeaponTypeTotals[type] : typeTotals[type])
            || rawCount;
          return total + Math.min(Math.max(0, rawCount), availableCount, categoryLimit);
        }
        return total + (type === 'base' ? value.filter(item => Number.isInteger(item)).length : 0);
      }, 0);
      return result;
    }, {});
    typeBreakdown.hidden = !selectedTypes.length;
    generalStatus.hidden = true;
    typeBreakdown.innerHTML = selectedTypes.map(type => {
      const categoryTotal = getCategoryTotal(type);
      const categoryCount = totalsByType[type] || 0;
      const categoryPercent = formatPercent(categoryCount, categoryTotal);
      return `<div class="type-row"><div class="type-row-top"><strong>${labels[type] || type}</strong><span>${categoryCount} / ${categoryTotal} camuflajes · ${categoryPercent}%</span></div><div class="type-progress progress-track"><span style="width:${categoryPercent}%"></span></div></div>`;
    }).join('');
    emptyMessage.hidden = true;
    if (mode === 'weapon') {
      const weaponProgress = progress[weapon] || [];
      const selectedWeaponTotal = getTypeTotal(weapon);
      const weaponCount = getTypeCount(weapon);
      const weaponPercent = formatPercent(weaponCount, selectedWeaponTotal);
      weaponView.hidden = false;
      document.querySelector('#weaponName').textContent = weapon || 'Arma no especificada';
      document.querySelector('#weaponFill').style.width = `${weaponPercent}%`;
      document.querySelector('#weaponCount').textContent = `${weaponCount} / ${selectedWeaponTotal} camuflajes · ${weaponPercent}%`;
    } else if (mode === 'list') {
      listView.hidden = false;
      const list = document.querySelector('#weaponList');
      const selected = params.get('weapons')?.split(',').map(name => name.trim()).filter(Boolean);
      const rows = (selected?.length ? selected : entries.map(([name]) => name))
        .map(name => [name, getTypeCount(name), getTypeTotal(name)])
        .sort((a, b) => b[1] - a[1]);
      list.innerHTML = rows.length ? rows.map(([name, value]) => {
        const rowTotal = rows.find(row => row[0] === name)[2];
        const weaponPercent = formatPercent(value, rowTotal);
        return `<div class="weapon-row"><div class="weapon-row-top"><strong>${escapeHtml(name)}</strong><span>${value} / ${rowTotal} camuflajes · ${weaponPercent}%</span></div><div class="weapon-progress progress-track"><span style="width:${weaponPercent}%"></span></div></div>`;
      }).join('') : '<p class="empty">Todavía no hay armas con progreso.</p>';
    } else {
      weaponView.hidden = true;
      listView.hidden = true;
    }
  };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
  render();
  window.setInterval(render, 1000);
})();
