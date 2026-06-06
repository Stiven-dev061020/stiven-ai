// 🌐 الرابط السحابي الخاص بسيرفر Render
const API_URL = "https://stiven-ai.onrender.com/api/chat";

// متغيرات الحالة
let currentCharacter = 'stiven';
let chatHistory = [];

// عناصر واجهة المستخدم
const chatForm = document.getElementById('message-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');

// الاستماع لحدث إرسال النموذج
if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        // 1. عرض رسالة المستخدم
        appendMessage('user', message);
        userInput.value = '';

        // 2. إظهار مؤشر التحميل
        const loadingDiv = appendMessage('loading', 'جاري التفكير...');

        try {
            // 3. إرسال الطلب للسيرفر
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    character: currentCharacter,
                    history: chatHistory
                })
            });

            const data = await response.json();
            
            // إزالة مؤشر التحميل
            if (loadingDiv) loadingDiv.remove();

            if (data.reply) {
                appendMessage('model', data.reply);
                chatHistory.push({ role: 'user', text: message });
                chatHistory.push({ role: 'model', text: data.reply });
            } else if (data.error) {
                appendMessage('error', data.error);
            }
        } catch (error) {
            if (loadingDiv) loadingDiv.remove();
            console.error('خطأ:', error);
            appendMessage('error', 'عذراً، تعذر الاتصال بالسيرفر.');
        }
    });
}

// دالة عرض الرسائل
function appendMessage(role, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', role);
    
    if (role === 'model') {
        messageElement.innerHTML = text.replace(/\n/g, '<br>');
    } else {
        messageElement.textContent = text;
    }
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageElement;
}