const USER_STORAGE_KEY = 'momentum-users-v1';
const DATA_STORAGE_KEY = 'momentum-data-v1';
const SESSION_KEY = 'momentum-session-v1';

const DEFAULT_USERS = [
    { id: 1, name: 'Admin User', email: 'admin@momentumfit.com', passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', role: 'admin' },
    { id: 2, name: 'Demo Member', email: 'member@momentumfit.com', passwordHash: '5600376e863d2f57a053518f324ad3840b0bc2348b573af281a7b7cbe7a228c6', role: 'user' }
];

const DEFAULT_DATA = {
    workouts: [
        { id: 1, userId: 2, title: 'Pull Day', category: 'Strength', date: '2026-10-12', duration: 45, calories: 400, exercises: 2 },
        { id: 2, userId: 2, title: 'Cardio Recovery', category: 'Cardio', date: '2026-10-10', duration: 30, calories: 260, exercises: 1 }
    ],
    nutrition: [
        { id: 1, userId: 2, name: 'Chicken rice bowl', calories: 680, protein: 52, carbs: 58, fats: 18, date: '2026-10-14' },
        { id: 2, userId: 2, name: 'Smoothie', calories: 420, protein: 25, carbs: 32, fats: 12, date: '2026-10-13' }
    ],
    metrics: [
        { id: 1, userId: 2, weight: 76.4, bodyFat: 18.5, waist: 83, date: '2026-10-14' },
        { id: 2, userId: 2, weight: 77.1, bodyFat: 19.1, waist: 85, date: '2026-10-10' }
    ]
};

function sha256(value) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)).then((buffer) => {
        return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
    });
}

function getUsers() {
    try {
        const saved = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || 'null');
        const userList = Array.isArray(saved) ? saved : [];

        for (const defaultUser of DEFAULT_USERS) {
            const existingIndex = userList.findIndex((user) => user.email && user.email.toLowerCase() === defaultUser.email.toLowerCase());
            if (existingIndex === -1) {
                userList.push({ ...defaultUser });
            } else {
                userList[existingIndex] = {
                    ...userList[existingIndex],
                    name: defaultUser.name,
                    role: defaultUser.role,
                    passwordHash: defaultUser.passwordHash,
                    email: defaultUser.email
                };
            }
        }

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userList));
        return userList;
    } catch (error) {
        console.warn('Unable to read users from storage', error);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
        return [...DEFAULT_USERS];
    }
}

function getData() {
    try {
        const saved = JSON.parse(localStorage.getItem(DATA_STORAGE_KEY) || 'null');
        if (saved && typeof saved === 'object') {
            return {
                workouts: Array.isArray(saved.workouts) ? saved.workouts : DEFAULT_DATA.workouts,
                nutrition: Array.isArray(saved.nutrition) ? saved.nutrition : DEFAULT_DATA.nutrition,
                metrics: Array.isArray(saved.metrics) ? saved.metrics : DEFAULT_DATA.metrics
            };
        }
    } catch (error) {
        console.warn('Unable to read app data from storage', error);
    }

    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    return structuredClone(DEFAULT_DATA);
}

let appData = getData();

function saveData() {
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(appData));
}

function getCurrentSession() {
    try {
        return Number(localStorage.getItem(SESSION_KEY) || '0');
    } catch (error) {
        return 0;
    }
}

function setCurrentSession(userId) {
    localStorage.setItem(SESSION_KEY, String(userId));
}

function clearCurrentSession() {
    localStorage.removeItem(SESSION_KEY);
}

function getCurrentUser() {
    const userId = getCurrentSession();
    const users = getUsers();
    return users.find((user) => user.id === userId) || null;
}

function formatDate(value) {
    if (!value) return 'Today';
    const date = new Date(value + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function parseNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function getVisibleWorkouts() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return appData.workouts;
    return appData.workouts.filter((workout) => workout.userId === currentUser.id);
}

function getVisibleMeals() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return appData.nutrition;
    return appData.nutrition.filter((meal) => meal.userId === currentUser.id);
}

function getVisibleMetrics() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return appData.metrics;
    return appData.metrics.filter((metric) => metric.userId === currentUser.id);
}

function showAuthMessage(text, type = 'success') {
    const messageBox = document.getElementById('auth-message');
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.className = `mb-4 rounded-lg border px-3 py-2 text-sm ${type === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`;
    messageBox.classList.remove('hidden');
}

