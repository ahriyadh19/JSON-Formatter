"use strict";

// Add theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';

document.body.setAttribute('data-theme', currentTheme);
themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';

// Toggle theme and save preference
function toggleTheme() {
    const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.innerHTML = newTheme === 'dark'
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
}

themeToggle.addEventListener('click', toggleTheme);

// Toggle visibility of Expand and Collapse buttons
function toggleButtons() {
    const jsonOutput = document.getElementById('jsonOutput');
    const expandButton = document.getElementById('expandJsonButton');
    const collapseButton = document.getElementById('collapseJsonButton');
    const clearButton = document.getElementById('clearJsonButton');
    const formatButton = document.getElementById('formatJsonButton');
    const jsonInput = document.getElementById('jsonInput');

    expandButton.style.display = jsonOutput.innerHTML.trim() !== '' ? 'inline-block' : 'none';
    collapseButton.style.display = jsonOutput.innerHTML.trim() !== '' ? 'inline-block' : 'none';
    clearButton.style.display = jsonInput.value.trim() !== '' ? 'inline-block' : 'none';
    formatButton.style.display = jsonInput.value.trim() !== '' ? 'inline-block' : 'none';
}

function createTreeView(obj, isRoot = false) {
    const ul = document.createElement('ul');
    ul.className = 'tree-view';

    const isArray = Array.isArray(obj);
    const entries = Object.entries(obj);

    if (!entries.length && typeof obj === 'object') {
        // Handle empty objects/arrays
        const type = isArray ? 'array' : 'object';
        const li = createNode({
            type,
            key: '',
            value: isArray ? '[ ]' : '{ }',
            childCount: 0
        });
        return li.closest('ul') || ul;
    }

    for (const [key, value] of entries) {
        const nodeType = getValueType(value);
        const childCount = nodeType === 'array' ? value.length :
            nodeType === 'object' ? Object.keys(value).length : 0;

        const li = createNode({
            type: nodeType,
            key: isArray ? `[${key}]` : key,
            value: value,
            childCount: childCount,
            isArray: isArray
        });

        ul.appendChild(li);
    }

    return ul;
}

function createNode({ type, key, value, childCount, isArray }) {
    const li = document.createElement('li');
    const container = document.createElement('div');
    container.className = 'node-container';

    const toggle = document.createElement('span');
    toggle.className = 'toggle';

    const keySpan = document.createElement('span');
    keySpan.className = 'key';
    keySpan.textContent = key;

    const valueSpan = document.createElement('span');
    valueSpan.className = 'value';

    if (type === 'object' || type === 'array') {
        // Handle objects/arrays
        toggle.classList.add('toggle-visible');
        valueSpan.innerHTML = `
            <span class="type-indicator ${type}">${type}</span>
            <span class="child-count">(${childCount} items)</span>
        `;

        const childUl = type === 'array' ? createTreeView(value) : createTreeView(value);
        childUl.classList.add('hidden');

        toggle.addEventListener('click', () => {
            toggle.classList.toggle('open');
            childUl.classList.toggle('hidden');
        });

        container.append(toggle, keySpan, valueSpan);
        li.append(container, childUl);
    } else {
        // Handle primitive values
        valueSpan.className = `value ${type}`;
        valueSpan.innerHTML = formatPrimitive(value, type);

        if (key) container.append(keySpan, ': ');
        container.append(valueSpan);
        li.append(container);
    }

    return li;
}

function getValueType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value;
}

function formatPrimitive(value, type) {
    switch (type) {
        case 'string': return `"${value}"`;
        case 'null': return 'null';
        default: return value;
    }
}

// Add keyboard shortcuts for common actions
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        copyToClipboard();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        pasteFromClipboard();
    }
});

// Format JSON input and display output
async function formatJSON() {
    const jsonInput = document.getElementById('jsonInput');
    const jsonOutput = document.getElementById('jsonOutput');
    const loading = document.getElementById('loading');

    try {
        if (!jsonInput.value.trim()) {
            toastr.warning("No JSON to format");
            return;
        }
        loading.style.display = 'block';
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
        const parsed = JSON.parse(jsonInput.value);
        jsonOutput.innerHTML = '';
        jsonOutput.appendChild(createTreeView(parsed, true));
        jsonOutput.style.display = 'block';
        toastr.success("Formatted JSON successfully");
    } catch (error) {
        toastr.error("Invalid JSON: <br>" + error.message);
    } finally {
        loading.style.display = 'none';
    }
    toggleButtons();
}


// Paste JSON from clipboard to input
async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('jsonInput').value = text;
        if (text) {
            toastr.success("Pasted from clipboard");
            formatJSON();
        } else {
            toastr.warning("No text to paste");
        }
    } catch (error) {
        toastr.error("Failed to paste text: <br>" + error.message);
    }
}

// Clear JSON input and output
function clearJSON() {
    const jsonInput = document.getElementById('jsonInput');
    const jsonOutput = document.getElementById('jsonOutput');

    if (!jsonInput.value.trim() && !jsonOutput.textContent.trim()) {
        toastr.warning("No JSON to clear");
        return;
    }
    jsonInput.value = '';
    jsonOutput.textContent = '';
    jsonOutput.style.display = 'none';
    toastr.success("Cleared JSON");
    toggleButtons();
}

// Add event listener for JSON file upload
document.getElementById('jsonFileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            // Validate JSON
            const text = e.target.result;
            JSON.parse(text); // Throws if invalid
            document.getElementById('jsonInput').value = text;
            toastr.success('JSON file loaded');
            formatJSON(); // Automatically format the JSON after loading
        } catch (err) {
            toastr.error('Invalid JSON file');
        }
    };
    reader.onerror = function () {
        toastr.error('Failed to read file');
    };
    reader.readAsText(file);
});

// Expand all JSON nodes
function expandAll() {
    document.querySelectorAll('.toggle-visible').forEach(toggle => {
        toggle.classList.add('open');
        const childUl = toggle.closest('li').querySelector('ul');
        if (childUl) childUl.classList.remove('hidden');
    });
}

// Collapse all JSON nodes
function collapseAll() {
    document.querySelectorAll('.toggle-visible').forEach(toggle => {
        toggle.classList.remove('open');
        const childUl = toggle.closest('li').querySelector('ul');
        if (childUl) childUl.classList.add('hidden');
    });
}

// Initialize button visibility on page load
document.addEventListener('DOMContentLoaded', toggleButtons);

toastr.options = {
    "closeButton": true,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};