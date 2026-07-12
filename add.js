
/**
 * 🎓 محرك بيت العلم (مجتمع المعرفة) - الإصدار النهائي المطور
 * مخصص لإدارة +10,000 سؤال بأداء عالٍ وتصحيح تلقائي للمسارات
 */

// --- 1. الإعدادات العامة وقاعدة البيانات ---
let allQuestions = [];
let searchTerm = '';
let currentPage = 1;
const itemsPerPage = 12;

// أسماء ملفات البيانات في مجلد /data/
const DATA_FILES = ['general.json']; 

// كشف موقع الصفحة الحالي
const isInsideQuestions = window.location.pathname.includes('/questions/');

// البيانات
const baseDataPath = isInsideQuestions ? '../data/' : 'data/';

// المقالات تبقى داخل questions
const baseArticlePath = isInsideQuestions ? '' : 'questions/';

// الصفحات الثابتة أصبحت في المجلد الرئيسي
const ROOT_PREFIX = isInsideQuestions ? '../' : '';

const selectors = {
    questionsList: null,
    statsCount: null,
    searchInput: null
};

// --- 2. تهيئة العناصر الأساسية ---
function initSelectors() {
    selectors.questionsList = document.getElementById('questions-list');
    selectors.statsCount = document.getElementById('stats-count');
    selectors.searchInput = document.getElementById('search-input');
}

// --- 3. جلب البيانات من ملفات JSON ---
async function loadDatabase() {
    try {
        const promises = DATA_FILES.map(async (fileName) => {
            const res = await fetch(baseDataPath + fileName);
            if (!res.ok) throw new Error(`تعذر العثور على ${fileName}`);
            return await res.json();
        });

        const results = await Promise.all(promises);
        allQuestions = results.flat();
        
        if (selectors.statsCount) selectors.statsCount.innerText = allQuestions.length.toLocaleString();
        
        if (selectors.questionsList) renderQuestions();
        if (isInsideQuestions) renderRelated();

    } catch (err) {
        console.warn("⚠️ تنبيه: فشل تحميل قاعدة البيانات. تأكد من تشغيل المشروع عبر سيرفر محلي.", err);
    }
}

// --- 4. عرض الأسئلة (التصميم المطور لبيت العلم) ---
function renderQuestions() {
    if (!selectors.questionsList) return;

    const filtered = allQuestions.filter(q => {
        const query = searchTerm.toLowerCase();
        return (q.title || "").toLowerCase().includes(query) || 
               (q.category || "").toLowerCase().includes(query) ||
               (q.tags && q.tags.some(t => t.toLowerCase().includes(query)));
    });

    const paginated = filtered.slice(0, currentPage * itemsPerPage);

    if (paginated.length === 0) {
        selectors.questionsList.innerHTML = `<div class="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm text-slate-500 font-bold">عذراً، لم نجد نتائج تطابق بحثك.</div>`;
        return;
    }

    selectors.questionsList.innerHTML = paginated.map(q => `
        <article class="reveal bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all space-y-3 relative overflow-hidden group">
            <div class="flex items-center justify-between">
                <span class="bg-blue-50 text-[#1e3a5a] text-[10px] font-black px-2.5 py-1 rounded-md border border-blue-100/50 uppercase">
                    ${q.category || "عام"}
                </span>
                <span class="text-[10px] text-slate-400 font-bold flex items-center gap-1 italic">
                    منذ ساعات قليلة
                </span>
            </div>
            
            <h3 class="font-bold text-slate-800 text-base md:text-lg leading-snug">
                <a href="${baseArticlePath}${q.url}" class="hover:text-blue-600 transition-colors">${q.title}</a>
            </h3>

            <div class="flex flex-wrap gap-1.5 py-1">
                ${(q.tags || []).slice(0, 3).map(t => `<span class="text-[9px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100 italic">#${t}</span>`).join('')}
            </div>

            <div class="flex items-center justify-between text-[11px] pt-4 border-t border-slate-50 text-slate-500 font-bold">
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

// --- 5. التمرير اللانهائي (Infinite Scroll) ---
function manageInfiniteScroll(total, current) {
    let loader = document.getElementById('infinite-loader');
    if (current < total) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'infinite-loader';
            loader.className = 'py-10 text-center text-slate-400 text-[11px] font-black animate-pulse';
            loader.innerText = 'جاري جلب المزيد من المعرفة...';
            selectors.questionsList.after(loader);

            const obs = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) { currentPage++; renderQuestions(); }
            }, { threshold: 0.1 });
            obs.observe(loader);
        }
    } else if (loader) loader.remove();
}

// --- 6. الأسئلة المقترحة (للصفحات الداخلية) ---
function renderRelated() {
    const relContainer = document.getElementById('related-questions');
    if (!relContainer) return;
    const currentFile = window.location.pathname.split("/").pop();
    const related = allQuestions
        .filter(q => !q.url.includes(currentFile))
        .sort(() => 0.5 - Math.random()).slice(0, 4);

    relContainer.innerHTML = `
        <h4 class="text-sm font-black text-[#1e3a5a] mb-5 pr-3 border-r-4 border-orange-500">أسئلة قد تهمك</h4>
        <div class="grid sm:grid-cols-2 gap-4">
            ${related.map(q => `
                <a href="${q.url}" class="p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all shadow-sm group">
                    <span class="text-xs font-bold text-slate-700 group-hover:text-blue-600 leading-relaxed">${q.title}</span>
                </a>`).join('')}
        </div>`;
}

// --- 7. إصلاح المسارات والتفاعلات الذكية ---
function setupInteractions() {
    // إصلاح روابط الصفحات الثابتة فقط
    const pages = ['index.html', 'about.html', 'privacy.html'];

    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');

        // لا نعدل روابط المقالات
        if (!pages.includes(href)) return;

        // جميع الصفحات الثابتة أصبحت في المجلد الرئيسي
        link.setAttribute('href', ROOT_PREFIX + href);
    });

    // تفعيل زر مفيد
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn || !btn.innerText.includes('مفيد') || btn.disabled) return;

        const countSpan = btn.querySelector('span:last-child');
        if (countSpan) {
            countSpan.innerText = (parseInt(countSpan.innerText) || 0) + 1;
            btn.disabled = true;
            btn.classList.add('text-emerald-600', 'scale-105');
            showToast('شكراً لك! تم تسجيل تقييمك.');
        }
    });
}

// --- 8. تأثيرات الظهور التدريجي (Animations) ---
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('opacity-100', 'translate-y-0'); observer.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('transition-all', 'duration-500', 'opacity-0', 'translate-y-4');
        observer.observe(el);
    });
}

// --- 9. أداة تنبيه (Toast) ---
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#1e3a5a] text-white px-6 py-3 rounded-2xl text-[11px] font-bold shadow-2xl z-[100] transition-all duration-300';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.classList.add('opacity-0'); setTimeout(() => toast.remove(), 500); }, 3000);
}

// --- 10. التشغيل النهائي ---
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
