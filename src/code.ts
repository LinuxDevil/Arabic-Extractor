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

const toJSONNode = (originalText) => {
    if (originalText.length > 20) {
        originalText = originalText.substring(0, 20);
    }
    return originalText.toLocaleLowerCase().split(' ').join('_');
}

const getUniqueFonts = (textNode) => {
    const foundFonts = [];
    const len = textNode.characters.length;

    for (let i = 0; i < len; i++) {
        const fontName = textNode.getRangeFontName(i, i + 1);
        if (!foundFonts.some(f => f.family === fontName.family && f.style === fontName.style)) {
            foundFonts.push(fontName);
        }
    }

    return foundFonts;
};

const loadFonts = async (foundFonts) => {
    const fontPromises = foundFonts.map(f => figma.loadFontAsync(f));
    await Promise.all(fontPromises);
};

const setTextAndAlignment = (textNode, text) => {
    textNode.characters = text;
    textNode.textAlignHorizontal = 'RIGHT';
};

const setTextOfNode = async (textNode, text) => {
    if (textNode.hasMissingFont) {
        throw "<missing font error goes here>";
    }

    const foundFonts = getUniqueFonts(textNode);
    await loadFonts(foundFonts);
    setTextAndAlignment(textNode, text);

    return textNode;
};

const duplicateNodeAndPosition = (node) => {
    const duplicatedNode = node.clone();
    duplicatedNode.name = `${node.name} - Arabic`;
    duplicatedNode.x += node.width + 50;
    return duplicatedNode;
};

const processChildNodes = async (childNode, apiKey, json) => {
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
};

const processChildNodeCharacters = async (childNodeChild, apiKey, json) => {
    if (childNodeChild.characters) {
        const originalText = childNodeChild.characters;
        const translatedText = await translateText(originalText, apiKey);

        await setTextOfNode(childNodeChild, translatedText);
        json[toJSONNode(originalText)] = translatedText;
    }
};

const processChildNodes = async (childNode, apiKey, json) => {
    if (childNode.children) {
        const childNodeChildren = childNode.children;
        for (const childNodeChild of childNodeChildren) {
            await processChildNodeCharacters(childNodeChild, apiKey, json);
        }
    }
};


const postTranslationsAndHandleResponse = async (json) => {
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

    setTimeout(figma.closePlugin, 1000);
};

async function processFrameAndDuplicate(node, apiKey) {
    try {
        const duplicatedNode = duplicateNodeAndPosition(node);
        const children = duplicatedNode.children;
        const json = {};

        for (const childNode of children) {
            await processChildNodes(childNode, apiKey, json);
            await processNodeCharacters(childNode, apiKey, json);
        }

        await postTranslationsAndHandleResponse(json);
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



