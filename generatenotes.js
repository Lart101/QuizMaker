import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY; 
const genAI = new GoogleGenerativeAI(API_KEY);
let chat;

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
];
async function generateNotes(topic, retries = 3) {
    try {
        console.log("Generating notes for topic:", topic);

        // Initialize chat if not already done
        if (!chat) {
            chat = await genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings }).startChat({
                history: [{
                    role: "user",
                    parts: [{
                        text: `You are a knowledgeable assistant with expertise in capturing and summarizing information in a clear and organized manner. 
                        Your task is to generate detailed notes on the topic: **${topic}**. 

                        Follow this format strictly and DO NOT ADD any additional text outside of this format:
                        1. **Title of the Notes**: [Insert a clear, concise title]
                        2. **Introduction**: [Provide an overview of the topic]
                        3. **Key Points**:
                            - [List key definitions, theories, or concepts]
                            - [Highlight significant arguments or discussions]
                        4. **Examples or Case Studies**:
                            - [Provide examples or case studies]
                        5. **Conclusion**:
                            - [Summarize key takeaways and implications]

                        Here's an example format:
                        1. **Title of the Notes**: Introduction to AI
                        2. **Introduction**: AI refers to the simulation of human intelligence...
                        3. **Key Points**:
                            - Machine Learning: A subset of AI that allows computers to learn from data...
                            - Neural Networks: A key technique for enabling deep learning...
                        4. **Examples or Case Studies**:
                            - Case Study: Google's use of AI in search optimization...
                        5. **Conclusion**: AI is an evolving field...`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.9,
                    maxOutputTokens: 2048,
                    responseMimeType: "text/plain",
                },
            });
        }

        const result = await chat.sendMessage(`Generate detailed notes on the topic: ${topic}.`);
        const response = result.response;

        if (response && response.text) {
            const notesText = await response.text();
            console.log("Notes text received:", notesText);
            displayNotes(notesText);
        } else {
            displayError("This content is not safe for display based on current settings.", 'notes-output');
        }
    } catch (error) {
        console.error("Error generating notes:", error);
        if (error.message.includes("429")) {
            if (retries > 0) {
                console.log(`Rate limit hit. Retrying... (${3 - retries + 1} of 3)`);
                await new Promise(res => setTimeout(res, 2000)); // Wait before retrying
                return generateNotes(topic, retries - 1);
            }
            displayError("Rate limit exceeded. Please try again later.", 'notes-output');
        } else {
            displayError("An error occurred while generating the notes.", 'notes-output');
        }
    }
}

function displayNotes(notesText) {
    const notesOutput = document.getElementById('notes-output');
    notesOutput.innerHTML = ""; // Clear previous content

    // Create container for the notes
    const notesContainer = document.createElement('div');
    notesContainer.style.padding = '30px'; // Increased padding for a spacious feel
    notesContainer.style.backgroundColor = '#f9f9f9';
    notesContainer.style.borderRadius = '8px';
    notesContainer.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)'; // Slightly heavier shadow for depth
    notesContainer.style.lineHeight = '1.8'; // Increased line height for better readability
    notesContainer.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    notesContainer.style.color = '#333'; // Standard text color

    // Split the notes into lines
    const lines = notesText.split('\n').filter(line => line.trim() !== "");
    let currentList = null; // For managing lists

    lines.forEach(line => {
        const normalizedLine = line.toLowerCase().trim();

        // Handle Title of the Notes
        if (normalizedLine.startsWith('title of the notes:') || normalizedLine.startsWith('title:')) {
            const titleElement = document.createElement('h2');
            titleElement.textContent = line.replace(/(title of the notes:|title:)/i, '').trim();
            titleElement.style.color = '#2b8ad9';
            titleElement.style.borderBottom = '3px solid #2b8ad9'; // Underline for emphasis
            titleElement.style.marginBottom = '20px'; // More space below the title
            titleElement.style.fontSize = '24px'; // Larger font for the title
            notesContainer.appendChild(titleElement);

        // Handle Introduction
        } else if (normalizedLine.startsWith('introduction:') || normalizedLine.startsWith('intro:')) {
            const introParagraph = document.createElement('p');
            introParagraph.innerHTML = `<strong>Introduction:</strong> ${line.replace(/(introduction:|intro:)/i, '').trim()}`;
            introParagraph.style.marginBottom = '20px'; // Increased space below the intro
            notesContainer.appendChild(introParagraph);

        // Handle Key Points
        } else if (normalizedLine.startsWith('key points:')) {
            const heading = document.createElement('h3');
            heading.textContent = 'Key Points';
            heading.style.marginTop = '30px'; // More space above key points
            heading.style.color = '#333';
            heading.style.fontSize = '20px'; // Slightly larger font for headings
            notesContainer.appendChild(heading);

            currentList = document.createElement('ul'); // Start a new list for key points
            currentList.style.paddingLeft = '20px';
            currentList.style.marginBottom = '20px'; // Space below the list
            notesContainer.appendChild(currentList);

        // Handle list items under Key Points
        } else if (normalizedLine.startsWith('-') && currentList) {
            const listItem = document.createElement('li');
            listItem.innerHTML = line.replace('-', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').trim(); // Bold list items
            listItem.style.marginBottom = '10px'; // Space between list items
            currentList.appendChild(listItem);

        // Handle Examples or Case Studies
        } else if (normalizedLine.startsWith('examples or case studies:') || normalizedLine.startsWith('examples:') || normalizedLine.startsWith('case studies:')) {
            const heading = document.createElement('h3');
            heading.textContent = 'Examples or Case Studies';
            heading.style.marginTop = '30px'; // More space above examples
            heading.style.color = '#333';
            heading.style.fontSize = '20px';
            notesContainer.appendChild(heading);

            currentList = document.createElement('ul'); // Start a new list for examples
            currentList.style.paddingLeft = '20px';
            currentList.style.marginBottom = '20px'; // Space below the list
            notesContainer.appendChild(currentList);

        // Handle list items under Examples or Case Studies
        } else if (normalizedLine.startsWith('-') && currentList) {
            const listItem = document.createElement('li');
            listItem.innerHTML = line.replace('-', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').trim(); // Bold list items
            listItem.style.marginBottom = '10px'; // Space between list items
            currentList.appendChild(listItem);

        // Handle Conclusion
        } else if (normalizedLine.startsWith('conclusion:') || normalizedLine.startsWith('summary:')) {
            const heading = document.createElement('h3');
            heading.textContent = 'Conclusion';
            heading.style.marginTop = '30px'; // More space above conclusion
            heading.style.color = '#333';
            heading.style.fontSize = '20px';
            notesContainer.appendChild(heading);

            const conclusionParagraph = document.createElement('p');
            conclusionParagraph.innerHTML = `<strong>Conclusion:</strong> ${line.replace(/(conclusion:|summary:)/i, '').trim()}`;
            conclusionParagraph.style.marginBottom = '20px'; // Increased space below the conclusion
            notesContainer.appendChild(conclusionParagraph);

        // Fallback for additional text
        } else {
            const paragraph = document.createElement('p');
            paragraph.innerHTML = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').trim(); // Replace asterisks with <strong> tags
            paragraph.style.marginBottom = '15px'; // Space below paragraphs
            notesContainer.appendChild(paragraph);
        }
    });

    // Append the formatted notes to the output
    notesOutput.appendChild(notesContainer);
}

function displayError(message, outputElementId) {
    const errorElement = document.getElementById(outputElementId);
    errorElement.innerHTML = `<span style="color: red; font-weight: bold;">${message}</span>`;
}

// Event listener for the Generate Notes button
document.getElementById('generate-notes-btn').addEventListener('click', () => {
    const topic = document.getElementById('notes-input').value.trim();

    if (topic) {
        generateNotes(topic);
    } else {
        alert("Please enter a topic before generating notes.");
    }
});
