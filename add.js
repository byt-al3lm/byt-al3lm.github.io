/**
 * نظام "بيت العلم" - المحرك الذكي الإصدار 3.0
 * مخصص لآلاف الأسئلة مع تصحيح تلقائي للمسارات
 */

// --- الإعدادات العامة وقاعدة البيانات ---
let allQuestions = [];
let activeCategory = 'all';
let searchTerm = '';
const itemsPerPage = 15; 
let currentPage = 1;

// 1. ضع هنا أسماء ملفاتك الموجودة داخل مجلد data
const DATA_FILES = ['general.json']; 

const selectors = {
    questionsList: null,
    categoriesFilter: null,
    searchDesktop: null,
    searchMobile: null,
    statsCount: null,
    scrollProgress: null
};

// --- دالة فحص وتحديد المسارات ---
// هذه الدالة تعرف إذا كنا داخل مجلد questions أم في الصفحة الرئيسية
const isInsideQuestions = window.location.pathname.includes('/questions/');
const baseDataPath = isInsideQuestions ? '../data/' : 'data/';
const baseArticlePath = isInsideQuestions ? '' : 'questions/';

function initSelectors() {
    selectors.questionsList = document.getElementById('questions-list');
    selectors.categoriesFilter = document.getElementById('categories-filter');
    selectors.searchDesktop = document.getElementById('search-input');
    selectors.searchMobile = document.getElementById('search-input-mobile');
    selectors.statsCount = document.getElementById('stats-count');
    selectors.scrollProgress = document.getElementById('scroll-progress');
}

// --- تحميل البيانات مع معالجة الأخطاء (حل مشكلة SyntaxError) ---
async function loadDatabase() {
    console.log("%c جاري تحميل قاعدة بيانات بيت العلم... ", "color: white; background: #2d4e67; padding: 5px;");

    try {
        const promises = DATA_FILES.map(async (fileName) => {
            const filePath = baseDataPath + fileName;
            try {
                const response = await fetch(filePath);
                if (!response.ok) throw new Error(`الملف ${fileName} غير موجود (404)`);
                
                const text = await response.text();
                if (!text.trim()) throw new Error(`الملف ${fileName} فارغ تماماً`);
                
                return JSON.parse(text);
            } catch (err) {
                console.error(`❌ خطأ في الملف [${fileName}]:`, err.message);
                return []; // إرجاع مصفوفة فارغة لتجنب توقف الكود بالكامل
            }
        });

        const results = await Promise.all(promises);
        allQuestions = results.flat();
        
        console.log(`✅ تم تحميل ${allQuestions.length} سؤال بنجاح.`);

        // تحديث الإحصائيات في الواجهة
        if (selectors.statsCount) {
            selectors.statsCount.innerText = allQuestions.length.toLocaleString();
        }

        // تشغيل الوظائف بناءً على الصفحة الحالية
        if (selectors.questionsList) {
            setupCategories(allQuestions);
            renderQuestions();
        }
        
        // تشغيل الأسئلة المقترحة إذا كنا داخل مقال
        if (isInsideQuestions) {
            renderRelated();
        }

    } catch (globalErr) {
        console.error("❌ فشل تحميل قاعدة البيانات بالكامل:", globalErr);
    }
}

// --- عرض قائمة الأسئلة (الصفحة الرئيسية) ---
function renderQuestions() {
    if (!selectors.questionsList) return;

    const filtered = allQuestions.filter(q => {
        const titleMatch = (q.title || "").toLowerCase().includes(searchTerm);
        const categoryMatch = activeCategory === 'all' || (q.category || "").toLowerCase() === activeCategory;
        return titleMatch && categoryMatch;
    });

    const paginated = filtered.slice(0, currentPage * itemsPerPage);

    if (paginated.length === 0) {
        selectors.questionsList.innerHTML = `<div class="p-10 text-center bg-white rounded-xl border">لا توجد نتائج تطابق بحثك..</div>`;
        return;
    }

    selectors.questionsList.innerHTML = paginated.map(q => `
        <article class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex gap-4 hover:border-blue-400 transition-all mb-4">
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

// --- عرض الأسئلة المقترحة (داخل المقالات) ---
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

// --- إصلاح الروابط تلقائياً (الرئيسية - عن الموقع - الخصوصية) ---
function fixNavigationLinks() {
    if (isInsideQuestions) {
        const navLinks = document.querySelectorAll('header nav a, footer a, header a[href="index.html"]');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href === 'index.html' || href === 'about.html' || href === 'privacy.html')) {
                link.setAttribute('href', '../' + href);
            }
        });
    }
}

// --- التصنيفات والبحث ---
function setupCategories(data) {
    if (!selectors.categoriesFilter) return;
    const categories = ['all', ...new Set(data.map(q => q.category).filter(Boolean))];
    selectors.categoriesFilter.innerHTML = categories.map(c => `
        <button onclick="filterCategory('${c}')" class="px-4 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all ${activeCategory === c.toLowerCase() ? 'bg-blue-600 text-white shadow-md' : 'bg-white border text-slate-500 hover:bg-slate-50'}">
            ${c === 'all' ? 'الكل' : c}
        </button>
    `).join('');
}

window.filterCategory = function(c) {
    activeCategory = c.toLowerCase();
    renderQuestions();
    setupCategories(allQuestions);
};

// --- تشغيل النظام عند تحميل الصفحة ---
document.addEventListener("DOMContentLoaded", () => {
    initSelectors();
    loadDatabase();
    fixNavigationLinks();

    // تشغيل البحث
    const searchHandler = (e) => {
        searchTerm = e.target.value.toLowerCase();
        currentPage = 1;
        renderQuestions();
    };

    selectors.searchDesktop?.addEventListener('input', searchHandler);
    selectors.searchMobile?.addEventListener('input', searchHandler);

    // شريط تقدم القراءة (اختياري)
    window.addEventListener('scroll', () => {
        if (selectors.scrollProgress) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            selectors.scrollProgress.style.width = scrolled + "%";
        }
    });
});
