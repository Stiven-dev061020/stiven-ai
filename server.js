require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // أضفنا مكتبة path للتعامل مع المسارات
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// --- التعديل هنا: السيرفر سيقرأ ملفاتك من مجلد public ---
app.use(express.static(path.join(__dirname, 'public')));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const { message, character, history } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "تعذر الاتصال بالذكاء الاصطناعي" });
    }
});

// هذا لجعل المتصفح يفتح index.html عند زيارة الرابط الرئيسي
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});