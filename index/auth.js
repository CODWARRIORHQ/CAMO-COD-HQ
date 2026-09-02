(() => {
    const config = window.CAMO_SUPABASE_CONFIG || {};
    const authButton = document.querySelector('[data-auth-open]');
    const authModal = document.querySelector('#authModal');
    const authForm = document.querySelector('#authForm');
    const authTitle = document.querySelector('#authTitle');
    const authSubmit = document.querySelector('#authSubmit');
    const authSwitch = document.querySelector('#authSwitch');
    const authMessage = document.querySelector('#authMessage');
    const authClose = document.querySelector('[data-auth-close]');
    const authEmailField = document.querySelector('#authEmail');
    const authEmailContainer = document.querySelector('#authEmailField');
    const authSignOut = document.querySelector('#authSignOut');
    const signOutButton = document.querySelector('[data-auth-signout]');
    const usernameField = document.querySelector('#authUsername');
    const usernameContainer = document.querySelector('#authUsernameField');
    const passwordField = document.querySelector('#authPassword');
    let isRegistering = false;
    let isEditingProfile = false;
    let currentUser;
    let client;

    if (!authButton || !authModal || !authForm) return;

    const setMessage = (message, isError = false) => {
        authMessage.textContent = message;
        authMessage.classList.toggle('is-error', isError);
    };

    const closeModal = () => {
        authModal.close();
        authForm.reset();
        setMessage('');
    };

    const updateMode = () => {
        isEditingProfile = false;
        isRegistering = !isRegistering;
        authTitle.textContent = isRegistering ? 'Crear cuenta' : 'Iniciar sesión';
        authSubmit.textContent = isRegistering ? 'Registrarse' : 'Entrar';
        authSwitch.textContent = isRegistering ? 'Ya tengo una cuenta' : 'Crear una cuenta';
        usernameContainer.hidden = !isRegistering;
        usernameField.required = isRegistering;
        authEmailContainer.hidden = false;
        authEmailField.required = true;
        passwordField.parentElement.hidden = false;
        passwordField.required = true;
        authSwitch.hidden = false;
        authSignOut.hidden = true;
        passwordField.autocomplete = isRegistering ? 'new-password' : 'current-password';
        setMessage('');
    };

    const openProfile = () => {
        isEditingProfile = true;
        authTitle.textContent = 'Tu perfil';
        authSubmit.textContent = 'Guardar nombre';
        authEmailContainer.hidden = true;
        authEmailField.required = false;
        passwordField.parentElement.hidden = true;
        passwordField.required = false;
        usernameContainer.hidden = false;
        usernameField.required = true;
        usernameField.value = currentUser?.user_metadata?.username || '';
        authSwitch.hidden = true;
        authSignOut.hidden = false;
        authModal.showModal();
    };

    const updateUser = (user) => {
        currentUser = user;
        if (user) {
            authButton.textContent = user.user_metadata?.username || user.email || 'Cuenta';
            authButton.removeAttribute('data-auth-open');
            authButton.setAttribute('data-auth-profile', '');
            authButton.classList.add('is-authenticated');
        } else {
            authButton.textContent = 'Iniciar sesión';
            authButton.setAttribute('data-auth-open', '');
            authButton.removeAttribute('data-auth-profile');
            authButton.classList.remove('is-authenticated');
        }
    };

    authButton.addEventListener('click', async () => {
        if (!client) {
            authModal.showModal();
            setMessage('Falta configurar Supabase en supabase-config.js.', true);
            return;
        }
        if (authButton.hasAttribute('data-auth-profile')) {
            openProfile();
            return;
        }
        authModal.showModal();
    });

    authClose?.addEventListener('click', closeModal);
    authSwitch?.addEventListener('click', updateMode);
    authSignOut?.addEventListener('click', async () => {
        await client.auth.signOut();
        updateUser(null);
        closeModal();
    });

    authForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!client) {
            setMessage('Falta configurar Supabase en supabase-config.js.', true);
            return;
        }

        const email = authEmailField.value.trim();
        const username = usernameField.value.trim();
        const password = passwordField.value;
        const result = isEditingProfile
            ? await client.auth.updateUser({ data: { username } })
            : isRegistering
            ? await client.auth.signUp({ email, password, options: { data: { username } } })
            : await client.auth.signInWithPassword({ email, password });

        if (result.error) {
            setMessage(result.error.message, true);
            return;
        }

        if (isEditingProfile) {
            updateUser(result.data.user);
            closeModal();
        } else if (isRegistering) {
            setMessage('Cuenta creada. Revisa tu correo para confirmarla.');
        } else {
            updateUser(result.data.user);
            closeModal();
        }
    });

    const loadAuth = async () => {
        if (!config.url || !config.anonKey || !window.supabase) return;
        client = window.supabase.createClient(config.url, config.anonKey);
        const { data } = await client.auth.getUser();
        updateUser(data.user);
        client.auth.onAuthStateChange((_event, session) => updateUser(session?.user));
    };

    loadAuth();
})();
