'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('jsonInput');
    const jsonOutput = document.getElementById('jsonOutput');
    const copyJsonButton = document.getElementById('copyJsonButton');
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    const closePopupButton = document.getElementById('close-popup');

    // Format JSON on input
    jsonInput.addEventListener('input', formatJSON);

    // Clear JSON input and output
    document.getElementById('clearJsonButton').addEventListener('click', clearJSON);

    // Copy JSON to clipboard
    copyJsonButton.addEventListener('click', () => {
        if (jsonOutput.textContent === '') {
            displayPopup('JSON output is empty');
            return;
        }

        navigator.clipboard.writeText(jsonOutput.textContent)
            .then(() => displayPopup('JSON copied to clipboard!'))
            .catch(err => displayPopup('Error: Unable to copy JSON'));
    });

    // Display popup with message
    function displayPopup(message) {
        popup.style.display = 'block';
        popupMessage.textContent = message;
    }

    // Close popup on click
    closePopupButton.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // Close popup when clicking outside of it
    window.addEventListener('click', event => {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });

    function formatJSON() {
        const jsonInputValue = jsonInput.value;
        try {
            const parsedJSON = JSON.parse(jsonInputValue);
            const formattedTreeView = createTreeView(parsedJSON, true);
            jsonOutput.innerHTML = '';
            jsonOutput.appendChild(formattedTreeView);
        } catch (error) {
            jsonOutput.innerText = 'Invalid JSON: ' + error.message;
        }
    }

    function clearJSON() {
        jsonInput.value = '';
        jsonOutput.innerText = '';
    }

    function createTreeView(obj, isRoot = false) {
        const ul = document.createElement('ul');
        ul.classList.add('tree-view');

        Object.keys(obj).forEach(key => {
            const li = document.createElement('li');
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                const span = document.createElement('span');
                span.textContent = key;
                span.classList.add('toggle');
                span.addEventListener('click', () => {
                    span.classList.toggle('open');
                    childUl.classList.toggle('hidden');
                });

                const childUl = createTreeView(obj[key]);
                if (isRoot) {
                    span.classList.add('open');
                } else {
                    childUl.classList.add('hidden');
                }
                li.appendChild(span);
                li.appendChild(childUl);
            } else {
                li.textContent = `${key}: ${obj[key]}`;
            }
            ul.appendChild(li);
        });

        return ul;
    }
});
