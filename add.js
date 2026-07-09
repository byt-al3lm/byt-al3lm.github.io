/**
 * بيت العلم - المحرك الرئيسي المعدل
 * يدعم تعدد الملفات والمجلدات المستقلة
 */

let allQuestions = [];
let activeCategory = 'all';
let searchTerm = '';
const itemsPerPage = 15; 
let currentPage = 1;

// 1. حدد هنا أسماء ملفاتك الموجودة فعلياً داخل مجلد data
const DATA_FILES = ['general.json']; // أضف هنا 'islamic.json' وغيرها بشرط أن تكون موجودة

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

// دالة التحميل الذكي
async function loadDatabase() {
    const isInsideQuestions = window.location.pathname.includes('/questions/');
    const baseDir = isInsideQuestions ? '../data/' : 'data/';

    try {
        const promises = DATA_FILES.map(async (fileName) => {
            try {
                const response = await fetch(baseDir + fileName);
                if (!response.ok) return []; // إذا لم يجد الملف لا يتوقف الكود
                return await response.json();
            } catch (err) {
                console.warn(`تحذير: تعذر تحميل الملف ${fileName}`);
                return [];
            }
        });

        const results = await Promise.all(promises);
        allQuestions = results.flat();
        
        console.log("تم تحميل البيانات بنجاح:", allQuestions.length);

        if (selectors.statsCount) selectors.statsCount.innerText = allQuestions.length.toLocaleString();
        
        if (selectors.questionsList) {
            setupCategories(allQuestions);
            renderQuestions();
        }

        // تشغيل الأسئلة المقترحة إذا كنا في صفحة مقال
        renderRelated();

    } catch (globalErr) {
        console.error("فشل تحميل قاعدة البيانات بالكامل:", globalErr);
    }
}

function renderQuestions() {
    if (!selectors.questionsList) return;

    const filtered = allQuestions.filter(q => {
        const titleText = q.title || "";
        const catText = q.category || "";
        const matchesSearch = titleText.toLowerCase().includes(searchTerm) || catText.toLowerCase().includes(searchTerm);
        const matchesCategory = activeCategory === 'all' || catText.toLowerCase() === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const paginated = filtered.slice(0, currentPage * itemsPerPage);

    selectors.questionsList.innerHTML = paginated.map(q => {
        // الروابط من الصفحة الرئيسية يجب أن تذهب لمجلد questions
        const articleUrl = `questions/${q.url}`;

        return `
            <article class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex gap-4 mb-4">
                <div class="hidden sm:flex flex-col items-center gap-1 shrink-0 w-16">
                    <span class="text-sm font-bold text-slate-700">${q.votes || 0}</span>
                    <span class="text-[10px] text-slate-400">تصويت</span>
                    <div class="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold mt-1">${q.answers || 1} إجابة</div>
                </div>
                <div class="flex-grow">
                    <span class="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">${q.category}</span>
                    <h2 class="text-lg font-bold text-blue-700 mt-2 mb-2">
                        <a href="${articleUrl}">${q.title}</a>
                    </h2>
                    <div class="flex flex-wrap gap-2 mt-3">
                        ${q.tags ? q.tags.map(t => `<span class="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded">#${t}</span>`).join('') : ''}
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function renderRelated() {
    const relContainer = document.getElementById('related-questions');
    if (!relContainer || allQuestions.length === 0) return;

    const currentFile = window.location.pathname.split("/").pop();
    const related = allQuestions
        .filter(q => !q.url.includes(currentFile))
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

    relContainer.innerHTML = `
        <h4 class="text-xs font-bold text-slate-400 uppercase mb-4">أسئلة مقترحة</h4>
        <div class="grid sm:grid-cols-2 gap-3">
            ${related.map(q => `
                <a href="${q.url}" class="p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-500 transition-all flex justify-between items-center group shadow-sm">
                    <span class="text-xs font-bold text-slate-700 group-hover:text-indigo-600">${q.title}</span>
                </a>
            `).join('')}
        </div>
    `;
}

function setupCategories(data) {
    if (!selectors.categoriesFilter) return;
    const categories = ['all', ...new Set(data.map(q => q.category?.toLowerCase()).filter(Boolean))];
    selectors.categoriesFilter.innerHTML = categories.map(c => `
        <button onclick="filterCategory('${c}')" class="px-4 py-1.5 text-xs font-bold rounded-lg shrink-0 ${activeCategory === c ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-500'}">
            ${c === 'all' ? 'الكل' : c}
        </button>
    `).join('');
}

window.filterCategory = function(c) { activeCategory = c; renderQuestions(); setupCategories(allQuestions); };

document.addEventListener("DOMContentLoaded", () => {
    initSelectors();
    loadDatabase();

    const searchAction = (e) => {
        searchTerm = e.target.value.toLowerCase();
        currentPage = 1;
        renderQuestions();
    };

    selectors.searchDesktop?.addEventListener('input', searchAction);
    selectors.searchMobile?.addEventListener('input', searchAction);
});
