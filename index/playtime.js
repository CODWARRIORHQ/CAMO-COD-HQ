(() => {
    const config = window.CAMO_SUPABASE_CONFIG || {};
    const client = window.CAMO_SUPABASE_CLIENT || (config.url && config.anonKey && window.supabase
        ? window.supabase.createClient(config.url, config.anonKey)
        : null);
    const userId = new URLSearchParams(window.location.search).get('user');
    const totalsElement = document.querySelector('#playtimeTotals');
    const ownerTools = document.querySelector('#playtimeOwnerTools');
    const form = document.querySelector('#playtimeForm');
    const fileInput = document.querySelector('#playtimeScreenshot');
    const readButton = document.querySelector('#playtimeReadButton');
    const statusElement = document.querySelector('#playtimeStatus');
    const preview = document.querySelector('#playtimePreview');
    const gameSelect = document.querySelector('#playtimeGame');
    const hoursInput = document.querySelector('#playtimeHours');
    const platformSelect = document.querySelector('#playtimePlatform');
    const deviceSelect = document.querySelector('#playtimeDevice');
    const submissionsElement = document.querySelector('#playtimeSubmissions');
    const maxFileSize = 100 * 1024 * 1024;
    const resumableUploadThreshold = 6 * 1024 * 1024;
    const isSupportedImage = file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return file.type === 'image/png' && extension === 'png' ||
            file.type === 'image/jpeg' && ['jpg', 'jpeg'].includes(extension);
    };
    const games = [
        ['MW2007', 'Call of Duty 4: Modern Warfare', ['call of duty 4 modern warfare', 'cod4 modern warfare', 'modern warfare 2007']],
        ['MW2', 'Modern Warfare 2 (2009)', ['modern warfare 2 2009', 'modern warfare 2 (2009)']],
        ['BOI', 'Black Ops', ['call of duty black ops i', 'black ops 1', 'black ops i', 'call of duty black ops']],
        ['MW3', 'Modern Warfare 3 (2011)', ['modern warfare 3 2011', 'modern warfare 3 (2011)']],
        ['BOII', 'Black Ops II', ['call of duty black ops ii', 'call of duty black ops 2', 'black ops ii', 'black ops 2']],
        ['GHOSTS', 'Ghosts', ['call of duty ghosts', 'cod ghosts']],
        ['ADVANCED', 'Advanced Warfare', ['advanced warfare', 'cod advanced warfare']],
        ['BOIII', 'Black Ops III', ['call of duty black ops iii', 'call of duty black ops 3', 'black ops iii', 'black ops 3']],
        ['INFINITE', 'Infinite Warfare', ['infinite warfare']],
        ['MWREMASTERED', 'Modern Warfare Remastered', ['modern warfare remastered']],
        ['WWII', 'WWII', ['call of duty wwii', 'call of duty ww2', 'cod wwii']],
        ['BOIIII', 'Black Ops 4', ['call of duty black ops iiii', 'call of duty black ops 4', 'black ops iiii', 'black ops 4', 'black ops iv']],
        ['CODM', 'Call of Duty: Mobile', ['call of duty mobile', 'cod mobile', 'codm']],
        ['MW2019', 'Modern Warfare (2019)', ['modern warfare 2019', 'modern warfare (2019)']],
        ['WARZONE', 'Warzone', ['call of duty warzone', 'warzone']],
        ['MW2REMASTERED', 'Modern Warfare 2 Remastered', ['modern warfare 2 remastered']],
        ['COLDWAR', 'Black Ops Cold War', ['black ops cold war', 'cold war']],
        ['VANGUARD', 'Vanguard', ['call of duty vanguard', 'vanguard']],
        ['MWII', 'Modern Warfare II (2022)', ['modern warfare ii', 'modern warfare 2 2022', 'modern warfare ii 2022']],
        ['MWIII', 'Modern Warfare III (2023)', ['modern warfare iii', 'modern warfare 3 2023', 'modern warfare iii 2023']],
        ['BO6', 'Black Ops 6', ['call of duty black ops 6', 'black ops 6', 'black ops vi']],
        ['BO7', 'Black Ops 7', ['call of duty black ops 7', 'black ops 7', 'black ops vii']],
        ['MW4', 'Modern Warfare 4', ['modern warfare 4', 'modern warfare iv']]
    ];
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const formatHours = value => new Intl.NumberFormat('es-ES', {
        maximumFractionDigits: 2
    }).format(Number(value));
    const formatDate = value => new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'medium'
    }).format(new Date(value));
    const setStatus = (message, isError = false) => {
        statusElement.textContent = message;
        statusElement.style.color = isError ? '#fca5a5' : '';
    };
    const addText = (parent, tag, className, text) => {
        const element = document.createElement(tag);
        element.className = className;
        element.textContent = text;
        parent.appendChild(element);
        return element;
    };

    games.forEach(([key, label]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = label;
        gameSelect.appendChild(option);
    });

    const renderTotals = rows => {
        totalsElement.replaceChildren();
        if (!rows.length) {
            addText(totalsElement, 'p', 'message', 'Todavía no hay horas verificadas para este perfil.');
            return;
        }
        rows.forEach(row => {
            const record = document.createElement('article');
            record.className = 'playtime-record';
            const game = games.find(([key]) => key === row.game_key);
            addText(record, 'span', 'playtime-game', game?.[1] || row.game_key);
            addText(record, 'strong', 'playtime-hours', `${formatHours(row.hours)} h`);
            addText(record, 'span', 'playtime-meta', `${row.platform} · ${row.device}`);
            addText(record, 'span', 'playtime-verified', `Verificado: ${formatDate(row.verified_at)}`);
            totalsElement.appendChild(record);
        });
    };

    const renderSubmissions = rows => {
        submissionsElement.replaceChildren();
        if (!rows.length) {
            addText(submissionsElement, 'p', 'message', 'Aún no has enviado capturas.');
            return;
        }
        const labels = { pending: 'Pendiente de revisión', approved: 'Aprobada', rejected: 'Rechazada' };
        rows.forEach(row => {
            const record = document.createElement('article');
            record.className = 'playtime-record';
            const game = games.find(([key]) => key === row.game_key);
            addText(record, 'span', 'playtime-game', game?.[1] || row.game_key);
            addText(record, 'strong', 'playtime-hours', `${formatHours(row.hours)} h`);
            addText(record, 'span', 'playtime-meta', `${row.platform} · ${row.device}`);
            addText(record, 'span', 'playtime-verified', `${labels[row.status] || row.status} · ${formatDate(row.created_at)}`);
            if (row.review_note) addText(record, 'span', 'playtime-verified', `Nota: ${row.review_note}`);
            submissionsElement.appendChild(record);
        });
    };

    const loadProfileData = async isOwner => {
        const { data: totals, error: totalsError } = await client
            .from('playtime_public_totals')
            .select('game_key, platform, device, hours, verified_at')
            .eq('user_id', userId)
            .order('game_key')
            .order('platform');
        if (totalsError) throw new Error(`No se pudieron cargar las horas verificadas: ${totalsError.message}`);
        renderTotals(totals || []);

        if (!isOwner) return;
        ownerTools.hidden = false;
        const { data: submissions, error: submissionsError } = await client
            .from('playtime_submissions')
            .select('game_key, platform, device, hours, status, review_note, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (submissionsError) throw new Error(`No se pudieron cargar tus solicitudes: ${submissionsError.message}`);
        renderSubmissions(submissions || []);
    };

    const loadOcr = async () => {
        if (window.Tesseract) return;
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('No se pudo cargar el lector OCR. Comprueba tu conexión e inténtalo de nuevo.'));
            document.head.appendChild(script);
        });
    };

    const loadTus = async () => {
        if (window.tus?.Upload) return;
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tus-js-client@4.3.1/dist/tus.min.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('No se pudo cargar el cargador de capturas grandes. Comprueba tu conexión e inténtalo de nuevo.'));
            document.head.appendChild(script);
        });
        if (!window.tus?.Upload) throw new Error('No se pudo iniciar la carga de capturas grandes.');
    };

    const uploadScreenshot = async (screenshotPath, file, accessToken) => {
        if (file.size <= resumableUploadThreshold) {
            const { error } = await client.storage
                .from('playtime-proofs')
                .upload(screenshotPath, file, { contentType: file.type, upsert: false });
            if (error) throw new Error(`No se pudo subir la captura: ${error.message}`);
            return;
        }

        await loadTus();
        await new Promise((resolve, reject) => {
            const upload = new window.tus.Upload(file, {
                endpoint: `${config.url.replace(/\/+$/, '')}/storage/v1/upload/resumable`,
                headers: {
                    authorization: `Bearer ${accessToken}`,
                    apikey: config.anonKey,
                    'x-upsert': 'false'
                },
                uploadDataDuringCreation: true,
                removeFingerprintOnSuccess: true,
                metadata: {
                    bucketName: 'playtime-proofs',
                    objectName: screenshotPath,
                    contentType: file.type,
                    cacheControl: '3600'
                },
                chunkSize: resumableUploadThreshold,
                retryDelays: [0, 1000, 3000, 5000],
                onError: error => reject(new Error(`No se pudo subir la captura: ${error.message}`)),
                onProgress: (bytesUploaded, bytesTotal) => {
                    const percent = Math.round(bytesUploaded / bytesTotal * 100);
                    setStatus(`Subiendo captura: ${percent} %`);
                },
                onSuccess: resolve
            });
            upload.start();
        });
    };

    const parseNumber = value => {
        let normalized = value.replace(/\s/g, '');
        if (normalized.includes(',') && normalized.includes('.')) {
            normalized = normalized.lastIndexOf(',') > normalized.lastIndexOf('.')
                ? normalized.replace(/\./g, '').replace(',', '.')
                : normalized.replace(/,/g, '');
        } else if (/[,.]/.test(normalized)) {
            const separator = normalized.includes(',') ? ',' : '.';
            const parts = normalized.split(separator);
            normalized = parts.length === 2 && parts[1].length === 3
                ? parts.join('')
                : `${parts.slice(0, -1).join('')}.${parts.at(-1)}`;
        }
        const number = Number(normalized);
        return Number.isFinite(number) && number >= 0 && number <= 200000 ? number : null;
    };
    const parseHours = text => {
        const numberPattern = '(?:\\d{1,3}(?:[.,\\s]\\d{3})+(?:[.,]\\d{1,2})?|\\d+(?:[.,]\\d{1,2})?)';
        const candidates = [];
        const durationPattern = new RegExp(`(${numberPattern})\\s*d(?:ays?|ias?)?\\s*(${numberPattern})?\\s*h(?:ours?|rs?)?`, 'gi');
        for (const match of text.matchAll(durationPattern)) {
            const days = parseNumber(match[1]);
            const hours = parseNumber(match[2] || '0');
            if (days !== null && hours !== null) candidates.push(days * 24 + hours);
        }

        const hoursPattern = new RegExp(`(${numberPattern})\\s*(?:hours?|hrs?|hr|h|horas?|hs?)\\b`, 'gi');
        for (const match of text.matchAll(hoursPattern)) {
            const hours = parseNumber(match[1]);
            if (hours !== null) candidates.push(hours);
        }

        const labelPattern = new RegExp(`(?:time\\s*played|hours?\\s*played|horas?\\s*(?:jugadas|de\\s*juego)|tiempo\\s*(?:jugado|de\\s*juego))\\s*[:\\-]?\\s*(${numberPattern})`, 'gi');
        for (const match of text.matchAll(labelPattern)) {
            const hours = parseNumber(match[1]);
            if (hours !== null) candidates.push(hours);
        }

        return candidates.length ? Math.max(...candidates) : null;
    };

    const detectGame = text => {
        const normalized = normalize(text);
        const candidates = games
            .flatMap(([key, label, aliases]) => aliases.map(alias => ({ key, alias })))
            .sort((a, b) => b.alias.length - a.alias.length);
        return candidates.find(candidate => normalized.includes(normalize(candidate.alias)))?.key || '';
    };

    const detectPlatform = text => {
        const normalized = normalize(text);
        if (normalized.includes('battle.net') || normalized.includes('battlenet')) return 'Battle.net';
        if (normalized.includes('steam')) return 'Steam';
        if (normalized.includes('playstation') || normalized.includes('psn') || /\bps[45]\b/.test(normalized)) return 'PlayStation';
        if (normalized.includes('xbox')) return 'Xbox';
        return '';
    };

    const detectDevice = (platform, text) => {
        if (platform === 'Steam' || platform === 'Battle.net') return 'PC';
        if (platform === 'Xbox') return 'Xbox';
        if (platform === 'PlayStation') return 'PlayStation';
        const normalized = normalize(text);
        if (/\b(pc|windows|battle.net|steam)\b/.test(normalized)) return 'PC';
        if (/\bxbox\b/.test(normalized)) return 'Xbox';
        if (/\b(playstation|ps[45])\b/.test(normalized)) return 'PlayStation';
        return '';
    };

    const prepareOcrImages = async file => {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(3, 3600 / Math.max(bitmap.width, bitmap.height));
        const canvases = [];
        try {
            for (const thresholded of [false, true]) {
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(bitmap.width * scale));
                canvas.height = Math.max(1, Math.round(bitmap.height * scale));
                const context = canvas.getContext('2d', { willReadFrequently: thresholded });
                if (!context) throw new Error('Este navegador no pudo preparar la imagen para el lector OCR.');
                context.filter = 'grayscale(1) contrast(1.35)';
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = 'high';
                context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                context.filter = 'none';
                if (thresholded) {
                    const image = context.getImageData(0, 0, canvas.width, canvas.height);
                    for (let index = 0; index < image.data.length; index += 4) {
                        const luminance = image.data[index] * 0.299 + image.data[index + 1] * 0.587 + image.data[index + 2] * 0.114;
                        const value = luminance > 160 ? 255 : 0;
                        image.data[index] = value;
                        image.data[index + 1] = value;
                        image.data[index + 2] = value;
                    }
                    context.putImageData(image, 0, 0);
                }
                canvases.push(canvas);
            }
        } catch (error) {
            canvases.forEach(canvas => { canvas.width = 0; canvas.height = 0; });
            throw error;
        } finally {
            bitmap.close();
        }
        return canvases;
    };

    readButton.addEventListener('click', async () => {
        const file = fileInput.files?.[0];
        if (!file) {
            setStatus('Selecciona una captura antes de iniciar el lector.', true);
            return;
        }
        if (!isSupportedImage(file) || file.size > maxFileSize) {
            setStatus('La imagen debe ser PNG o JPG y no superar 100 MB.', true);
            return;
        }

        readButton.disabled = true;
        setStatus('Preparando el lector OCR en este dispositivo...');
        let worker;
        try {
            await loadOcr();
            worker = await window.Tesseract.createWorker('eng+spa', 1, {
                logger: progress => {
                    if (progress.status === 'recognizing text' && Number.isFinite(progress.progress)) {
                        setStatus(`Leyendo captura: ${Math.round(progress.progress * 100)} %`);
                    }
                }
            });
            const ocrImages = await prepareOcrImages(file);
            const recognizedTexts = [];
            try {
                for (let index = 0; index < ocrImages.length; index += 1) {
                    setStatus(`Mejorando lectura de la captura: pasada ${index + 1} de ${ocrImages.length}...`);
                    const { data } = await worker.recognize(ocrImages[index]);
                    recognizedTexts.push(data.text);
                    ocrImages[index].width = 0;
                    ocrImages[index].height = 0;
                }
            } finally {
                ocrImages.forEach(canvas => { canvas.width = 0; canvas.height = 0; });
            }
            const recognizedText = recognizedTexts.join('\n');
            const detectedHours = parseHours(recognizedText);
            const detectedGame = detectGame(recognizedText);
            const detectedPlatform = detectPlatform(recognizedText);
            const detectedDevice = detectDevice(detectedPlatform, recognizedText);
            if (detectedHours !== null) hoursInput.value = detectedHours;
            if (detectedGame) gameSelect.value = detectedGame;
            if (detectedPlatform) platformSelect.value = detectedPlatform;
            if (detectedDevice) deviceSelect.value = detectedDevice;

            const detected = [
                detectedGame && 'juego',
                detectedHours !== null && 'horas',
                detectedPlatform && 'plataforma',
                detectedDevice && 'equipo'
            ].filter(Boolean);
            setStatus(detected.length
                ? `Detectado: ${detected.join(', ')}. Comprueba y corrige los campos antes de enviar.`
                : 'No se pudieron identificar datos con seguridad. Rellena los campos manualmente y comprueba la captura.');
        } catch (error) {
            setStatus(error.message || 'No se pudo leer la captura. Puedes rellenar los datos manualmente.', true);
        } finally {
            if (worker) await worker.terminate();
            readButton.disabled = false;
        }
    });

    fileInput.addEventListener('change', () => {
        preview.replaceChildren();
        preview.hidden = true;
        const file = fileInput.files?.[0];
        if (!file) return;
        if (!isSupportedImage(file) || file.size > maxFileSize) {
            fileInput.value = '';
            setStatus('La imagen debe ser PNG o JPG y no superar 100 MB.', true);
            return;
        }
        const image = document.createElement('img');
        image.alt = 'Vista previa local de la captura seleccionada';
        image.src = URL.createObjectURL(file);
        image.addEventListener('load', () => URL.revokeObjectURL(image.src), { once: true });
        preview.appendChild(image);
        preview.hidden = false;
        setStatus('Captura seleccionada. Pulsa «Leer captura» para proponer los datos.');
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const file = fileInput.files?.[0];
        const hours = Number(hoursInput.value);
        if (!file || !gameSelect.value || !platformSelect.value || !deviceSelect.value ||
            !Number.isFinite(hours) || hours < 0 || hours > 200000) {
            setStatus('Completa todos los campos y selecciona una captura válida.', true);
            return;
        }
        if (!isSupportedImage(file) || file.size > maxFileSize) {
            setStatus('La imagen debe ser PNG o JPG y no superar 100 MB.', true);
            return;
        }
        const platformDeviceValid =
            (platformSelect.value !== 'Steam' && platformSelect.value !== 'Battle.net' || deviceSelect.value === 'PC') &&
            (platformSelect.value !== 'PlayStation' || deviceSelect.value === 'PlayStation') &&
            (platformSelect.value !== 'Xbox' || deviceSelect.value === 'Xbox' || deviceSelect.value === 'PC');
        if (!platformDeviceValid) {
            setStatus('Comprueba que el tipo de equipo coincida con la plataforma seleccionada.', true);
            return;
        }

        const submitButton = form.querySelector('[type="submit"]');
        submitButton.disabled = true;
        setStatus('Subiendo la captura de forma privada...');
        const extension = file.type === 'image/png' ? 'png' : 'jpg';
        try {
            const { data: { session }, error: userError } = await client.auth.getSession();
            const user = session?.user;
            if (userError || user?.id !== userId) {
                throw new Error('Vuelve a iniciar sesión con la cuenta propietaria de este perfil.');
            }
            const screenshotPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
            await uploadScreenshot(screenshotPath, file, session.access_token);

            const { error: insertError } = await client.from('playtime_submissions').insert({
                user_id: user.id,
                game_key: gameSelect.value,
                platform: platformSelect.value,
                device: deviceSelect.value,
                hours,
                screenshot_path: screenshotPath
            });
            if (insertError) {
                const { error: cleanupError } = await client.storage.from('playtime-proofs').remove([screenshotPath]);
                if (cleanupError) console.error('No se pudo eliminar una captura cuyo envío falló:', cleanupError);
                throw new Error(`No se pudo registrar la solicitud: ${insertError.message}`);
            }

            form.reset();
            preview.replaceChildren();
            preview.hidden = true;
            await loadProfileData(true);
            setStatus('Captura enviada. Las horas aparecerán en el perfil después de la revisión.');
        } catch (error) {
            setStatus(error.message || 'No se pudo enviar la solicitud.', true);
        } finally {
            submitButton.disabled = false;
        }
    });

    const init = async () => {
        if (!userId) throw new Error('No se indicó qué perfil cargar.');
        if (!client) throw new Error('Falta configurar Supabase para cargar las horas verificadas.');
        const { data: { session }, error } = await client.auth.getSession();
        if (error) throw new Error(`No se pudo comprobar la sesión: ${error.message}`);
        await loadProfileData(session?.user?.id === userId);
    };

    init().catch(error => {
        console.error('No se pudo cargar el registro de horas jugadas:', error);
        totalsElement.replaceChildren();
        addText(totalsElement, 'p', 'message', error.message);
        if (submissionsElement) addText(submissionsElement, 'p', 'message', 'No se pudieron cargar las solicitudes.');
    });
})();
