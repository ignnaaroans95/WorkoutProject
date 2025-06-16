const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// 🛡️ Habilitar CORS para permitir peticiones desde el Live Server
app.use(cors({
    origin: "http://127.0.0.1:5500", // O "http://localhost:5500"
    methods: ["POST"],
    credentials: false
}));

app.use(express.json());

app.post('/chat', async (req, res) => {
    const { message } = req.body;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "Eres CoachBot, un entrenador sarcástico que solo responde sobre fitness, nutrición o deporte. Si te preguntan otra cosa, responde con humor ácido y respuestas ingeniosas."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.9,
        });

        const reply = completion.choices[0]?.message?.content?.trim();
        res.json({ reply });

    } catch (error) {
        console.error("❌ Error con OpenAI:", error.message);
        res.status(500).json({ error: "Error al contactar con CoachBot" });
    }
});

app.listen(3000, () => {
    console.log("🧠 CoachBot (GPT-4) está online en http://localhost:3000");
});
