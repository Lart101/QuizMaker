
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

const API_KEY = 'AIzaSyCW-qGbbyLBerWcUMUu-mAa7-NnSfSrFpc'; 
const genAI = new GoogleGenerativeAI(API_KEY);
let chat;

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
];

async function generateFlashcards(topic, count, retries = 3) {
    try {
        console.log("Generating flashcards for topic:", topic, "Count:", count);

        // Initialize chat if not already done
        if (!chat) {
            chat = await genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings }).startChat({
                history: [{
                    role: "user",
                    parts: [{
                        text: `You are a knowledgeable assistant. Generate ${count} flashcards for the topic: **${topic}**. 
                        For each flashcard, provide a clear question on the front and the answer on the back. 
                        Format:
                     ## Flashcard 1:
* Question: What is the main objective of League of Legends?
* Answer: The main objective is to destroy the enemy Nexus, a structure located in the heart of their base.

## Flashcard 2:
* Question: What are the three main roles in League of Legends?
* Answer: The three main roles are Top Lane, Jungle, Mid Lane, Bottom Lane (ADC & Support).

## Flashcard 3:
* Question: What is a "ward" in League of Legends?
* Answer: A ward is a consumable item that provides vision of a specific area on the map, revealing enemy champions and wards.
`
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

        const result = await chat.sendMessage(`Generate ${count} flashcards for the topic: ${topic}.`);
        const response = result.response;

        if (response && response.text) {
            const flashcardsText = await response.text();
            console.log("Flashcards text received:", flashcardsText);
            displayFlashcards(flashcardsText);
        } else {
            displayError("This content is not safe for display based on current settings.", 'flashcard-output');
        }
    } catch (error) {
        console.error("Error generating flashcards:", error);
        if (error.message.includes("429")) {
            if (retries > 0) {
                console.log(`Rate limit hit. Retrying... (${3 - retries + 1} of 3)`);
                await new Promise(res => setTimeout(res, 2000)); // Wait before retrying
                return generateFlashcards(topic, count, retries - 1);
            }
            displayError("Rate limit exceeded. Please try again later.", 'flashcard-output');
        } else {
            displayError("An error occurred while generating the flashcards.", 'flashcard-output');
        }
    }
}

function displayFlashcards(flashcardsText) {
    const flashcardOutput = document.getElementById('flashcard-output');
    flashcardOutput.innerHTML = ""; // Clear previous content

    // Create a container for the flashcards
    const flashcardRow = document.createElement('div');
    flashcardRow.style.display = 'flex'; // Use flexbox for row layout
    flashcardRow.style.flexWrap = 'wrap'; // Allow wrapping to new rows
    flashcardRow.style.justifyContent = 'space-around'; // Distribute space evenly
    flashcardRow.style.marginBottom = '20px'; // Space between rows

    // Split the text into individual flashcards based on the flashcard markers
    const flashcards = flashcardsText.split(/## Flashcard \d+:/).filter(card => card.trim() !== "");

    flashcards.forEach((flashcardText, index) => {
        // Create container for the flashcard
        const flashcardContainer = document.createElement('div');
        flashcardContainer.className = 'flashcard';

        // Extract question and answer using regex
        const questionMatch = flashcardText.match(/Question\s*:\s*(.*?)\s*Answer\s*:\s*/s);
        const answerMatch = flashcardText.match(/Answer\s*:\s*(.*?)(?=\s*$)/s);

        const question = questionMatch ? questionMatch[1].trim() : 'N/A';
        const answer = answerMatch ? answerMatch[1].trim() : 'N/A';

        // Create the front side of the flashcard
        const front = document.createElement('div');
        front.className = 'flashcard-front';
        front.innerHTML = `<strong>Flashcard ${index + 1}:</strong><br>Question: ${question}`;

        // Create the back side of the flashcard
        const back = document.createElement('div');
        back.className = 'flashcard-back';
        back.innerHTML = `<strong>Answer:</strong> ${answer}`;

        // Append the front and back to the container
        flashcardContainer.appendChild(front);
        flashcardContainer.appendChild(back);

        // Add click event to flip the card
        flashcardContainer.addEventListener('click', () => {
            flashcardContainer.classList.toggle('flipped');
        });

        // Append the flashcard container to the row
        flashcardRow.appendChild(flashcardContainer);
    });

    // Append the row to the output element
    flashcardOutput.appendChild(flashcardRow);
}










// Event listener for the Generate Flashcards button
document.getElementById('generate-flashcard-btn').addEventListener('click', () => {
    const topic = document.getElementById('flashcard-input').value.trim();
    const count = parseInt(document.getElementById('flashcard-count').value, 10); // Use base 10

    if (topic && count > 0 && count <= 12) {
        generateFlashcards(topic, count);
    } else {
        alert("Please enter a valid topic and a number between 1 and 12.");
    }
});

function displayError(message, elementId) {
    const outputElement = document.getElementById(elementId);
    outputElement.innerHTML = `<div style="color: red; font-weight: bold;">${message}</div>`;
}