function hideAuthMessage() {
    const messageBox = document.getElementById('auth-message');
    if (messageBox) {
        messageBox.classList.add('hidden');
    }
}

function setAuthScreen(mode) {
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');
    const loginTab = document.getElementById('show-login-tab');
    const registerTab = document.getElementById('show-register-tab');

    if (mode === 'register') {
        loginPanel.classList.add('hidden');
        registerPanel.classList.remove('hidden');
        loginTab.classList.remove('bg-accentgreen', 'text-slate-900');
        loginTab.classList.add('text-slate-300');
        registerTab.classList.add('bg-accentgreen', 'text-slate-900');
        registerTab.classList.remove('text-slate-300');
    } else {
        registerPanel.classList.add('hidden');
        loginPanel.classList.remove('hidden');
        registerTab.classList.remove('bg-accentgreen', 'text-slate-900');
        registerTab.classList.add('text-slate-300');
        loginTab.classList.add('bg-accentgreen', 'text-slate-900');
        loginTab.classList.remove('text-slate-300');
    }
}

function showLanding() {
    document.getElementById('landing-page').classList.remove('hidden');
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('flex');
    document.getElementById('app-shell').classList.add('hidden');
    setAuthScreen('login');
    hideAuthMessage();
}

function showAuth(mode = 'login') {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('auth-section').classList.add('flex');
    document.getElementById('app-shell').classList.add('hidden');
    setAuthScreen(mode);
    hideAuthMessage();
    window.scrollTo(0, 0);
}

function showApp() {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('flex');
    document.getElementById('app-shell').classList.remove('hidden');
    const currentUser = getCurrentUser();
    if (currentUser) {
        const userName = currentUser.name.split(' ')[0];
        document.getElementById('welcome-text').textContent = `Good afternoon, ${userName}`;
        document.getElementById('sidebar-user-name').textContent = currentUser.name;
        document.getElementById('sidebar-user-role').textContent = currentUser.role === 'admin' ? 'Admin' : 'Member';
        document.getElementById('user-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
    }
    renderDashboard();
    renderWorkouts();
    renderNutrition();
    renderMetrics();
    switchTab('dashboard');
}

function switchTab(tabName) {
    const tabs = ['dashboard', 'workouts', 'nutrition', 'metrics'];
    tabs.forEach((tab) => {
        const tabElement = document.getElementById(`tab-${tab}`);
        const navButton = document.getElementById(`nav-${tab}`);
        if (tabElement) tabElement.classList.add('hidden');
        if (navButton) {
            navButton.classList.remove('bg-accentgreen', 'text-slate-900', 'font-semibold');
            navButton.classList.add('text-slate-400');
        }
    });

    const selectedTab = document.getElementById(`tab-${tabName}`);
    const selectedNav = document.getElementById(`nav-${tabName}`);
    if (selectedTab) selectedTab.classList.remove('hidden');
    if (selectedNav) {
        selectedNav.classList.add('bg-accentgreen', 'text-slate-900', 'font-semibold');
        selectedNav.classList.remove('text-slate-400');
    }
}

function renderDashboard() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const workouts = getVisibleWorkouts();
    const meals = getVisibleMeals();
    const metrics = getVisibleMetrics();
    const totalWorkoutCalories = workouts.reduce((total, workout) => total + parseNumber(workout.calories), 0);
    const totalWorkoutMinutes = workouts.reduce((total, workout) => total + parseNumber(workout.duration), 0);
    const avgMinutes = workouts.length ? Math.round(totalWorkoutMinutes / workouts.length) : 0;
    const latestMetric = metrics[metrics.length - 1];
    const latestWorkout = workouts[workouts.length - 1];

    document.getElementById('stat-workouts').textContent = String(workouts.length);
    document.getElementById('stat-calories').textContent = String(totalWorkoutCalories);
    document.getElementById('stat-duration').textContent = `${avgMinutes}m`;
    document.getElementById('stat-weight').textContent = latestMetric ? `${Number(latestMetric.weight).toFixed(1)}kg` : '0kg';
    document.getElementById('focus-last-workout').textContent = latestWorkout ? latestWorkout.title : 'No logs';
    document.getElementById('focus-calories').textContent = latestWorkout ? `${latestWorkout.calories} kcal` : '0 kcal';
    document.getElementById('focus-meals').textContent = `${meals.length} logged`;
    document.getElementById('focus-goal').textContent = `${Math.min(100, Math.round((workouts.length / 4) * 100))}%`;
}

