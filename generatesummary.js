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

async function generateSummary(topic, retries = 3) {
    try {
        console.log("Generating summary for topic:", topic);

        // Initialize chat if not already done
        if (!chat) {
            chat = await genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings }).startChat({
                history: [{
                    role: "user",
                    parts: [{
                        text: `You are a knowledgeable assistant with expertise in capturing and summarizing information in a clear and organized manner. 
                        Your task is to generate a detailed summary on the topic: **${topic}**. 

                        Follow this format strictly and DO NOT ADD any additional text outside of this format:
                        1. **Title of the Summary**: [Insert a clear, concise title]
                        2. **Introduction**: [Provide an overview of the topic]
                        3. **Key Points**:
                            - [List key definitions, theories, or concepts]
                            - [Highlight significant arguments or discussions]
                        4. **Examples or Case Studies**:
                            - [Provide examples or case studies]
                        5. **Conclusion**:
                            - [Summarize key takeaways and implications]

                        Here's an example format:
                        1. **Title of the Summary**: Introduction to AI
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

        const result = await chat.sendMessage(`Generate detailed summary on the topic: ${topic}.`);
        const response = result.response;

        if (response && response.text) {
            const summaryText = await response.text();
            console.log("Summary text received:", summaryText);
            displaySummary(summaryText);
        } else {
            displayError("This content is not safe for display based on current settings.", 'summary-output');
        }
    } catch (error) {
        console.error("Error generating summary:", error);
        if (error.message.includes("429")) {
            if (retries > 0) {
                console.log(`Rate limit hit. Retrying... (${3 - retries + 1} of 3)`);
                await new Promise(res => setTimeout(res, 2000)); // Wait before retrying
                return generateSummary(topic, retries - 1);
            }
            displayError("Rate limit exceeded. Please try again later.", 'summary-output');
        } else {
            displayError("An error occurred while generating the summary.", 'summary-output');
        }
    }
}

function displaySummary(summaryText) {
    const summaryOutput = document.getElementById('summary-output');
    summaryOutput.innerHTML = ""; // Clear previous content

    // Create container for the summary
    const summaryContainer = document.createElement('div');
    summaryContainer.style.padding = '30px'; // Increased padding for a spacious feel
    summaryContainer.style.backgroundColor = '#f9f9f9';
    summaryContainer.style.borderRadius = '8px';
    summaryContainer.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)'; // Slightly heavier shadow for depth
    summaryContainer.style.lineHeight = '1.8'; // Increased line height for better readability
    summaryContainer.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    summaryContainer.style.color = '#333'; // Standard text color

    // Split the summary into lines
    const lines = summaryText.split('\n').filter(line => line.trim() !== "");
    let currentList = null; // For managing lists

    lines.forEach(line => {
        const normalizedLine = line.toLowerCase().trim();

        // Handle Title of the Summary
        if (normalizedLine.startsWith('title of the summary:') || normalizedLine.startsWith('title:')) {
            const titleElement = document.createElement('h2');
            titleElement.textContent = line.replace(/(title of the summary:|title:)/i, '').trim();
            titleElement.style.color = '#2b8ad9';
            titleElement.style.borderBottom = '3px solid #2b8ad9'; // Underline for emphasis
            titleElement.style.marginBottom = '20px'; // More space below the title
            titleElement.style.fontSize = '24px'; // Larger font for the title
            summaryContainer.appendChild(titleElement);

        // Handle Introduction
        } else if (normalizedLine.startsWith('introduction:') || normalizedLine.startsWith('intro:')) {
            const introParagraph = document.createElement('p');
            introParagraph.innerHTML = `<strong>Introduction:</strong> ${line.replace(/(introduction:|intro:)/i, '').trim()}`;
            introParagraph.style.marginBottom = '20px'; // Increased space below the intro
            summaryContainer.appendChild(introParagraph);

        // Handle Key Points
        } else if (normalizedLine.startsWith('key points:')) {
            const heading = document.createElement('h3');
            heading.textContent = 'Key Points';
            heading.style.marginTop = '30px'; // More space above key points
            heading.style.color = '#333';
            heading.style.fontSize = '20px'; // Slightly larger font for headings
            summaryContainer.appendChild(heading);

            currentList = document.createElement('ul'); // Start a new list for key points
            currentList.style.paddingLeft = '20px';
            currentList.style.marginBottom = '20px'; // Space below the list
            summaryContainer.appendChild(currentList);

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
            summaryContainer.appendChild(heading);

            currentList = document.createElement('ul'); // Start a new list for examples
            currentList.style.paddingLeft = '20px';
            currentList.style.marginBottom = '20px'; // Space below the list
            summaryContainer.appendChild(currentList);

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
            summaryContainer.appendChild(heading);

            const conclusionParagraph = document.createElement('p');
            conclusionParagraph.innerHTML = `<strong>Conclusion:</strong> ${line.replace(/(conclusion:|summary:)/i, '').trim()}`;
            conclusionParagraph.style.marginBottom = '20px'; // Increased space below the conclusion
            summaryContainer.appendChild(conclusionParagraph);

        // Fallback for additional text
        } else {
            const paragraph = document.createElement('p');
            paragraph.innerHTML = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').trim(); // Replace asterisks with <strong> tags
            paragraph.style.marginBottom = '15px'; // Space below paragraphs
            summaryContainer.appendChild(paragraph);
        }
    });

    // Append the summary container to the output element
    summaryOutput.appendChild(summaryContainer);
}
// Event listener for the Generate Notes button
document.getElementById('generate-summary-btn').addEventListener('click', () => {
    const topic = document.getElementById('summary-input').value.trim();

    if (topic) {
        generateSummary(topic);
    } else {
        alert("Please enter a topic before generating summary.");
    }
});

function displayError(message, elementId) {
    const outputElement = document.getElementById(elementId);
    outputElement.innerHTML = `<div style="color: red; font-weight: bold;">${message}</div>`;
}
