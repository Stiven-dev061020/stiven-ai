require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// تعديل ذكي: سيستخدم المفتاح الموجود في إعدادات Render، 
// وإذا لم يجده سيستخدم المفتاح المكتوب بين القوسين بالأسفل
const apiKey = process.env.API_KEY || "YOUR_ACTUAL_API_KEY_HERE"; 
const genAI = new GoogleGenerativeAI(apiKey);

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(message);
        res.json({ reply: result.response.text() });
    } catch (error) {
        console.error("Error details:", error);
        res.status(500).json({ error: "خطأ في السيرفر: تأكد من مفتاح الـ API" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});