function renderWorkouts() {
    const workoutList = document.getElementById('workout-list');
    if (!workoutList) return;
    const workouts = getVisibleWorkouts();

    if (!workouts.length) {
        workoutList.innerHTML = '<div class="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-400">No workouts logged yet.</div>';
        return;
    }

    workoutList.innerHTML = workouts
        .slice()
        .reverse()
        .map((workout) => `
            <div class="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div>
                    <div class="mb-1 flex items-center gap-3">
                        <span class="text-lg font-bold text-white">${workout.title}</span>
                        <span class="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">${workout.category}</span>
                    </div>
                    <p class="text-sm text-slate-400">📅 ${formatDate(workout.date)} &nbsp;•&nbsp; ⏱️ ${workout.duration} min &nbsp;•&nbsp; 🔥 ${workout.calories} kcal &nbsp;•&nbsp; 💪 ${workout.exercises} exercises</p>
                </div>
                <div class="flex gap-2">
                    <button type="button" data-workout-edit="${workout.id}" class="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-500">Edit</button>
                    <button type="button" data-workout-delete="${workout.id}" class="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20">Delete</button>
                </div>
            </div>
        `)
        .join('');

    document.querySelectorAll('[data-workout-edit]').forEach((button) => {
        button.addEventListener('click', () => openWorkoutModal('edit', Number(button.dataset.workoutEdit)));
    });

    document.querySelectorAll('[data-workout-delete]').forEach((button) => {
        button.addEventListener('click', () => deleteWorkout(Number(button.dataset.workoutDelete)));
    });
}

function renderNutrition() {
    const container = document.getElementById('nutrition-list');
    if (!container) return;
    const meals = getVisibleMeals();

    if (!meals.length) {
        container.innerHTML = '<div class="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-400">No meals logged yet.</div>';
        return;
    }

    container.innerHTML = meals
        .slice()
        .reverse()
        .map((meal) => `
            <div class="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div>
                    <p class="text-lg font-bold text-white">${meal.name}</p>
                    <p class="text-sm text-slate-400">📅 ${formatDate(meal.date)} &nbsp;•&nbsp; 🔥 ${meal.calories} kcal &nbsp;•&nbsp; 🥩 ${meal.protein}g protein &nbsp;•&nbsp; 🌾 ${meal.carbs}g carbs &nbsp;•&nbsp; 🧈 ${meal.fats}g fats</p>
                </div>
                <button type="button" data-meal-delete="${meal.id}" class="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20">Delete</button>
            </div>
        `)
        .join('');

    document.querySelectorAll('[data-meal-delete]').forEach((button) => {
        button.addEventListener('click', () => deleteMeal(Number(button.dataset.mealDelete)));
    });
}

function renderMetrics() {
    const container = document.getElementById('metrics-list');
    if (!container) return;
    const metrics = getVisibleMetrics();

    if (!metrics.length) {
        container.innerHTML = '<div class="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-400">No metrics logged yet.</div>';
        return;
    }

    container.innerHTML = metrics
        .slice()
        .reverse()
        .map((metric) => `
            <div class="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div>
                    <p class="text-lg font-bold text-white">${Number(metric.weight).toFixed(1)} kg</p>
                    <p class="text-sm text-slate-400">📅 ${formatDate(metric.date)} &nbsp;•&nbsp; 🧍 Body fat ${metric.bodyFat}% &nbsp;•&nbsp; 📏 Waist ${metric.waist} cm</p>
                </div>
                <button type="button" data-metric-delete="${metric.id}" class="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20">Delete</button>
            </div>
        `)
        .join('');

    document.querySelectorAll('[data-metric-delete]').forEach((button) => {
        button.addEventListener('click', () => deleteMetric(Number(button.dataset.metricDelete)));
    });
}

