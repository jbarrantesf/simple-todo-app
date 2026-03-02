/* eslint-disable no-unused-vars */

// Utility function for DOM element selection
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

// DOM Elements
const taskInput = $('#taskInput');
const addTaskBtn = $('#addTaskBtn');
const todoList = $('#todoList');
const filterOptions = $('#filterOptions');
const clearCompletedBtn = $('#clearCompletedBtn');
const sortTasksBtn = $('#sortTasksBtn');
const themeToggle = $('#themeToggle');

// State Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all'; // 'all', 'active', 'completed'

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
addTaskBtn.addEventListener('click', addTask);
todoList.addEventListener('click', handleTaskActions);
filterOptions.addEventListener('change', e => {
    currentFilter = e.target.value;
    renderTasks();
});
clearCompletedBtn.addEventListener('click', clearCompletedTasks);
sortTasksBtn.addEventListener('click', sortTasksAlphabetically);
themeToggle.addEventListener('click', toggleTheme);

/**
 * Initializes the application by loading tasks and setting up the theme.
 */
function initializeApp() {
    loadTasksFromLocalStorage();
    renderTasks();
    applyInitialTheme();
}

/**
 * Loads tasks from local storage and updates the global tasks array.
 */
function loadTasksFromLocalStorage() {
    try {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        } else {
            tasks = [];
        }
    } catch (e) {
        console.error("Error parsing tasks from localStorage:", e);
        tasks = []; // Reset tasks if parsing fails
    }
}

/**
 * Saves the current tasks array to local storage.
 */
function saveTasksToLocalStorage() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (e) {
        console.error("Error saving tasks to localStorage:", e);
    }
}

/**
 * Adds a new task to the list.
 */
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') {
        animateInputError(taskInput);
        return;
    }

    const newTask = {
        id: Date.now().toString(), // Unique ID for each task
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask); // Add to the beginning
    taskInput.value = '';
    saveTasksToLocalStorage();
    renderTasks();
}

/**
 * Handles clicks on task-related actions (complete, delete).
 * @param {Event} e - The click event object.
 */
function handleTaskActions(e) {
    const target = e.target;
    if (target.dataset.action === 'complete') {
        toggleTaskCompletion(target.closest('li').dataset.id);
    } else if (target.dataset.action === 'delete') {
        deleteTask(target.closest('li').dataset.id, target.closest('li'));
    }
}

/**
 * Toggles the completion status of a task.
 * @param {string} id - The ID of the task to toggle.
 */
function toggleTaskCompletion(id) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task,
            completed: !task.completed
        } : task
    );
    saveTasksToLocalStorage();
    renderTasks();
}

/**
 * Deletes a task from the list with a fading animation.
 * @param {string} id - The ID of the task to delete.
 * @param {HTMLLIElement} taskElement - The DOM element of the task to delete.
 */
function deleteTask(id, taskElement) {
    if (!taskElement) {
        console.error("Task element not found for deletion.");
        return;
    }

    // Add a class for fade-out animation
    taskElement.classList.add('fade-out');

    // Remove after animation completes
    taskElement.addEventListener('animationend', () => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasksToLocalStorage();
        renderTasks(); // Rerender to reflect the updated list
    }, {
        once: true
    });
}
/**
 * Renders the tasks based on the current filter.
 * Uses a DocumentFragment for efficient DOM manipulation.
 */
function renderTasks() {
    todoList.innerHTML = ''; // Clear existing tasks

    const fragment = document.createDocumentFragment();

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true; // 'all'
    });

    if (filteredTasks.length === 0 && tasks.length > 0) {
        // Display a message if no tasks match the filter
        const noTasksMessage = document.createElement('p');
        noTasksMessage.textContent = `No ${currentFilter} tasks found.`;
        noTasksMessage.classList.add('no-tasks-message');
        todoList.appendChild(noTasksMessage);
        return;
    } else if (tasks.length === 0) {
        const noTasksMessage = document.createElement('p');
        noTasksMessage.textContent = `No tasks yet. Add one above!`;
        noTasksMessage.classList.add('no-tasks-message');
        todoList.appendChild(noTasksMessage);
        return;
    }


    filteredTasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.classList.add('todo-item');
        listItem.dataset.id = task.id; // Store ID for easy access
        if (task.completed) {
            listItem.classList.add('completed');
        }

        listItem.innerHTML = `
            <input type="checkbox" data-action="complete" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <button class="delete-btn" data-action="delete" aria-label="Delete task">
                <i class="fas fa-trash-alt" data-action="delete"></i>
            </button>
        `;
        fragment.appendChild(listItem);
    });

    todoList.appendChild(fragment);
}


/**
 * Clears all completed tasks from the list.
 */
function clearCompletedTasks() {
    // Select all completed task elements
    const completedTaskElements = $$('.todo-item.completed');

    if (completedTaskElements.length === 0) {
        animateButtonShake(clearCompletedBtn);
        return;
    }

    // Apply fade-out animation to each
    let animationsCompleted = 0;
    const totalAnimations = completedTaskElements.length;

    if (totalAnimations === 0) {
        // Handle case where there are no completed tasks to clear
        tasks = tasks.filter(task => !task.completed);
        saveTasksToLocalStorage();
        renderTasks();
        return;
    }

    completedTaskElements.forEach(element => {
        element.classList.add('fade-out');
        element.addEventListener('animationend', () => {
            animationsCompleted++;
            if (animationsCompleted === totalAnimations) {
                // Once all animations are done, update state and re-render
                tasks = tasks.filter(task => !task.completed);
                saveTasksToLocalStorage();
                renderTasks();
            }
        }, {
            once: true
        });
    });
}


/**
 * Sorts tasks alphabetically by their text content.
 */
function sortTasksAlphabetically() {
    tasks.sort((a, b) => a.text.localeCompare(b.text));
    saveTasksToLocalStorage();
    renderTasks();
    animateButtonShake(sortTasksBtn);
}

/**
 * Toggles between light and dark themes.
 */
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    animateButtonPulse(themeToggle); // Animate the theme toggle button
}

/**
 * Applies the stored theme on initial load.
 */
function applyInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

/**
 * Animates the task input field to indicate an error.
 * @param {HTMLInputElement} element - The input element to animate.
 */
function animateInputError(element) {
    element.classList.add('error-shake');
    element.addEventListener('animationend', () => {
        element.classList.remove('error-shake');
    }, {
        once: true
    });
}

/**
 * Animates a button with a shake effect.
 * @param {HTMLButtonElement} element - The button element to animate.
 */
function animateButtonShake(element) {
    element.classList.add('shake');
    element.addEventListener('animationend', () => {
        element.classList.remove('shake');
    }, {
        once: true
    });
}

/**
 * Animates a button with a pulse effect.
 * @param {HTMLButtonElement} element - The button element to animate.
 */
function animateButtonPulse(element) {
    element.classList.add('pulse');
    element.addEventListener('animationend', () => {
        element.classList.remove('pulse');
    }, {
        once: true
    });
}