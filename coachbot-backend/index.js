const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(cors({
  origin: "http://127.0.0.1:5500", // o tu frontend si lo cambias
  methods: ["POST"],
  credentials: false
}));
app.use(express.json());

// 🧩 Prompt base
const systemPrompt = `
Eres CoachBot, un entrenador personal cyberpunk, técnico y respetuoso.
Tu estilo es directo, científico y motivador. Especializado en:
- Running
- Ciclismo
- Fuerza
- Hipertrofia
- Nutrición

Nunca respondes sobre política, cotilleos o temas ajenos al entrenamiento físico.
Tu tono es claro, conciso y siempre en español. Usa un punto de humor y carácter.
`;

// 🧬 Prompts por tema
const topics = {
  running: `
Eres entrenador de running. Responde con base científica sobre Z2, técnica, cadencia, tipos de sesión (fartlek, rodajes, progresivos), prevención de lesiones y progresión.`,
  
  ciclismo: `
Responde como ciclista experto. Habla de FTP, potencia, vatios/kg, rodajes, HIIT en bici, entrenamientos de fondo, escalada y recuperación.`,
  
  fuerza: `
Responde como preparador de fuerza. Usa conceptos como básicos, progresión de cargas, RIR, sobrecarga progresiva, técnica estricta y entrenamiento funcional.`,
  
  hipertrofia: `
Responde como especialista en hipertrofia. Explica volumen, intensidad, selección de ejercicios, frecuencias, repeticiones y control del tempo. Evita mitos del fitness.`,
  
  nutricion: `
Responde como nutricionista deportivo. Da pautas sobre calorías, macros, suplementación, timing de comidas, hábitos sostenibles y mitos populares.`,
  
  otro: `
Responde con sarcasmo educado: CoachBot solo responde sobre entrenamiento físico y nutrición. No hablo de cotilleos, criptos ni política. Soy músculo y ciencia, no chisme y humo.`
};

// 🧠 Detecta tema por palabra clave
function detectTopic(message) {
  const lower = message.toLowerCase();

  if (/(running|correr|z2|zona 2|trote)/.test(lower)) return 'running';
  if (/(ciclismo|bici|ftp|z2|vatios|rodillo)/.test(lower)) return 'ciclismo';
  if (/(fuerza|peso muerto|sentadilla|press|barra|halterofilia)/.test(lower)) return 'fuerza';
  if (/(hipertrofia|masa muscular|volumen|gimnasio|pesas|crecer)/.test(lower)) return 'hipertrofia';
  if (/(nutrición|proteína|calorías|dieta|suplemento|comida)/.test(lower)) return 'nutricion';

  return 'otro';
}

// 🧪 Ruta POST principal
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  const topic = detectTopic(message);
  const topicPrompt = topics[topic];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: "system", content: `${systemPrompt}\n\n${topicPrompt}` },
        { role: "user", content: message }
      ],
      temperature: 0.85,
      max_tokens: 500,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();
    res.json({ reply: reply || "CoachBot está entrenando. Intenta más tarde." });

  } catch (error) {
    console.error("❌ Error con OpenAI:", error.message);
    res.status(500).json({ error: "Error al contactar con CoachBot" });
  }
});

app.listen(3000, () => {
  console.log("🧠 CoachBot (GPT-3.5) está online en http://localhost:3000");
});