function openWorkoutModal(mode = 'create', workoutId = null) {
    const modal = document.getElementById('workout-modal');
    const form = document.getElementById('workout-form');
    const title = document.getElementById('workout-modal-title');
    const submitButton = document.getElementById('workout-submit-button');
    const userGroup = document.getElementById('workout-user-group');
    const userSelect = document.getElementById('workout-user');
    const currentUser = getCurrentUser();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    form.dataset.mode = mode;
    form.dataset.id = workoutId || '';

    const userOptions = getUsers().map((user) => `
        <option value="${user.id}">${user.name} (${user.role})</option>
    `).join('');

    userSelect.innerHTML = userOptions;

    if (currentUser && currentUser.role === 'admin') {
        userGroup.classList.remove('hidden');
    } else {
        userGroup.classList.add('hidden');
    }

    if (mode === 'edit') {
        const workoutToEdit = appData.workouts.find((workout) => workout.id === workoutId);
        if (!workoutToEdit) return;

        title.textContent = 'Edit workout';
        submitButton.textContent = 'Update workout';
        document.getElementById('workout-title').value = workoutToEdit.title;
        document.getElementById('workout-category').value = workoutToEdit.category;
        document.getElementById('workout-date').value = workoutToEdit.date;
        document.getElementById('workout-duration').value = workoutToEdit.duration;
        document.getElementById('workout-calories').value = workoutToEdit.calories;
        document.getElementById('workout-exercises').value = workoutToEdit.exercises;
        userSelect.value = String(workoutToEdit.userId);
    } else {
        title.textContent = 'Log workout';
        submitButton.textContent = 'Save workout';
        form.reset();
        document.getElementById('workout-date').value = new Date().toISOString().split('T')[0];
        userSelect.value = String(currentUser ? currentUser.id : getUsers()[0].id);
    }
}

function closeWorkoutModal() {
    const modal = document.getElementById('workout-modal');
    const form = document.getElementById('workout-form');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    form.reset();
    delete form.dataset.mode;
    delete form.dataset.id;
}

function deleteWorkout(id) {
    if (!confirm('Are you sure you want to delete this workout log?')) return;
    appData.workouts = appData.workouts.filter((workout) => workout.id !== id);
    saveData();
    renderWorkouts();
    renderDashboard();
}

function deleteMeal(id) {
    if (!confirm('Delete this meal entry?')) return;
    appData.nutrition = appData.nutrition.filter((meal) => meal.id !== id);
    saveData();
    renderNutrition();
    renderDashboard();
}

function deleteMetric(id) {
    if (!confirm('Delete this metric entry?')) return;
    appData.metrics = appData.metrics.filter((metric) => metric.id !== id);
    saveData();
    renderMetrics();
    renderDashboard();
}

function handleWorkoutSubmit(event) {
    event.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const form = event.currentTarget;
    const mode = form.dataset.mode || 'create';
    const id = Number(form.dataset.id || Date.now());

    const workout = {
        id: mode === 'edit' ? id : Date.now(),
        userId: currentUser.role === 'admin' ? Number(document.getElementById('workout-user').value) : currentUser.id,
        title: document.getElementById('workout-title').value.trim(),
        category: document.getElementById('workout-category').value,
        date: document.getElementById('workout-date').value,
        duration: parseNumber(document.getElementById('workout-duration').value),
        calories: parseNumber(document.getElementById('workout-calories').value),
        exercises: parseNumber(document.getElementById('workout-exercises').value)
    };

    if (!workout.title || !workout.date || workout.duration <= 0 || workout.calories < 0 || workout.exercises <= 0) {
        showAuthMessage('Please complete all workout fields with valid values.', 'error');
        return;
    }

    if (mode === 'edit') {
        appData.workouts = appData.workouts.map((item) => item.id === id ? { ...item, ...workout } : item);
    } else {
        appData.workouts.push(workout);
    }

    saveData();
    renderWorkouts();
    renderDashboard();
    closeWorkoutModal();
    hideAuthMessage();
}

function handleMealSubmit(event) {
    event.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const meal = {
        id: Date.now(),
        userId: currentUser.id,
        name: document.getElementById('meal-name').value.trim(),
        calories: parseNumber(document.getElementById('meal-calories').value),
        protein: parseNumber(document.getElementById('meal-protein').value),
        carbs: parseNumber(document.getElementById('meal-carbs').value),
        fats: parseNumber(document.getElementById('meal-fats').value),
        date: document.getElementById('meal-date').value
    };

    if (!meal.name || !meal.date || meal.calories <= 0) {
        showAuthMessage('Please enter a valid meal name and calorie value.', 'error');
        return;
    }

    appData.nutrition.push(meal);
    saveData();
    renderNutrition();
    renderDashboard();
    event.target.reset();
    hideAuthMessage();
}

