'use strict';
const jsonInput = document.getElementById('jsonInput');


jsonInput.addEventListener('input', formatJSON);


function formatJSON() {
    const jsonInputValue = jsonInput.value;
    try {
        const parsedJSON = JSON.parse(jsonInputValue);
        const formattedJSON = JSON.stringify(parsedJSON, null, 2);
        document.getElementById('jsonOutput').innerText = formattedJSON;
    } catch (error) {
        document.getElementById('jsonOutput').innerText = 'Invalid JSON: ' + error.message;
    }
}

function clearJSON() {
    document.getElementById('jsonInput').value = '';
    document.getElementById('jsonOutput').innerText = '';
}

// Define the copyToClipboard function
function copyToClipboard(jsonOutput, callback) {
    if (jsonOutput.textContent === '') {
        if (callback) {
            callback(false, 'JSON output is empty');
        }
        return;
    }
    const range = document.createRange();
    range.selectNode(jsonOutput);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    try {
        const successful = document.execCommand('copy');
        const message = successful ? 'JSON copied to clipboard' : 'Unable to copy JSON';
        console.log(message);

        if (callback) {
            callback(successful, message);
        }
    } catch (err) {
        console.error('Unable to copy JSON: ', err);

        if (callback) {
            callback(false, 'Unable to copy JSON: ' + err);
        }
    }

    window.getSelection().removeAllRanges();
}

document.getElementById('copyJsonButton').addEventListener('click', function () {
    copyToClipboard(document.getElementById('jsonOutput'), function (successful, message) {
        if (successful) {
            displayPopup('JSON copied to clipboard!');
        } else {
            displayPopup('Error: ' + message);
        }
    });
});

function displayPopup(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');

    popup.style.display = 'block';
    popupMessage.textContent = message;


    document.getElementById('close-popup').addEventListener('click', function () {
        popup.style.display = 'none';
    });


    window.addEventListener('click', function (event) {
        if (event.target == popup) {
            popup.style.display = 'none';
        }
    });
}