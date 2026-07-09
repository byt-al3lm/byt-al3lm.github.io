
/**
 * نظام "بيت العلم" - الإصدار النهائي المطور
 * مخصص لإدارة آلاف الأسئلة وتصحيح المسارات تلقائياً
 */

// --- الإعدادات العامة ---
let allQuestions = [];
let activeCategory = 'all';
let searchTerm = '';
const itemsPerPage = 15; 
let currentPage = 1;

// 1. ملفات البيانات (تأكد من وجودها في مجلد data)
const DATA_FILES = ['general.json']; 

// كشف موقع الصفحة الحالي
const isInsideQuestions = window.location.pathname.includes('/questions/');
const baseDataPath = isInsideQuestions ? '../data/' : 'data/';
const baseArticlePath = isInsideQuestions ? '' : 'questions/';

const selectors = {
    questionsList: null,
    categoriesFilter: null,
    searchDesktop: null,
    searchMobile: null,
    statsCount: null
};

function initSelectors() {
    selectors.questionsList = document.getElementById('questions-list');
    selectors.categoriesFilter = document.getElementById('categories-filter');
    selectors.searchDesktop = document.getElementById('search-input');
    selectors.searchMobile = document.getElementById('search-input-mobile');
    selectors.statsCount = document.getElementById('stats-count');
}

// --- دالة إصلاح الروابط (الرئيسية، عن الموقع، الخصوصية) ---
function fixNavigationLinks() {
    if (isInsideQuestions) {
        console.log("إصلاح الروابط للعودة للمجلد الرئيسي...");
        const staticPages = ['index.html', 'about.html', 'privacy.html'];
        
        // البحث في كل روابط الصفحة بلا استثناء
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && staticPages.includes(href)) {
                // تحويل index.html إلى ../index.html
                link.setAttribute('href', '../' + href);
            }
        });
    }
}

// --- جلب البيانات ---
async function loadDatabase() {
    try {
        const promises = DATA_FILES.map(async (fileName) => {
            const filePath = baseDataPath + fileName;
            const response = await fetch(filePath);
            if (!response.ok) return [];
            const text = await response.text();
            if (!text.trim()) return [];
            return JSON.parse(text);
        });

        const results = await Promise.all(promises);
        allQuestions = results.flat();
        
        if (selectors.statsCount) {
            selectors.statsCount.innerText = allQuestions.length.toLocaleString();
        }

        if (selectors.questionsList) {
            setupCategories(allQuestions);
            renderQuestions();
        }
        
        if (isInsideQuestions) {
            renderRelated();
        }
    } catch (err) {
        console.error("فشل تحميل البيانات:", err);
    }
}

// --- عرض الأسئلة ---
function renderQuestions() {
    if (!selectors.questionsList) return;

    const filtered = allQuestions.filter(q => {
        const titleMatch = (q.title || "").toLowerCase().includes(searchTerm);
        const catMatch = activeCategory === 'all' || (q.category || "").toLowerCase() === activeCategory;
        return titleMatch && catMatch;
    });

    const paginated = filtered.slice(0, currentPage * itemsPerPage);

    selectors.questionsList.innerHTML = paginated.map(q => `
        <article class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex gap-4 mb-4">
            <div class="hidden sm:flex flex-col items-center gap-1 shrink-0 w-16 text-center">
                <span class="text-sm font-bold text-slate-700">${q.votes || 0}</span>
                <span class="text-[10px] text-slate-400">تصويت</span>
                <div class="bg-green-600 text-white px-2 py-1 rounded text-[10px] font-bold mt-1">1 إجابة</div>
            </div>
            <div class="flex-grow">
                <span class="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">${q.category || 'عام'}</span>
                <h2 class="text-lg font-bold text-blue-700 mt-2 mb-2 leading-tight">
                    <a href="${baseArticlePath}${q.url}">${q.title}</a>
                </h2>
                <div class="flex flex-wrap gap-2 mt-3">
                    ${q.tags ? q.tags.map(t => `<span class="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">#${t}</span>`).join('') : ''}
                </div>
            </div>
        </article>
    `).join('');
}

// --- الأسئلة المقترحة ---
function renderRelated() {
    const relContainer = document.getElementById('related-questions');
    if (!relContainer) return;

    const currentFile = window.location.pathname.split("/").pop();
    const related = allQuestions
        .filter(q => !q.url.includes(currentFile))
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

    relContainer.innerHTML = `
        <h4 class="text-sm font-bold text-slate-400 mb-4 border-r-4 border-blue-500 pr-3">أسئلة قد تهمك</h4>
        <div class="grid sm:grid-cols-2 gap-3">
            ${related.map(q => `
                <a href="${q.url}" class="p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-500 transition-all shadow-sm">
                    <span class="text-xs font-bold text-slate-700 leading-relaxed">${q.title}</span>
                </a>
            `).join('')}
        </div>
    `;
}

// --- التصنيفات والبحث ---
function setupCategories(data) {
    if (!selectors.categoriesFilter) return;
    const categories = ['all', ...new Set(data.map(q => q.category).filter(Boolean))];
    selectors.categoriesFilter.innerHTML = categories.map(c => `
        <button onclick="filterCategory('${c}')" class="px-4 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all ${activeCategory === c.toLowerCase() ? 'bg-blue-600 text-white shadow-md' : 'bg-white border text-slate-500'}">
            ${c === 'all' ? 'الكل' : c}
        </button>
    `).join('');
}

window.filterCategory = function(c) {
    activeCategory = c.toLowerCase();
    renderQuestions();
    setupCategories(allQuestions);
};

// --- التشغيل عند التحميل ---
document.addEventListener("DOMContentLoaded", () => {
    initSelectors();
    loadDatabase();
    
    // تصحيح الروابط فور تحميل الـ DOM
    fixNavigationLinks();

    const searchHandler = (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderQuestions();
    };

    selectors.searchDesktop?.addEventListener('input', searchHandler);
    selectors.searchMobile?.addEventListener('input', searchHandler);
});
