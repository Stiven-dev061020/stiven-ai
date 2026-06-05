const btnStiven = document.getElementById('btn-stiven');
const btnHadia = document.getElementById('btn-hadia');
const currentChatName = document.getElementById('current-chat-name');
const welcomeText = document.getElementById('welcome-text');
const textInput = document.getElementById('text-input');
const messageForm = document.getElementById('message-form');
const chatMessages = document.getElementById('chat-messages');

let currentCharacter = 'stiven'; 
let chatHistory = JSON.parse(localStorage.getItem('chat_history')) || [];

// إعداد مكتبة تنسيق الأكواد
marked.setOptions({
    highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    }
});

// تحميل الرسائل المحفوظة عند فتح الصفحة
window.addEventListener('DOMContentLoaded', () => {
    if(chatHistory.length > 0) {
        // إخفاء نص الترحيب إذا كانت هناك محادثات سابقة
        welcomeText.style.display = 'none';
        chatHistory.forEach(msg => {
            appendMsgToDOM(msg.text, msg.role === 'user' ? 'user-msg' : 'ai-msg', false);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

btnStiven.addEventListener('click', () => {
    if(currentCharacter === 'stiven') return;
    btnStiven.classList.add('active');
    btnHadia.classList.remove('active');
    currentCharacter = 'stiven';
    currentChatName.innerText = 'المساعد stiven';
    textInput.placeholder = 'اكتب سؤالك هنا لـ stiven...';
});

btnHadia.addEventListener('click', () => {
    if(currentCharacter === 'hadia') return;
    btnHadia.classList.add('active');
    btnStiven.classList.remove('active');
    currentCharacter = 'hadia';
    currentChatName.innerText = 'المساعدة hadia';
    textInput.placeholder = 'اكتب سؤالك هنا لـ hadia...';
});

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = textInput.value.trim();
    if (!text) return;

    welcomeText.style.display = 'none';

    // عرض رسالة المستخدم وحفظها
    appendMsgToDOM(text, 'user-msg', false);
    chatHistory.push({ role: 'user', text: text });
    saveHistory();
    
    textInput.value = '';

    // مؤشر جاري التفكير
    const typingIndicator = appendMsgToDOM('جاري التفكير...', 'ai-msg', false);

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: text, 
                character: currentCharacter,
                history: chatHistory.slice(-10) // إرسال آخر 10 رسائل فقط للحفاظ على سرعة السيرفر
            })
        });

        const data = await response.json();
        typingIndicator.remove(); 

        if (data.reply) {
            // إضافة رد الذكاء الاصطناعي مع تأثير الكتابة الحية
            chatHistory.push({ role: 'model', text: data.reply });
            saveHistory();
            appendMsgToDOM(data.reply, 'ai-msg', true);
        } else {
            appendMsgToDOM('عذراً، واجهت مشكلة في معالجة الرد.', 'ai-msg', false);
        }

    } catch (error) {
        typingIndicator.remove();
        appendMsgToDOM('خطأ: تأكد من تشغيل السيرفر أولاً.', 'ai-msg', false);
    }
});

function appendMsgToDOM(text, className, isLive) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${className}`;
    chatMessages.appendChild(msgDiv);
    
    // إذا كان الرد حياً من الذكاء الاصطناعي نقوم بعمل تأثير الكتابة الحية
    if (isLive && className === 'ai-msg') {
        let i = 0;
        msgDiv.innerHTML = "";
        // تحويل النص المنسق (Markdown) إلى HTML قبل طباعته
        const formattedHTML = marked.parse(text);
        
        // تأثير ظهور سريع ومريح
        msgDiv.innerHTML = formattedHTML;
        msgDiv.querySelectorAll('pre code').forEach((el) => { hljs.highlightElement(el); });
    } else {
        msgDiv.innerHTML = marked.parse(text);
        msgDiv.querySelectorAll('pre code').forEach((el) => { hljs.highlightElement(el); });
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
}

function saveHistory() {
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
}

// ميزة اختيارية: يمكنك تفريغ المحادثات عبر كتابة "clear" في الشات
if (textInput.value === 'clear') {
    localStorage.removeItem('chat_history');
    chatHistory = [];
    location.reload();
}