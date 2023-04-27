// @ts-nocheck
figma.showUI(__html__, { width: 300, height: 150 });

async function translateText(text, apiKey) {
    const apiUrl = 'https://translation.googleapis.com/language/translate/v2';
    const sourceLang = 'en';
    const targetLang = 'ar';

    const response = await fetch(`${apiUrl}?key=${apiKey}&q=${encodeURIComponent(text)}&source=${sourceLang}&target=${targetLang}`);
    const data = await response.json();

    return data.data.translations[0].translatedText;
}

function arrayBufferToBase64(buffer) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const bytes = new Uint8Array(buffer);
    let base64 = '';

    for (let i = 0; i < bytes.byteLength; i += 3) {
        const a = bytes[i];
        const b = bytes[i + 1];
        const c = bytes[i + 2];

        const index1 = a >> 2;
        const index2 = ((a & 3) << 4) | (b >> 4);
        const index3 = isNaN(b) ? 64 : ((b & 15) << 2) | (c >> 6);
        const index4 = isNaN(b) || isNaN(c) ? 64 : c & 63;

        base64 += chars[index1] + chars[index2] + chars[index3] + chars[index4];
    }

    return base64;
}


async function exportFrameAsImage(frame) {
    const imageData = await frame.exportAsync({ format: 'PNG' });
    const base64Data = arrayBufferToBase64(imageData);
    return `data:image/png;base64,${base64Data}`;
}

async function processFrame(frame, apiKey) {
    const texts = frame.findAll((n) => n.type === 'TEXT');
    const textData = [];

    for (const textNode of texts) {
        const translation = await translateText(textNode.characters, apiKey);

        textData.push({ text: textNode.characters, translation });
    }

    return textData;
}

const toJSONNode = (originalText) => {
    if (originalText.length > 20) {
        originalText = originalText.substring(0, 20);
    }
    return originalText.toLocaleLowerCase().split(' ').join('_');
}

const setTextOfNode = async (textNode, text) => {
    if (textNode.hasMissingFont) {
        throw "<missing font error goes here>";
    }
    const foundFonts = [];
    const len = textNode.characters.length;

    for (let i = 0; i < len; i++) {
        const fontName = textNode.getRangeFontName(i, i + 1);
        if (foundFonts.find(f => f.family === fontName.family && f.style === fontName.style) === undefined) {
            foundFonts.push(fontName);
        }
    }

    const fontPromises = foundFonts.map(f => figma.loadFontAsync(f));
    await Promise.all(fontPromises).then(() => {
        textNode.characters = text;
        textNode.textAlignHorizontal = 'RIGHT';
    });
    return textNode;
}

async function processFrameAndDuplicate(node, apiKey) {
    try {
        const duplicatedNode = node.clone();
        duplicatedNode.name = `${node.name} - Arabic`;
        duplicatedNode.x += node.width + 50;

        const children = duplicatedNode.children;
        const json = {};

        for (const childNode of children) {

            if (childNode.children) {
                const childNodeChildren = childNode.children;
                for (const childNodeChild of childNodeChildren) {
                    if (childNodeChild.characters) {
                        const originalText = childNodeChild.characters;
                        const translatedText = await translateText(originalText, apiKey);

                        await setTextOfNode(childNodeChild, translatedText);
                        json[toJSONNode(originalText)] = translatedText;
                    }
                }
            }
            if (childNode.characters) {
                const originalText = childNode.characters;
                const translatedText = await translateText(originalText, apiKey);

                setTextOfNode(childNode, translatedText);
                json[toJSONNode(originalText)] = translatedText;
            }
        }

        const result = await fetch('http://localhost:3000/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file: json }),
        });

        const data = await result.json();
        figma.ui.postMessage({ type: 'copy-to-clipboard', text: data.downloadUrl });

        const openLinkUIString = `<script>window.open('${data.downloadUrl}','_blank');</script>`
        figma.showUI(openLinkUIString, { visible: false })

        setTimeout(figma.closePlugin, 1000)
        figma.currentPage.appendChild(duplicatedNode);
    } catch (e) {
        figma.ui.postMessage({ type: 'error', error: e });
    }
}

figma.ui.onmessage = async (msg) => {
    if (msg.type === 'duplicate-and-translate') {
        const apiKey = msg.apiKey;

        for (const node of figma.currentPage.selection) {
            if (node.type === 'FRAME') {
                await processFrameAndDuplicate(node, apiKey);
            }
        }

    }
};



