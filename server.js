// 🌐 الرابط السحابي الجديد الخاص بسيرفر Render
const API_URL = "https://stiven-ai.onrender.com/api/chat";

// متغير للاحتفاظ بشخصية المساعد الحالية (الافتراضية stiven)
let currentCharacter = 'stiven';
// مصفوفة للاحتفاظ بتاريخ المحادثة الحالية
let chatHistory = [];

// عناصر واجهة المستخدم
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const characterSelect = document.getElementById('character-select');

// تغيير الشخصية عند اختيارها من القائمة
if (characterSelect) {
    characterSelect.addEventListener('change', (e) => {
        currentCharacter = e.target.value;
        chatHistory = []; // إعادة تعيين التاريخ عند تغيير الشخصية لتبدأ محادثة جديدة
        chatMessages.innerHTML = ''; // تنظيف الشاشة
        appendMessage('system', currentCharacter === 'stiven' ? 'تم تفعيل المساعد stiven.' : 'تم تفعيل المساعدة hadia.');
    });
}

// الاستماع لحدث إرسال النموذج (الرسالة)
if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        // 1. عرض رسالة المستخدم في الواجهة
        appendMessage('user', message);
        userInput.value = '';

        // 2. إظهار مؤشر التحميل
        const loadingDiv = appendMessage('loading', 'جاري التفكير...');

        try {
            // 3. إرسال الطلب إلى السيرفر السحابي على الإنترنت
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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
                // 4. عرض رد الذكاء الاصطناعي
                appendMessage('model', data.reply);
                
                // 5. حفظ التبادل في الذاكرة لتاريخ المحادثة
                chatHistory.push({ role: 'user', text: message });
                chatHistory.push({ role: 'model', text: data.reply });
            } else if (data.error) {
                appendMessage('error', data.error);
            }
        } catch (error) {
            if (loadingDiv) loadingDiv.remove();
            console.error('خطأ أثناء الاتصال بالسيرفر:', error);
            appendMessage('error', 'عذراً، تعذر الاتصال بالسيرفر السحابي. تأكد من تشغيل الخدمة.');
        }
    });
}

// دالة مساعدة لإضافة الرسائل إلى واجهة التشغيل
function appendMessage(role, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', role);
    
    // تنسيق بسيط للنصوص والأسطر البرمجية إن وجدت
    if (role === 'model') {
        messageElement.innerHTML = text.replace(/\n/g, '<br>');
    } else {
        messageElement.textContent = text;
    }
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // التمرير التلقائي للأسفل
    return messageElement;
}