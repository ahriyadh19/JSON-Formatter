// Add theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';

document.body.setAttribute('data-theme', currentTheme);
themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';

themeToggle.addEventListener('click', () => {
    const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.innerHTML = newTheme === 'dark'
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
});

// Improved formatJSON with loading state
// Enhanced tree view with syntax highlighting
// Update the createTreeView function with proper toggle handling
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

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        copyToClipboard();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        pasteFromClipboard();
    }
});

// Actions for format, copy, paste, and clear buttons
async function formatJSON() {
    const jsonInput = document.getElementById('jsonInput');
    const jsonOutput = document.getElementById('jsonOutput');
    const loading = document.getElementById('loading');

    try {
        if (!jsonInput.value) {
            toastr.warning("No JSON to format");
            return;
        }
        loading.style.display = 'block';
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
        const parsed = JSON.parse(jsonInput.value);
        jsonOutput.innerHTML = '';
        jsonOutput.appendChild(createTreeView(parsed, true));
        jsonOutput.style.display = 'block'; // Show the output when data is available
        toastr.success("Formatted JSON successfully");

    } catch (error) {
        toastr.error("Invalid JSON: <br>" + error);
    } finally {
        loading.style.display = 'none';
    }
}

async function copyToClipboard() {
    try {
        const output = document.getElementById('jsonOutput').textContent;
        if (!output) {
            toastr.warning("No JSON to copy");
            return;
        } else {
            await navigator.clipboard.writeText(output);
            toastr.success("Copied to clipboard");
        }
    } catch (error) {
        toastr.error("Failed to copy text: <br>" + error);
    }
}

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
        toastr.error("Failed to paste text: <br>" + error);
    }
}

function clearJSON() {
    const jsonInput = document.getElementById('jsonInput');
    const jsonOutput = document.getElementById('jsonOutput');

    try {
        if (!jsonInput.value && !jsonOutput.textContent) {
            toastr.warning("No JSON to clear");
            return;
        }
        jsonInput.value = '';
        jsonOutput.textContent = '';
        jsonOutput.style.display = 'none'; // Hide the output when cleared
        toastr.success("Cleared JSON");

    } catch (error) {
        toastr.error("Failed to clear JSON: <br>" + error);
    }
}


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
}