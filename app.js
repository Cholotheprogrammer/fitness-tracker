\// Tab switching logic
function switchTab(tabName) {
    const tabs = ['dashboard', 'workouts', 'nutrition', 'metrics'];
    tabs.forEach(t => {
        document.getElementById(`tab-${t}`).classList.add('hidden');
        document.getElementById(`nav-${t}`).classList.remove('bg-accentgreen', 'text-black', 'font-medium');
        document.getElementById(`nav-${t}`).classList.add('text-gray-400');
    });

    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    document.getElementById(`nav-${tabName}`).classList.add('bg-accentgreen', 'text-black', 'font-medium');
    document.getElementById(`nav-${tabName}`).classList.remove('text-gray-400');
}

// Initial dummy CRUD state for workouts matching your UI
let workouts = [
    { id: 1, title: 'Pull day', category: 'Strength', date: 'Mon, Sep 28', duration: '45 min', calories: '400 kcal', exercises: 2 },
    { id: 2, title: 'Push Day', category: 'Strength', date: 'Sun, Sep 27', duration: '45 min', calories: '300 kcal', exercises: 2 }
];

function renderWorkouts() {
    const listContainer = document.getElementById('workout-list');
    listContainer.innerHTML = '';

    workouts.forEach(w => {
        listContainer.innerHTML += `
            <div class="bg-cardbg p-5 rounded-xl border border-gray-800 flex justify-between items-center hover:border-gray-700 transition">
                <div>
                    <div class="flex items-center space-x-3 mb-1">
                        <span class="font-bold text-lg">${w.title}</span>
                        <span class="bg-amber-500/20 text-amber-400 text-xs px-2.5 py-0.5 rounded-full font-medium">${w.category}</span>
                    </div>
                    <p class="text-sm text-gray-400">📅 ${w.date} &nbsp;•&nbsp; ⏱️ ${w.duration} &nbsp;•&nbsp; 🔥 ${w.calories} &nbsp;•&nbsp; 💪 ${w.exercises} exercises</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="deleteWorkout(${w.id})" class="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-red-500/10 rounded-lg">Delete</button>
                </div>
            </div>
        `;
    });
}

function deleteWorkout(id) {
    if (confirm("Are you sure you want to delete this workout log?")) {
        workouts = workouts.filter(w => w.id !== id);
        renderWorkouts();
    }
}

function openLogModal() {
    const title = prompt("Enter Workout Title (e.g., Leg Day):");
    if (!title) return;
    
    const newWorkout = {
        id: Date.now(),
        title: title,
        category: 'Strength',
        date: 'Today',
        duration: '30 min',
        calories: '250 kcal',
        exercises: 3
    };

    workouts.push(newWorkout);
    renderWorkouts();
    alert("Workout logged successfully!");
}

// Initial render call
renderWorkouts();