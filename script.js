let tasks = [];
let characterLevel = 1;
let totalPoints = 0;
const pointsToNextLevel = 100;
 
// Carregar dados do localStorage
function loadData() {
    const savedTasks = localStorage.getItem('neuroflow_tasks');
    const savedLevel = localStorage.getItem('neuroflow_level');
    const savedPoints = localStorage.getItem('neuroflow_points');
 
    if (savedTasks) tasks = JSON.parse(savedTasks);
    if (savedLevel) characterLevel = parseInt(savedLevel);
    if (savedPoints) totalPoints = parseInt(savedPoints);
 
    updateUI();
}
 
// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('neuroflow_tasks', JSON.stringify(tasks));
    localStorage.setItem('neuroflow_level', characterLevel);
    localStorage.setItem('neuroflow_points', totalPoints);
}
 
// Adicionar tarefa
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const pointsInput = document.getElementById('pointsInput');
    const taskText = taskInput.value.trim();
    const taskPoints = parseInt(pointsInput.value) || 10;
 
    if (taskText) {
        const newTask = {
            id: Date.now(),
            title: taskText,
            points: taskPoints,
            completed: false
        };
        tasks.push(newTask);
        taskInput.value = '';
        pointsInput.value = 10;
        saveData();
        updateUI();
    }
}
 
// Alternar conclusão da tarefa
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
       
        if (task.completed) {
            totalPoints += task.points;
            checkLevelUp();
        } else {
            totalPoints = Math.max(0, totalPoints - task.points);
        }
       
        saveData();
        updateUI();
    }
}
 
// Deletar tarefa
function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task && task.completed) {
        totalPoints = Math.max(0, totalPoints - task.points);
    }
    tasks = tasks.filter(t => t.id !== id);
    saveData();
    updateUI();
}
 
// Verificar level up
function checkLevelUp() {
    const requiredPoints = pointsToNextLevel * characterLevel;
    if (totalPoints >= requiredPoints) {
        characterLevel++;
        showCelebration();
        saveData();
    }
}
 
// Mostrar celebração
function showCelebration() {
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.textContent = '🏆';
    document.body.appendChild(celebration);
   
    setTimeout(() => {
        celebration.remove();
    }, 2000);
}
 
// Resetar todas as tarefas
function resetAllTasks() {
    if (confirm('Tem certeza que deseja resetar todas as missões? Esta ação não pode ser desfeita.')) {
        tasks = [];
        saveData();
        updateUI();
        showScreen('home');
    }
}
 
// Obter classe do personagem
function getCharacterClass() {
    if (characterLevel >= 10) return 'Lenda Imortal';
    if (characterLevel >= 7) return 'Cavaleiro Épico';
    if (characterLevel >= 5) return 'Guerreiro Valente';
    if (characterLevel >= 3) return 'Escudeiro';
    return 'Aprendiz';
}
 
// Obter mensagem do personagem
function getCharacterMessage() {
    const completedTasks = tasks.filter(t => t.completed).length;
   
    if (tasks.length === 0) {
        return 'Adicione suas primeiras missões para começar sua jornada heroica! ⚔️';
    }
    if (completedTasks === tasks.length && tasks.length > 0) {
        return 'Todas as missões conquistadas! Você é um verdadeiro herói! 🏆';
    }
    if (completedTasks >= tasks.length / 2) {
        return 'Excelente progresso, guerreiro! Continue sua jornada! 💪';
    }
    return 'Suas missões aguardam, aventureiro! Escolha uma para começar! ⚔️';
}
 
// Atualizar UI
function updateUI() {
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const levelProgress = (totalPoints % pointsToNextLevel) / pointsToNextLevel * 100;
 
    // Atualizar informações do personagem
    document.getElementById('characterLevel').textContent = characterLevel;
    document.getElementById('characterClass').textContent = getCharacterClass();
    document.getElementById('characterMessage').textContent = getCharacterMessage();
    document.getElementById('totalXP').textContent = totalPoints;
 
    // Atualizar estrelas do personagem
    const starsContainer = document.getElementById('characterStars');
    starsContainer.innerHTML = '';
    const starsToShow = Math.min(characterLevel, 5);
    for (let i = 0; i < starsToShow; i++) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        star.setAttribute('x', 35 + i * 12);
        star.setAttribute('y', 20);
        star.setAttribute('font-size', '12');
        star.setAttribute('fill', '#fbbf24');
        star.textContent = '★';
        starsContainer.appendChild(star);
    }
 
    // Atualizar progresso do nível
    document.getElementById('levelProgress').textContent = Math.floor(levelProgress) + '%';
    document.getElementById('levelProgressBar').style.width = levelProgress + '%';
 
    // Atualizar contadores de missões
    document.getElementById('completedCount').textContent = completedTasks;
    document.getElementById('totalCount').textContent = totalTasks;
 
    // Atualizar barra de progresso das tarefas
    const taskProgressBar = document.getElementById('taskProgressBar');
    const taskProgressFill = document.getElementById('taskProgressFill');
    if (totalTasks > 0) {
        taskProgressBar.style.display = 'block';
        taskProgressFill.style.width = progressPercent + '%';
    } else {
        taskProgressBar.style.display = 'none';
    }
 
    // Atualizar lista de tarefas
    const taskList = document.getElementById('taskList');
    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <svg width="80" height="80" fill="#60a5fa" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                <h4>Nenhuma missão ainda!</h4>
                <p>Adicione sua primeira missão acima para começar ⚔️</p>
            </div>
        `;
    } else {
        taskList.innerHTML = tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-left">
                    <div class="task-checkbox" onclick="toggleTask(${task.id})">
                        ${task.completed ? '<svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
                    </div>
                    <div class="task-title">${task.title}</div>
                </div>
                <div class="task-right">
                    <div class="task-points">
                        <span>⭐</span>
                        +${task.points}
                    </div>
                    <button class="btn-delete" onclick="deleteTask(${task.id})">✕</button>
                </div>
            </div>
        `).join('');
    }
 
    // Atualizar estatísticas
    document.getElementById('statCompleted').textContent = completedTasks;
    document.getElementById('statLevel').textContent = characterLevel;
    document.getElementById('statXP').textContent = totalPoints;
}
 
// Trocar de tela
function showScreen(screenName) {
    // Esconder todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
 
    // Remover active de todos os botões
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
 
    // Mostrar tela selecionada
    document.getElementById(screenName + 'Screen').classList.add('active');
 
    // Adicionar active ao botão correspondente
    event.target.closest('.nav-btn').classList.add('active');
}
 
// Event listener para Enter no input de tarefa
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});
 
// Carregar dados ao iniciar
loadData();
 