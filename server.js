const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 مفتاح الـ API الخاص بك
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const systemPrompts = {
    stiven: "أنت الآن تتقمص شخصية مساعد ذكاء اصطناعي خبير ومباشر اسمك stiven. تتحدث دائماً بصيغة المذكر بأسلوب تقني ذكي وسريع، وتساعد المستخدم في البرمجة وحل المشكلات بدقة عالية.",
    hadia: "أنتِ الآن تتقمصين شخصية مساعدة ذكاء اصطناعي ذكية، تفاعلية ولطيفة جداً اسمكِ hadia. تتحدثين دائماً بصيغة المؤنث بأسلوب لبق، منظم، ومريح جداً في الحوار والشرح."
};

app.post('/api/chat', async (req, res) => {
    const { message, character, history } = req.body;
    try {
        const selectedPrompt = systemPrompts[character] || systemPrompts.stiven;
        
        // تجهيز تاريخ المحادثة بالصيغة التي يفهمها الموديل الجديد
        const contents = [];
        if (history && history.length > 0) {
            history.forEach(turn => {
                contents.push({
                    role: turn.role === 'user' ? 'user' : 'model',
                    parts: [{ text: turn.text }]
                });
            });
        }
        
        // إضافة الرسالة الحالية الأخيرة
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: selectedPrompt
            }
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error("خطأ في السيرفر:", error);
        res.status(500).json({ error: "حدث خطأ أثناء معالجة الرد." });
    }
});

app.listen(3000, () => {
    console.log("🚀 سيرفر جيميناي المطور يعمل الآن على المنفذ 3000!");
});