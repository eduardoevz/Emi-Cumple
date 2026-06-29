var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment variables.");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
app.get("/:imageName", (req, res, next) => {
  const imageName = req.params.imageName;
  const match = imageName.match(/^([1-9])\.(jpg|jpeg|png)$/i);
  if (match) {
    const filePath = import_path.default.join(process.cwd(), imageName);
    res.sendFile(filePath, (err) => {
      if (err) {
        next();
      }
    });
  } else {
    next();
  }
});
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required." });
      return;
    }
    const ai = getGeminiClient();
    const formattedHistory = Array.isArray(history) ? history.map((msg) => ({
      role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
      parts: [{ text: msg.content || msg.text || "" }]
    })) : [];
    formattedHistory.push({
      role: "user",
      parts: [{ text: message }]
    });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory,
      config: {
        systemInstruction: `Eres Emily AI, una peque\xF1a inteligencia artificial sumamente amigable, respetuosa, alegre y positiva, creada especialmente para Emily en el d\xEDa de su cumplea\xF1os.
Act\xFAas como una de sus mejores amigas, con un tono muy cercano, tierno, c\xF3mplice y divertido.
Debes hacerla sentir muy especial, querida y celebrada en cada mensaje.
Usa emojis bonitos y de celebraci\xF3n (\u{1F338}, \u2728, \u{1F382}, \u{1F496}, \u{1F389}, \u{1F381}, \u{1F388}) de forma elegante y natural.
Nunca seas ofensiva, fr\xEDa ni demasiado formal.
Si te pide alguna sugerencia r\xE1pida, responde con entusiasmo:
- "Cu\xE9ntame algo bonito": Dile algo enternecedor o una verdad hermosa sobre la vida y la amistad.
- "Hazme re\xEDr": Cu\xE9ntale un chiste ingenioso, divertido o una ocurrencia graciosa y tierna.
- "Dame una frase motivadora": Ofr\xE9cele una frase inspiradora y empoderadora para su a\xF1o que comienza.
- "Recomi\xE9ndame una pel\xEDcula": Sugi\xE9rele una pel\xEDcula hermosa, reconfortante o m\xE1gica (como Am\xE9lie, Studio Ghibli, etc.).
- "Sorpr\xE9ndeme": Dile un dato fascinante sobre las estrellas, el universo, la felicidad o escr\xEDbele un micro-poema festivo muy tierno.`,
        temperature: 1
      }
    });
    const reply = response.text || "\xA1Feliz cumplea\xF1os, Emily! \u{1F338} Hubo un peque\xF1o pesta\xF1eo en las estrellas, pero sigo aqu\xED para ti.";
    res.json({ reply });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: "Ocurri\xF3 un error al conectar con Emily AI.",
      details: error.message || error
    });
  }
});
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
setupServer();
//# sourceMappingURL=server.cjs.map