function handleMetricsSubmit(event) {
    event.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const metric = {
        id: Date.now(),
        userId: currentUser.id,
        weight: parseNumber(document.getElementById('metric-weight').value),
        bodyFat: parseNumber(document.getElementById('metric-bodyfat').value),
        waist: parseNumber(document.getElementById('metric-waist').value),
        date: document.getElementById('metric-date').value
    };

    if (!metric.date || metric.weight <= 0) {
        showAuthMessage('Please enter a valid weight and date.', 'error');
        return;
    }

    appData.metrics.push(metric);
    saveData();
    renderMetrics();
    renderDashboard();
    event.target.reset();
    hideAuthMessage();
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const users = getUsers();

    if (!email || !password) {
        showAuthMessage('Please fill in your email and password.', 'error');
        return;
    }

    const passwordHash = await sha256(password);
    const user = users.find((candidate) => candidate.email.toLowerCase() === email && candidate.passwordHash === passwordHash);

    if (!user) {
        showAuthMessage('Invalid email or password.', 'error');
        return;
    }

    setCurrentSession(user.id);
    hideAuthMessage();
    showApp();
}

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const password = document.getElementById('register-password').value;

    if (!name || !email || password.length < 6) {
        showAuthMessage('Please provide a full name, valid email, and a password with at least 6 characters.', 'error');
        return;
    }

    const users = getUsers();
    const exists = users.some((user) => user.email.toLowerCase() === email);
    if (exists) {
        showAuthMessage('An account with this email already exists.', 'error');
        return;
    }

    const passwordHash = await sha256(password);
    const newUser = {
        id: Date.now(),
        name,
        email,
        passwordHash,
        role: 'user'
    };

    users.push(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
    showAuthMessage('Account created successfully. Please log in.', 'success');
    document.getElementById('register-form').reset();
    setAuthScreen('login');
}

function logoutUser() {
    clearCurrentSession();
    showLanding();
}

function init() {
    const currentUser = getCurrentUser();
    const dateLabel = document.getElementById('date-label');
    if (dateLabel) {
        dateLabel.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }

    document.getElementById('show-login-tab')?.addEventListener('click', () => setAuthScreen('login'));
    document.getElementById('show-register-tab')?.addEventListener('click', () => setAuthScreen('register'));
    document.getElementById('landing-login')?.addEventListener('click', () => showAuth('login'));
    document.getElementById('landing-register')?.addEventListener('click', () => showAuth('register'));
    document.getElementById('hero-login')?.addEventListener('click', () => showAuth('login'));
    document.getElementById('hero-register')?.addEventListener('click', () => showAuth('register'));
    document.getElementById('cta-register')?.addEventListener('click', () => showAuth('register'));
    document.getElementById('use-demo-account')?.addEventListener('click', () => {
        document.getElementById('login-email').value = 'member@momentumfit.com';
        document.getElementById('login-password').value = 'member123';
        hideAuthMessage();
    });
    document.getElementById('logout-button')?.addEventListener('click', logoutUser);
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);

    document.querySelectorAll('[data-tab]').forEach((button) => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    document.getElementById('log-workout-button')?.addEventListener('click', () => openWorkoutModal('create'));
    document.getElementById('open-workout-modal')?.addEventListener('click', () => openWorkoutModal('create'));
    document.getElementById('close-workout-modal')?.addEventListener('click', closeWorkoutModal);
    document.getElementById('workout-modal')?.addEventListener('click', (event) => {
        if (event.target === event.currentTarget) closeWorkoutModal();
    });
    document.getElementById('workout-form')?.addEventListener('submit', handleWorkoutSubmit);
    document.getElementById('meal-form')?.addEventListener('submit', handleMealSubmit);
    document.getElementById('metrics-form')?.addEventListener('submit', handleMetricsSubmit);

    document.getElementById('meal-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('metric-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('workout-date').value = new Date().toISOString().split('T')[0];

    if (currentUser) {
        showApp();
    } else {
        showLanding();
    }
}

init();