/**
 * محرك "بيت العلم" - الإصدار الاحترافي المتكامل
 * المزايا: تمرير لانهائي، إصلاح مسارات تلقائي، دعم 10,000+ سؤال
 */

// --- 1. الإعدادات العامة ---
let allQuestions = [];
let activeCategory = 'all';
let searchTerm = '';
let currentPage = 1;
const itemsPerPage = 15; // عدد الأسئلة التي تظهر في كل مرة عند التمرير

// أسماء ملفات البيانات في مجلد /data/
const DATA_FILES = ['general.json']; 

// كشف موقع الصفحة الحالي لتحديد المسارات
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

// --- 2. تهيئة العناصر ---
function initSelectors() {
    selectors.questionsList = document.getElementById('questions-list');
    selectors.categoriesFilter = document.getElementById('categories-filter');
    selectors.searchDesktop = document.getElementById('search-input');
    selectors.searchMobile = document.getElementById('search-input-mobile');
    selectors.statsCount = document.getElementById('stats-count');
}

// --- 3. إصلاح الروابط الثابتة تلقائياً ---
// يقوم بتحويل index.html إلى ../index.html إذا كنت داخل مجلد questions
function fixNavigationLinks() {
    if (isInsideQuestions) {
        const staticPages = ['index.html', 'about.html', 'privacy.html'];
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && staticPages.includes(href)) {
                link.setAttribute('href', '../' + href);
            }
        });
    }
}

// --- 4. جلب ودمج البيانات من ملفات JSON ---
async function loadDatabase() {
    console.log("%c جاري تشغيل محرك بيت العلم... ", "color: white; background: #2d4e67; padding: 5px;");
    
    try {
        const promises = DATA_FILES.map(async (fileName) => {
            const filePath = baseDataPath + fileName;
            try {
                const response = await fetch(filePath);
                if (!response.ok) return [];
                const text = await response.text();
                if (!text.trim()) return [];
                return JSON.parse(text);
            } catch (err) {
                console.error(`خطأ في قراءة الملف ${fileName}:`, err);
                return [];
            }
        });

        const results = await Promise.all(promises);
        allQuestions = results.flat();
        
        if (selectors.statsCount) selectors.statsCount.innerText = allQuestions.length.toLocaleString();
        
        // البدء في العرض
        if (selectors.questionsList) {
            setupCategories(allQuestions);
            renderQuestions();
        }
        
        if (isInsideQuestions) renderRelated();

    } catch (globalErr) {
        console.error("فشل تحميل قاعدة البيانات:", globalErr);
    }
}

// --- 5. عرض الأسئلة مع التمرير اللانهائي ---
function renderQuestions() {
    if (!selectors.questionsList) return;

    const filtered = allQuestions.filter(q => {
        const titleText = (q.title || "").toLowerCase();
        const matchesSearch = titleText.includes(searchTerm);
        const matchesCategory = activeCategory === 'all' || (q.category || "").toLowerCase() === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const paginated = filtered.slice(0, currentPage * itemsPerPage);

    // بناء محتوى HTML
    const htmlContent = paginated.map(q => `
        <article class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex gap-4 mb-4 hover:border-blue-400 transition-all">
            <div class="hidden sm:flex flex-col items-center gap-1 shrink-0 w-16 text-center">
                <span class="text-sm font-bold text-slate-700">${q.votes || 0}</span>
                <span class="text-[10px] text-slate-400">تصويت</span>
                <div class="bg-green-600 text-white px-2 py-1 rounded text-[10px] font-bold mt-1">1 إجابة</div>
            </div>
            <div class="flex-grow text-right">
                <span class="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">${q.category || 'عام'}</span>
                <h2 class="text-lg font-bold text-blue-800 mt-2 mb-2 leading-tight">
                    <a href="${baseArticlePath}${q.url}">${q.title}</a>
                </h2>
                <div class="flex flex-wrap gap-2 mt-3">
                    ${q.tags ? q.tags.map(t => `<span class="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">#${t}</span>`).join('') : ''}
                </div>
            </div>
        </article>
    `).join('');

    selectors.questionsList.innerHTML = htmlContent;

    // إدارة التمرير اللانهائي
    manageInfiniteScroll(filtered.length, paginated.length);
}

// --- 6. دالة التمرير اللانهائي (Intersection Observer) ---
function manageInfiniteScroll(total, current) {
    let loader = document.getElementById('infinite-loader');
    
    if (current < total) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'infinite-loader';
            loader.className = 'py-6 text-center text-slate-400 text-xs font-bold animate-pulse';
            loader.innerText = 'جاري تحميل المزيد من الأسئلة...';
            selectors.questionsList.after(loader);

            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    currentPage++;
                    renderQuestions();
                }
            }, { threshold: 0.1 });
            observer.observe(loader);
        }
    } else {
        if (loader) loader.remove();
    }
}

// --- 7. الأسئلة المقترحة (لصفحة المقال) ---
function renderRelated() {
    const relContainer = document.getElementById('related-questions');
    if (!relContainer) return;

    const currentFile = window.location.pathname.split("/").pop();
    const related = allQuestions
        .filter(q => !q.url.includes(currentFile))
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

    relContainer.innerHTML = `
        <h4 class="text-sm font-bold text-slate-400 mb-4 border-r-4 border-blue-500 pr-3 font-sans">أسئلة قد تهمك</h4>
        <div class="grid sm:grid-cols-2 gap-3 text-right">
            ${related.map(q => `
                <a href="${q.url}" class="p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-500 transition-all shadow-sm">
                    <span class="text-xs font-bold text-slate-700 leading-relaxed">${q.title}</span>
                </a>
            `).join('')}
        </div>
    `;
}

// --- 8. التصنيفات والبحث ---
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
    currentPage = 1; // العودة لأول صفحة عند تغيير التصنيف
    renderQuestions();
    setupCategories(allQuestions);
};

// --- 9. تشغيل التطبيق ---
document.addEventListener("DOMContentLoaded", () => {
    initSelectors();
    loadDatabase();
    fixNavigationLinks(); // تصحيح الروابط فوراً

    const searchHandler = (e) => {
        searchTerm = e.target.value.toLowerCase();
        currentPage = 1;
        renderQuestions();
    };

    selectors.searchDesktop?.addEventListener('input', searchHandler);
    selectors.searchMobile?.addEventListener('input', searchHandler);
});
