import express from "express";
import cors from "cors";
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Mistral } from '@mistralai/mistralai'

const server = express();
const PORT = process.env['PORT'] || 3000

const ApiKey = process.env['API_KEY'];

if (!ApiKey) {
    throw new Error("Provide API_KEY in .env file");
}

const client = new Mistral({ apiKey: ApiKey })

server.use(express.text());
server.use(cors());

server.post('/message', async (req, res) => {
    const userMessage = req.body;
    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const chatResponse = await client.chat.stream({
            model: "mistral-small-latest",
            messages: [
                { role: "user", content: userMessage },
            ],
            responseFormat: { type: "text" },
            maxTokens: 512,
        });

        let fullResponse = '';
        for await (const event of chatResponse) {
            if (event.choices && event.choices.length > 0) {
                fullResponse += event.choices[0]?.message?.content || '';
            } else {
                console.error('Invalid event received:', event);
            }
        }

        res.json({ response: fullResponse });
    } catch (error) {
        console.error('Error calling Mistral API:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


server.listen(PORT, () => {
    console.info("Server is running on port ", PORT)
})