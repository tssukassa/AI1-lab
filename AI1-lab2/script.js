document.addEventListener("DOMContentLoaded", loadTasks);

let tasks = [];

function loadTasks() {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = storedTasks;
    renderTasks();
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    const searchQuery = document.getElementById('search').value.toLowerCase();

    const filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(searchQuery));

    if (filteredTasks.length === 0 && searchQuery.length > 0) {
        taskList.innerHTML = '<li>Brak wyników</li>';
        return;
    }

    filteredTasks.forEach((task, index) => {
        const taskElement = document.createElement('li');
        
        const taskText = document.createElement('span');

        if (searchQuery.length > 0) {
            const regex = new RegExp(`(${searchQuery})`, 'gi');
            taskText.innerHTML = task.text.replace(regex, '<span class="highlight">$1</span>');
        } else {
            taskText.textContent = task.text;
        }

        const taskDate = document.createElement('span');
        taskDate.textContent = task.date ? new Date(task.date).toLocaleDateString() : "";

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Usuń';
        deleteButton.onclick = () => deleteTask(index);

        taskElement.appendChild(taskText);
        taskElement.appendChild(document.createTextNode(' '));
        taskElement.appendChild(taskDate);
        taskElement.appendChild(deleteButton);
        taskElement.addEventListener('click', (event) => editTask(index, taskElement, event));

        taskList.appendChild(taskElement);
    });
}

function addTask() {
    const taskInput = document.getElementById('taskInput').value.trim();
    const taskDate = document.getElementById('taskDate').value;
    const dateObj = taskDate ? new Date(taskDate) : null;

    if (taskInput.length < 3 || taskInput.length > 255) {
        alert("Zadanie musi mieć od 3 do 255 znaków.");
        return;
    }
    if (taskDate && dateObj <= new Date()) {
        alert("Data musi być w przyszłości.");
        return;
    }

    const newTask = {
        text: taskInput,
        date: taskDate || null
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    document.getElementById('taskInput').value = '';
    document.getElementById('taskDate').value = '';
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function editTask(index, taskElement, event) {
    event.stopPropagation();
    event.stopImmediatePropagation();

    const task = tasks[index];

    const newTaskElement = taskElement.cloneNode(false);
    taskElement.parentElement.replaceChild(newTaskElement, taskElement);
    taskElement = newTaskElement;

    const taskTextInput = document.createElement('input');
    taskTextInput.type = 'text';
    taskTextInput.value = task.text;

    const taskDateInput = document.createElement('input');
    taskDateInput.type = 'date';
    taskDateInput.value = task.date ? task.date.split('T')[0] : '';

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Zapisz';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Anuluj';

    taskElement.innerHTML = '';
    taskElement.appendChild(taskTextInput);
    taskElement.appendChild(taskDateInput);
    taskElement.appendChild(saveButton);
    taskElement.appendChild(cancelButton);

    taskTextInput.focus();

    saveButton.onclick = (e) => {
        e.stopPropagation();

        const newText = taskTextInput.value.trim();
        const newDate = taskDateInput.value;

        if (newText.length < 3 || newText.length > 255) {
            alert('Zadanie musi mieć od 3 do 255 znaków.');
            return;
        }

        tasks[index].text = newText;
        tasks[index].date = newDate;
        saveTasks();

        renderTasks();
    };

    cancelButton.onclick = (e) => {
        e.stopPropagation();
        renderTasks();
    };
}



function searchTasks() {
    renderTasks();
}
