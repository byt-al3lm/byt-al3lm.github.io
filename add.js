/**
 * بيت العلم - النسخة التصحيحية (Debug Version)
 */

let allQuestions = [];
let activeCategory = 'all';
let searchTerm = '';
const itemsPerPage = 15; 
let currentPage = 1;

// تأكد من أن الأسماء هنا مطابقة لملفاتك في مجلد data تماماً
const DATA_FILES = ['general.json']; 

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

async function loadDatabase() {
    // تحديد المسار: هل نحن في الرئيسية أم داخل مجلد questions
    const isInsideQuestions = window.location.pathname.includes('/questions/');
    const baseDir = isInsideQuestions ? '../data/' : 'data/';

    console.log("بدء تحميل البيانات من المسار:", baseDir);

    try {
        const promises = DATA_FILES.map(async (fileName) => {
            const filePath = baseDir + fileName;
            try {
                const response = await fetch(filePath);
                
                if (!response.ok) {
                    console.error(`❌ خطأ 404: الملف غير موجود في المسار: ${filePath}`);
                    return [];
                }

                const textData = await response.text(); // جلب البيانات كنص أولاً للتأكد
                if (!textData || textData.trim() === "") {
                    console.error(`❌ خطأ: الملف ${fileName} فارغ تماماً!`);
                    return [];
                }

                try {
                    return JSON.parse(textData);
                } catch (parseErr) {
                    console.error(`❌ خطأ في تنسيق JSON داخل الملف ${fileName}:`, parseErr.message);
                    return [];
                }
            } catch (fetchErr) {
                console.error(`❌ فشل الاتصال بالملف ${fileName}:`, fetchErr.message);
                return [];
            }
        });

        const results = await Promise.all(promises);
        allQuestions = results.flat();
        
        console.log("✅ إجمالي الأسئلة المحملة:", allQuestions.length);

        if (allQuestions.length > 0) {
            if (selectors.statsCount) selectors.statsCount.innerText = allQuestions.length.toLocaleString();
            if (selectors.questionsList) {
                setupCategories(allQuestions);
                renderQuestions();
            }
            renderRelated();
        } else {
            console.warn("⚠️ لم يتم تحميل أي أسئلة. تأكد من وجود ملفات JSON صحيحة في مجلد data.");
        }

    } catch (globalErr) {
        console.error("❌ فشل تحميل قاعدة البيانات بالكامل:", globalErr);
    }
}

function renderQuestions() {
    if (!selectors.questionsList) return;

    const filtered = allQuestions.filter(q => {
        const titleText = (q.title || "").toLowerCase();
        const matchesSearch = titleText.includes(searchTerm);
        const matchesCategory = activeCategory === 'all' || (q.category || "").toLowerCase() === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const paginated = filtered.slice(0, currentPage * itemsPerPage);

    selectors.questionsList.innerHTML = paginated.map(q => {
        // تأكد أن الرابط يوجه للمجلد الصحيح
        const articleUrl = `questions/${q.url}`;
        return `
            <article class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex gap-4 mb-4">
                <div class="hidden sm:flex flex-col items-center gap-1 shrink-0 w-16">
                    <span class="text-sm font-bold text-slate-700">${q.votes || 0}</span>
                    <span class="text-[10px] text-slate-400">تصويت</span>
                    <div class="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold mt-1">إجابة</div>
                </div>
                <div class="flex-grow text-right">
                    <span class="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">${q.category || 'عام'}</span>
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

    relContainer.innerHTML = related.map(q => `
        <a href="${q.url}" class="p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-500 transition-all block shadow-sm">
            <span class="text-xs font-bold text-slate-700">${q.title}</span>
        </a>
    `).join('');
}

function setupCategories(data) {
    if (!selectors.categoriesFilter) return;
    const categories = ['all', ...new Set(data.map(q => q.category).filter(Boolean))];
    selectors.categoriesFilter.innerHTML = categories.map(c => `
        <button onclick="filterCategory('${c}')" class="px-4 py-1.5 text-xs font-bold rounded-lg shrink-0 ${activeCategory === c ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-500'}">
            ${c === 'all' ? 'الكل' : c}
        </button>
    `).join('');
}

window.filterCategory = function(c) { 
    activeCategory = c.toLowerCase(); 
    renderQuestions(); 
    setupCategories(allQuestions); 
};

document.addEventListener("DOMContentLoaded", () => {
    initSelectors();
    loadDatabase();
    
    selectors.searchDesktop?.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderQuestions();
    });
});
