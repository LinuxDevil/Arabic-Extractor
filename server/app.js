const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

const saveJsonToFile = async (jsonContent, filePath) => {
    const jsonString = JSON.stringify(jsonContent, null, 2); // Format JSON with 2-space indentation

    await fs.writeFile(filePath, jsonString, 'utf8', (error) => {
        if (error) {
            console.error('Failed to save JSON content:', error);
        } else {
            console.log('JSON content saved to data.json');
        }
    });
}

app.post('/translate', async (req, res) => {
    try {
        const file = req.body;
        const fileName = Math.random().toString(36).substring(7) + new Date().toTimeString() + '.json';
        const downloadUrl = 'http://localhost:3000/' + fileName;
        await saveJsonToFile(file, 'public/' + fileName);

        res.status(200).send({
            downloadUrl: downloadUrl
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: error
        });
    });

app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on port 3000');
});