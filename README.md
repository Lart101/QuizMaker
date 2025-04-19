# QuizMaker

QuizMaker is an AI-powered tool designed to help users generate quizzes, flashcards, notes, and summaries from any text input. This tool is perfect for students, educators, and anyone looking to enhance their learning experience.

## Features
- **Generate Quizzes**: Create quizzes based on the provided text.
- **Generate Flashcards**: Turn key points into flashcards for easy memorization.
- **Generate Notes**: Summarize text into concise notes.
- **Generate Summaries**: Get a quick overview of any text.

## How to Use
1. Clone this repository to your local machine.
2. Open the `index.html` file in your browser to access the tool's interface.
3. Use the respective buttons to generate quizzes, flashcards, notes, or summaries by providing the required text input.

## API Setup
This application requires two API keys to function properly:

### 1. Google Gemini API Key
QuizMaker uses the Gemini API for generating quiz content. Follow these steps to set it up:

1. **Sign Up for Gemini API**:
   - Visit the [Google AI Studio](https://aistudio.google.com/apikey)
   - Create an account if you don't already have one

2. **Get Your Gemini API Key**:
   - Navigate to the API section in your account dashboard
   - Generate an API key and copy it

### 2. OCR.space API Key
QuizMaker uses OCR.space for processing images and PDFs. Follow these steps:

1. **Sign Up for OCR.space**:
   - Visit [OCR.space](https://ocr.space/ocrapi)
   - Register for a free API key

2. **Get Your OCR API Key**:
   - After registration, you'll receive your API key via email
   - Copy the API key for configuration

### Configuring API Keys
Both API keys need to be added to the `config.js` file:

1. Open the `config.js` file in the project directory
2. Add both API keys in this format:
   ```javascript
   export const API_KEY = 'your_gemini_api_key_here';
   export const OCR_API_KEY = 'your_ocr_api_key_here';
   ```
3. Replace the placeholder values with your actual API keys

## Prerequisites
- A modern web browser (e.g., Chrome, Firefox, Edge)
- Internet connection for API access
- Valid API keys for both Gemini and OCR.space services

## Folder Structure
- `index.html`: Main interface for the tool
- `config.js`: Configuration file for API keys

## Contributing
Contributions are welcome! Feel free to fork this repository and submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Support
If you encounter any issues or have questions, please contact support at [support@google.com](mailto:support@google.com).