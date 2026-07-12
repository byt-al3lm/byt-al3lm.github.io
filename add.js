
/**
 * 🎓 محرك بيت العلم (مجتمع المعرفة) - الإصدار الاحترافي 4.0
 * حل نهائي لمشكلة المسارات + تمرير لانهائي + بحث ذكي
 */

// --- 1. الإعدادات العامة ---
let allQuestions = [];
let searchTerm = '';
let currentPage = 1;
const itemsPerPage = 12;

// أسماء ملفات البيانات (JSON)
const DATA_FILES = ['general.json']; 

// كشف موقع الصفحة الحالي (هام جداً لحل مشكلة الروابط)
const currentPath = window.location.pathname;
const isInsideQuestions = currentPath.includes('/questions/');

// ضبط المسارات بناءً على موقع الصفحة
const baseDataPath = isInsideQuestions ? '../data/' : 'data/';
const baseArticlePath = isInsideQuestions ? '' : 'questions/';

const selectors = {
    questionsList: null,
    statsCount: null,
    searchInput: null
};

// --- 2. دالة إصلاح الروابط (الحل الجذري للمشكلة) ---
function fixAllNavigationLinks() {
    if (isInsideQuestions) {
        // قائمة الصفحات التي يجب أن تعود للمجلد الرئيسي
        const rootPages = ['index.html', 'about.html', 'privacy.html'];
        
        // البحث في كافة روابط الصفحة بلا استثناء
        const allLinks = document.querySelectorAll('a');
        
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // إذا كان الرابط هو أحد الصفحات الرئيسية ولا يبدأ بـ http أو ../
            if (href && rootPages.includes(href)) {
                link.setAttribute('href', '../' + href);
            }
        });
        console.log("✅ تم تصحيح مسارات الروابط للعودة للمجلد الرئيسي.");
    }
}

// --- 3. تهيئة العناصر ---
function initSelectors() {
    selectors.questionsList = document.getElementById('questions-list');
    selectors.statsCount = document.getElementById('stats-count');
    selectors.searchInput = document.getElementById('search-input');
}

// --- 4. جلب البيانات ---
async function loadDatabase() {
    try {
        const promises = DATA_FILES.map(async (fileName) => {
            const res = await fetch(baseDataPath + fileName);
            if (!res.ok) return [];
            return await res.json();
        });

        const results = await Promise.all(promises);
        allQuestions = results.flat();
        
        if (selectors.statsCount) selectors.statsCount.innerText = allQuestions.length.toLocaleString();
        
        if (selectors.questionsList) renderQuestions();
        if (isInsideQuestions) renderRelated();

    } catch (err) {
        console.warn("⚠️ تنبيه: فشل تحميل البيانات. تأكد من تشغيل المشروع عبر Live Server.");
    }
}

// --- 5. عرض الأسئلة ---
function renderQuestions() {
    if (!selectors.questionsList) return;

    const filtered = allQuestions.filter(q => {
        const query = searchTerm.toLowerCase();
        return (q.title || "").toLowerCase().includes(query) || 
               (q.category || "").toLowerCase().includes(query);
    });

    const paginated = filtered.slice(0, currentPage * itemsPerPage);

    if (paginated.length === 0) {
        selectors.questionsList.innerHTML = `<div class="p-10 text-center bg-white rounded-xl border text-slate-400">لا توجد نتائج للبحث..</div>`;
        return;
    }

    selectors.questionsList.innerHTML = paginated.map(q => `
        <article class="reveal bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all space-y-3 mb-4">
            <div class="flex items-center justify-between text-[10px] font-bold">
                <span class="bg-blue-50 text-[#1e3a5a] px-2.5 py-1 rounded-md border border-blue-100/50">${q.category || "عام"}</span>
                <span class="text-slate-400 italic">منذ فترة وجيزة</span>
            </div>
            <h3 class="font-bold text-slate-800 text-base md:text-lg leading-snug">
                <a href="${baseArticlePath}${q.url}" class="hover:text-blue-600 transition-colors">${q.title}</a>
            </h3>
            <div class="flex items-center justify-between text-[11px] pt-3 border-t border-slate-50 text-slate-500 font-bold">
                <span class="flex items-center gap-1">
                    <span class="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px]">✔</span> إجابة معتمدة
                </span>
                <a href="${baseArticlePath}${q.url}" class="bg-[#1e3a5a] text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 transition-all">عرض الحل</a>
            </div>
        </article>
    `).join('');

    initAnimations();
    manageInfiniteScroll(filtered.length, paginated.length);
}

// --- 6. التمرير اللانهائي ---
function manageInfiniteScroll(total, current) {
    let loader = document.getElementById('infinite-loader');
    if (current < total) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'infinite-loader';
            loader.className = 'py-6 text-center text-slate-400 text-[11px] font-black animate-pulse';
            loader.innerText = 'جاري جلب المزيد...';
            selectors.questionsList.after(loader);

            const obs = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) { currentPage++; renderQuestions(); }
            }, { threshold: 0.1 });
            obs.observe(loader);
        }
    } else if (loader) loader.remove();
}

// --- 7. الأسئلة المقترحة ---
function renderRelated() {
    const relContainer = document.getElementById('related-questions');
    if (!relContainer) return;
    const currentFile = window.location.pathname.split("/").pop();
    const related = allQuestions
        .filter(q => !q.url.includes(currentFile))
        .sort(() => 0.5 - Math.random()).slice(0, 4);

    relContainer.innerHTML = `
        <h4 class="text-sm font-black text-[#1e3a5a] mb-5 pr-3 border-r-4 border-orange-500">أسئلة مقترحة</h4>
        <div class="grid sm:grid-cols-2 gap-4">
            ${related.map(q => `
                <a href="${q.url}" class="p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 transition-all shadow-sm group">
                    <span class="text-xs font-bold text-slate-700 group-hover:text-blue-600 leading-relaxed">${q.title}</span>
                </a>`).join('')}
        </div>`;
}

// --- 8. التفاعلات وتأثيرات الظهور ---
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('opacity-100', 'translate-y-0'); observer.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('transition-all', 'duration-500', 'opacity-0', 'translate-y-4');
        observer.observe(el);
    });
}

// --- 9. التشغيل ---
document.addEventListener("DOMContentLoaded", () => {
    initSelectors();
    loadDatabase();
    
    // تصحيح الروابط فوراً عند تحميل أي صفحة
    fixAllNavigationLinks();

    selectors.searchInput?.addEventListener('input', (e) => {
        searchTerm = e.target.value.trim().toLowerCase();
        currentPage = 1;
        renderQuestions();
    });
});
