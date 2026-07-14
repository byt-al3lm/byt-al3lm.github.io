
/**
 * 🎓 محرك بيت العلم (مجتمع المعرفة) - الإصدار المتطور
 * مخصص للأداء العالي، متوافق مع السيو، ودعم كامل للجوال
 */

// --- 1. الإعدادات العامة وقاعدة البيانات ---
let allQuestions = [];
let searchTerm = '';
let currentPage = 1;
const itemsPerPage = 10; // عدد الأسئلة في كل "دفعة" تحميل

const DATA_FILES = ['general.json']; // أضف ملفات JSON هنا

// التحقق من المسار الحالي (جذر الموقع أم مجلد الأسئلة)
const isInsideQuestions = window.location.pathname.includes('/questions/');
const baseDataPath = isInsideQuestions ? '../data/' : 'data/';
const baseArticlePath = isInsideQuestions ? '' : 'questions/';

const selectors = {
    questionsList: null,
    statsCount: null,
    searchInput: null
};

// --- 2. تهيئة المحرك عند التحميل ---
document.addEventListener("DOMContentLoaded", () => {
    initSelectors();
    loadDatabase();
    setupInteractions();

    // ربط البحث
    selectors.searchInput?.addEventListener('input', (e) => {
        searchTerm = e.target.value.trim().toLowerCase();
        currentPage = 1; // العودة للصفحة الأولى عند البحث
        renderQuestions();
    });
});

function initSelectors() {
    selectors.questionsList = document.getElementById('questions-list');
    selectors.statsCount = document.getElementById('stats-count');
    selectors.searchInput = document.getElementById('search-input');
}

// --- 3. جلب البيانات (أداء محسن) ---
async function loadDatabase() {
    try {
        const promises = DATA_FILES.map(async (fileName) => {
            const res = await fetch(baseDataPath + fileName);
            if (!res.ok) throw new Error(`خطأ في تحميل ${fileName}`);
            return await res.json();
        });

        const results = await Promise.all(promises);
        allQuestions = results.flat();
        
        // تحديث العداد في الهيدر
        if (selectors.statsCount) {
            selectors.statsCount.innerText = `${allQuestions.length.toLocaleString()} سؤال وجواب`;
        }
        
        renderQuestions();
        if (isInsideQuestions) renderRelated();

    } catch (err) {
        console.error("⚠️ فشل تحميل قاعدة البيانات:", err);
        if (selectors.questionsList) {
            selectors.questionsList.innerHTML = `<p class="text-center py-10 text-red-500 font-bold">حدث خطأ أثناء تحميل البيانات، يرجى تحديث الصفحة.</p>`;
        }
    }
}

// --- 4. عرض الأسئلة بتصميم عصري (متوافق مع التصميم الجديد) ---
function renderQuestions() {
    if (!selectors.questionsList) return;

    // تصفية الأسئلة بناءً على البحث
    const filtered = allQuestions.filter(q => {
        const query = searchTerm.toLowerCase();
        return (q.title || "").toLowerCase().includes(query) || 
               (q.category || "").toLowerCase().includes(query) ||
               (q.tags && q.tags.some(t => t.toLowerCase().includes(query)));
    });

    // التقسيم (Pagination)
    const paginated = filtered.slice(0, currentPage * itemsPerPage);

    if (paginated.length === 0) {
        selectors.questionsList.innerHTML = `
            <div class="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-100">
                <p class="text-slate-500 font-bold">لم نجد نتائج لـ "${searchTerm}" في بيت العلم.</p>
                <button onclick="location.reload()" class="mt-4 text-blue-600 text-sm underline">إعادة تحميل الكل</button>
            </div>`;
        return;
    }

    // بناء محتوى HTML
    selectors.questionsList.innerHTML = paginated.map(q => `
        <article class="question-card bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all group relative overflow-hidden" itemscope itemtype="https://schema.org/Question">
            <div class="flex justify-between items-start mb-3">
                <span class="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    ${q.category || "عام"}
                </span>
                <span class="text-[10px] text-slate-400">#${q.id || 'Q'+Math.floor(Math.random()*1000)}</span>
            </div>
            
            <h3 class="font-bold text-slate-800 text-lg leading-snug mb-4" itemprop="name">
                <a href="${baseArticlePath}${q.url}" class="group-hover:text-blue-600 transition-colors">
                    ${q.title}
                </a>
            </h3>

            <div class="flex items-center justify-between pt-4 border-t border-slate-50">
                <div class="flex items-center gap-2 text-emerald-600">
                    <div class="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>
                    </div>
                    <span class="text-[11px] font-bold">إجابة معتمدة</span>
                </div>
                <a href="${baseArticlePath}${q.url}" class="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    عرض الحل 
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                </a>
            </div>
        </article>
    `).join('');

    manageInfiniteScroll(filtered.length, paginated.length);
}

// --- 5. التمرير اللانهائي الذكي (Infinite Scroll) ---
function manageInfiniteScroll(total, current) {
    let loader = document.getElementById('infinite-loader');
    if (current < total) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'infinite-loader';
            loader.className = 'py-8 text-center text-slate-400 text-xs font-bold animate-pulse';
            loader.innerText = 'جاري تحميل المزيد من الإجابات...';
            selectors.questionsList.after(loader);

            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    currentPage++;
                    renderQuestions();
                }
            }, { threshold: 0.5 });
            observer.observe(loader);
        }
    } else if (loader) {
        loader.remove();
    }
}

// --- 6. معالجة الروابط والتفاعلات ---
function setupInteractions() {
    // إصلاح الروابط تلقائياً إذا كنا داخل مجلد فرعي
    if (isInsideQuestions) {
        document.querySelectorAll('header a, footer a').forEach(a => {
            const href = a.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
                a.setAttribute('href', '../' + href);
            }
        });
    }

    // تأثير البحث السلس
    selectors.searchInput?.addEventListener('focus', () => {
        selectors.searchInput.parentElement.classList.add('ring-4', 'ring-blue-500/10');
    });
    selectors.searchInput?.addEventListener('blur', () => {
        selectors.searchInput.parentElement.classList.remove('ring-4', 'ring-blue-500/10');
    });
}

// --- 7. الأسئلة المقترحة (للصفحات الداخلية) ---
function renderRelated() {
    const container = document.getElementById('related-questions');
    if (!container || allQuestions.length === 0) return;

    const related = allQuestions
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

    container.innerHTML = `
        <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span class="w-1 h-5 bg-orange-500 rounded-full"></span>
            أسئلة مشابهة في بيت العلم
        </h3>
        <div class="grid gap-3">
            ${related.map(q => `
                <a href="${q.url}" class="p-4 bg-slate-50 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all block font-semibold text-sm text-slate-700">
                    ${q.title}
                </a>
            `).join('')}
        </div>`;
}
