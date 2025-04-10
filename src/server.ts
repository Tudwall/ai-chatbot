import express from "express";
import cors from "cors";
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const server = express();
const PORT = process.env['PORT'] || 3000

const googleAiStudioApiKey = process.env['GOOGLE_AI_STUDIO_API_KEY'];

if (!googleAiStudioApiKey) {
    throw new Error("Provide GOOGLE_AI_STUDIO_API_KEY in .env file");
}

const genAI = new GoogleGenerativeAI(googleAiStudioApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const chat = model.startChat();

server.use(express.text());
server.use(cors());

server.post('/message', async (req, res) => {
    const prompt: string = req.body;
    const result = await chat.sendMessageStream(prompt);

    for await (const partialMessage of result.stream) {
        res.write(partialMessage.text())
    }

    res.end();
})


server.listen(PORT, () => {
    console.info("Server is running on port ", PORT)
})