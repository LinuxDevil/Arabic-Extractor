# Arabic Extractor Plugin for Figma

Arabic Extractor is a Figma plugin that simplifies working with Arabic content in Figma designs. It allows you to automatically duplicate your design frames, translate text content into Arabic, rearrange the layout for right-to-left reading, and export the translated text as a JSON file using an Express server.

## Features

- Effortlessly duplicate your design frames
- Seamlessly translate text content into Arabic
- Rearrange the layout to accommodate right-to-left reading
- Export the translated text as a JSON file for hassle-free management

## Installation

1. Download and install the Arabic Extractor Plugin from the Figma Plugin store.
2. Clone this repository and navigate to the project folder.
3. Run `npm install` to install the required dependencies.
4. Start the Express server by running `node app.js`.

## Usage

1. Select the frame you wish to convert in Figma.
2. Launch the Arabic Extractor plugin.
3. Watch the plugin duplicate your frame, translate the text, and adjust the layout.
4. Click the "Translate design and export JSON" button to send a request to the Express server.
5. The server will save the JSON file and provide a download link.

## Express Server

The Express server is responsible for receiving the translated content and exporting it as a JSON file. To use the server, follow the steps below:

1. Ensure that the server is running by executing `node app.js`.
2. The server will listen on `http://localhost:3000` by default.
3. When you click the "Translate design and export JSON" button in the Figma plugin, the server will receive the translated content and save it as a JSON file in the `public` folder.
4. The server will provide a download link to access the JSON file.

## Contributing

We welcome contributions to improve the Arabic Extractor plugin. Please submit any bug reports, feature requests, or general feedback as an issue on this repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
