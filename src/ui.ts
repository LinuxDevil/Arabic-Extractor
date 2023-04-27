import './styles/ui.scss';

const apiKeyInput = document.getElementById('apiKey');
const exportButton = document.getElementById('export');

exportButton.onclick = () => {
    const apiKey = apiKeyInput.value;
    if (apiKey) {
        parent.postMessage({ pluginMessage: { type: 'duplicate-and-translate', apiKey } }, '*');
    } else {
        alert('Please enter a valid API key.');
    }
};

window.onmessage = async (event) => {
    const msg = event.data.pluginMessage;
    if (msg.type === 'copy-to-clipboard') {
        await navigator.clipboard.writeText(msg.text);
    }
};
