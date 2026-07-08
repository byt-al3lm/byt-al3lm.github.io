
/**
 * بيت العلم - Core Controller
 * Optimized for Scale
 */

let allQuestions = [];
const itemsPerPage = 20;
let currentPage = 1;
let currentSearch = '';

// دمج بيانات ملفات JSON المتعددة
async function initApp() {
    const dataFiles = ['data/tech.json', 'data/science.json']; // أضف أي ملفات أخرى هنا
    try {
        const responses = await Promise.all(dataFiles.map(url => fetch(url).then(r => r.json())));
        allQuestions = responses.flat(); // دمج كل الملفات في مصفوفة واحدة
        renderQuestions();
    } catch (err) {
        console.error("خطأ في تحميل قاعدة البيانات:", err);
    }
}

function renderQuestions(filter = '') {
    const list = document.getElementById('questions-list');
    const filtered = allQuestions.filter(q => 
        q.title.toLowerCase().includes(filter.toLowerCase())
    );
    
    const paginated = filtered.slice(0, currentPage * itemsPerPage);
    
    list.innerHTML = paginated.map(q => `
        <div class="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all">
            <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">${q.category}</span>
            <h2 class="text-xl font-bold mt-2 mb-3 text-slate-900 dark:text-white">${q.title}</h2>
            <a href="questions/${q.url}" class="text-indigo-600 font-bold text-sm">اقرأ الإجابة ←</a>
        </div>
    `).join('');
}

// بحث سريع
document.getElementById('search-input').addEventListener('input', (e) => {
    currentPage = 1;
    renderQuestions(e.target.value);
});

initApp();
