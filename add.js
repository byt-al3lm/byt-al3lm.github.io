/**
 * محرك بيت العلم (مجتمع المعرفة) - الإصدار المتكامل
 * يدعم: التمرير اللانهائي، البحث في الوسوم، إصلاح المسارات، والتفاعلات.
 */

// --- 1. الإعدادات العامة ---
let allQuestions = [];
let searchTerm = '';
let currentPage = 1;
const itemsPerPage = 15;

// ملفات البيانات (تأكد من وجودها في مجلد data)
const DATA_FILES = ['general.json']; 

// كشف موقع الصفحة (رئيسية أم داخل مجلد questions)
const isInsideQuestions = window.location.pathname.includes('/questions/');
const baseDataPath = isInsideQuestions ? '../data/' : 'data/';
const baseArticlePath = isInsideQuestions ? '' : 'questions/';

const selectors = {
    questionsList: null,
    statsCount: null,
    searchInput: null
};

// --- 2. تهيئة العناصر ---
function initSelectors() {
    selectors.questionsList = document.getElementById('questions-list');
    selectors.statsCount = document.getElementById('stats-count');
    selectors.searchInput = document.getElementById('search-input');
}

// --- 3. جلب البيانات ---
async function loadDatabase() {
    try {
        const promises = DATA_FILES.map(async (fileName) => {
            const res = await fetch(baseDataPath + fileName);
            if (!res.ok) throw new Error("File not found");
            return await res.json();
        });
        const results = await Promise.all(promises);
        allQuestions = results.flat();
        
        if (selectors.statsCount) selectors.statsCount.innerText = allQuestions.length;
        if (selectors.questionsList) renderQuestions();
        if (isInsideQuestions) renderRelated();

        console.log("✅ تم تحميل قاعدة بيانات بيت العلم بنجاح!");
    } catch (e) {
        console.warn("⚠️ تنبيه: تعذر تحميل البيانات. تأكد من تشغيل الموقع عبر سيرفر محلي وجودة ملفات JSON.");
    }
}

// --- 4. دالة بناء وعرض الأسئلة (التصميم المطور) ---
function renderQuestions() {
    if (!selectors.questionsList) return;

    const filtered = allQuestions.filter(q => {
        const query = searchTerm.toLowerCase();
        const inTitle = (q.title || "").toLowerCase().includes(query);
        const inCategory = (q.category || "").toLowerCase().includes(query);
        const inTags = q.tags && q.tags.some(t => t.toLowerCase().includes(query));
        return inTitle || inCategory || inTags;
    });

    const paginated = filtered.slice(0, currentPage * itemsPerPage);

    if (paginated.length === 0) {
        selectors.questionsList.innerHTML = `
            <div class="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-400 shadow-sm">
                <p>لا توجد نتائج تطابق بحثك في بيت العلم حالياً.</p>
            </div>`;
        return;
    }

    selectors.questionsList.innerHTML = paginated.map(q => `
        <article class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all space-y-3">
            <div class="flex items-center justify-between">
                <span class="bg-blue-50 text-[#1e3a5a] text-[10px] font-bold px-2.5 py-1 rounded-md border border-blue-100/50">
                    ${q.category || "عام"}
                </span>
                <span class="text-[10px] text-slate-400 font-medium italic">منذ ساعات قليلة</span>
            </div>
            
            <h3 class="font-bold text-slate-800 text-base md:text-lg leading-snug">
                <a href="${baseArticlePath}${q.url}" class="hover:text-blue-600 transition-colors">${q.title}</a>
            </h3>

            <div class="flex flex-wrap gap-1.5 py-1">
                ${(q.tags || []).slice(0, 3).map(t => `<span class="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">#${t}</span>`).join('')}
            </div>

            <div class="flex items-center justify-between text-[11px] pt-3 border-t border-slate-50 text-slate-500 font-medium">
                <span class="flex items-center gap-1">
                    <span class="text-emerald-500 text-base">✔</span> إجابة نموذجية معتمدة
                </span>
                <a href="${baseArticlePath}${q.url}" class="text-blue-600 hover:underline font-bold flex items-center gap-1">
                    <span>عرض الحل الكامل</span>
                    <span>←</span>
                </a>
            </div>
        </article>
    `).join('');

    manageInfiniteScroll(filtered.length, paginated.length);
}

// --- 5. التمرير اللانهائي ---
function manageInfiniteScroll(total, current) {
    let loader = document.getElementById('infinite-loader');
    if (current < total) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'infinite-loader';
            loader.className = 'py-6 text-center text-slate-400 text-[11px] font-bold animate-pulse';
            loader.innerText = 'جاري جلب المزيد من إجابات بيت العلم...';
            selectors.questionsList.after(loader);

            const obs = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) { currentPage++; renderQuestions(); }
            }, { threshold: 0.1 });
            obs.observe(loader);
        }
    } else if (loader) loader.remove();
}

// --- 6. الأسئلة المقترحة (للمقالات الداخلية) ---
function renderRelated() {
    const relContainer = document.getElementById('related-questions');
    if (!relContainer) return;
    const currentFile = window.location.pathname.split("/").pop();
    const related = allQuestions
        .filter(q => !q.url.includes(currentFile))
        .sort(() => 0.5 - Math.random()).slice(0, 4);

    relContainer.innerHTML = `
        <h4 class="text-sm font-bold text-slate-400 mb-4 pr-3 border-r-4 border-blue-600">أسئلة مقترحة</h4>
        <div class="grid sm:grid-cols-2 gap-3">
            ${related.map(q => `
                <a href="${q.url}" class="p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-500 transition-all shadow-sm">
                    <span class="text-xs font-bold text-slate-700">${q.title}</span>
                </a>`).join('')}
        </div>`;
}

// --- 7. إصلاح المسارات والتفاعلات ---
function setupInteractions() {
    // 1. إصلاح الروابط إذا كنا داخل مجلد questions
    if (isInsideQuestions) {
        const pages = ['index.html', 'about.html', 'privacy.html'];
        document.querySelectorAll('a').forEach(a => {
            const h = a.getAttribute('href');
            if (h && pages.includes(h)) a.setAttribute('href', '../' + h);
        });
    }

    // 2. تفعيل أزرار مفيد / غير مفيد
    document.querySelectorAll("button").forEach(btn => {
        if (btn.innerText.includes("مفيد")) {
            btn.addEventListener("click", () => {
                const badge = btn.querySelector("span:last-child");
                if (badge) {
                    badge.innerText = (parseInt(badge.innerText) || 0) + 1;
                    btn.classList.add("text-emerald-600", "font-bold");
                    btn.disabled = true;
                    alert("شكراً لك! تم تسجيل تقييمك بنجاح في بيت العلم.");
                }
            });
        }
    });
}

// --- 8. تشغيل التطبيق ---
document.addEventListener("DOMContentLoaded", () => {
    initSelectors();
    loadDatabase();
    setupInteractions();

    selectors.searchInput?.addEventListener('input', (e) => {
        searchTerm = e.target.value.trim().toLowerCase();
        currentPage = 1;
        renderQuestions();
    });
});
