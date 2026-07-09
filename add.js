/**
 * بيت العلم - Core Controller
 * المجلدات: /data/ للبيانات و /questions/ للمقالات
 */

// --- Global App State ---
let allQuestions = [];
let activeCategory = 'all';
let searchTerm = '';
let activeSort = 'newest';
const itemsPerPage = 15; 
let currentPage = 1;

// مصفوفة ملفات البيانات في مجلد /data/
const DATA_FILES = ['data/tafsir-alahlam.json', 'data/islamic.json', 'data/science.json'];

const selectors = {
    questionsList: null,
    categoriesFilter: null,
    searchDesktop: null,
    searchMobile: null,
    scrollProgress: null,
    backToTopBtn: null,
    statsCount: null
};

function initSelectors() {
    selectors.questionsList = document.getElementById('questions-list');
    selectors.categoriesFilter = document.getElementById('categories-filter');
    selectors.searchDesktop = document.getElementById('search-input');
    selectors.searchMobile = document.getElementById('search-input-mobile');
    selectors.scrollProgress = document.getElementById('scroll-progress');
    selectors.backToTopBtn = document.getElementById('back-to-top');
    selectors.statsCount = document.getElementById('stats-count');
}

// --- Utilities ---
function showToast(message) {
    const existing = document.querySelector('.toast-popup');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-popup fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xl z-[100] transition-all duration-300 border border-slate-700';
    toast.innerText = message;
    document.body.appendChild(toast);
    toast.offsetHeight;
    requestAnimationFrame(() => toast.classList.add('opacity-100'));
    setTimeout(() => { toast.remove(); }, 2500);
}

window.copyCurrentUrl = function() {
    navigator.clipboard.writeText(window.location.href).then(() => showToast("تم نسخ رابط المقال!"));
};

window.copyQuestionLink = function(url) {
    // التأكد من إضافة مسار المجلد إذا لم يكن موجوداً
    const finalUrl = url.startsWith('questions/') ? url : `questions/${url}`;
    const fullUrl = new URL(finalUrl, window.location.origin).href;
    navigator.clipboard.writeText(fullUrl).then(() => showToast("تم نسخ رابط السؤال!"));
};

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function getMockStats(title = '') {
    let hash = 0;
    for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
    return { votes: Math.abs(hash % 85) + 15, views: Math.abs(hash % 900) + 100 };
}

// --- Rendering Logic ---

function renderQuestions() {
    if (!selectors.questionsList) return;

    const filtered = allQuestions.filter(q => {
        const matchesSearch = q.title?.toLowerCase().includes(searchTerm) || q.category?.toLowerCase().includes(searchTerm);
        const matchesCategory = activeCategory === 'all' || q.category?.toLowerCase() === activeCategory;
        return matchesSearch && matchesCategory;
    });

    if (activeSort === 'popular') {
        filtered.sort((a, b) => getMockStats(b.title).votes - getMockStats(a.title).votes);
    }

    const paginatedQuestions = filtered.slice(0, currentPage * itemsPerPage);

    selectors.questionsList.innerHTML = paginatedQuestions.map(q => {
        const stats = getMockStats(q.title);
        // إصلاح المسار ليكون داخل مجلد questions
        const articleUrl = q.url.startsWith('questions/') ? q.url : `questions/${q.url}`;

        return `
            <article class="reveal bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex gap-4 transition-all">
                <div class="hidden sm:flex flex-col items-center gap-3 shrink-0 w-16 text-center">
                    <span class="text-sm font-extrabold text-slate-700 dark:text-slate-300">${stats.votes}</span>
                    <div class="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold uppercase">إجابة</div>
                </div>

                <div class="flex-grow flex flex-col justify-between">
                    <div>
                        <span class="px-2 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-600 rounded-md">${q.category || 'عام'}</span>
                        <h2 class="text-base font-bold text-slate-900 dark:text-white mt-2 mb-2 hover:text-indigo-600">
                            <a href="${articleUrl}">${q.title}</a>
                        </h2>
                    </div>

                    <div class="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                        <span class="text-[11px] text-slate-400">المشاهدات: ${stats.views}</span>
                        <button onclick="copyQuestionLink('${q.url}')" class="text-slate-400 hover:text-indigo-600">
                             <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
    
    initAnimations();
}

// --- Initialization ---

document.addEventListener("DOMContentLoaded", function() {
    initSelectors();

    // 1. تحديد ما إذا كنا في الصفحة الرئيسية أم داخل مجلد المقالات
    const isInsideQuestions = window.location.pathname.includes('/questions/');
    
    // تعديل مسارات الـ JSON بناءً على موقع الصفحة
    const fetchPaths = DATA_FILES.map(path => isInsideQuestions ? `../${path}` : path);

    // 2. تحميل البيانات من المجلد المستقل
    if (selectors.questionsList || document.getElementById('related-questions')) {
        Promise.all(fetchPaths.map(url => fetch(url).then(res => res.json())))
            .then(results => {
                allQuestions = results.flat();
                if (selectors.statsCount) selectors.statsCount.innerText = allQuestions.length.toLocaleString();
                
                if (selectors.questionsList) {
                    setupCategories(allQuestions);
                    renderQuestions();
                }

                // 3. معالجة الأسئلة المقترحة داخل صفحة المقال
                const relContainer = document.getElementById('related-questions');
                if (relContainer) {
                    const currentFile = window.location.pathname.split("/").pop();
                    let related = allQuestions
                        .filter(q => !q.url.includes(currentFile))
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 4);

                    relContainer.innerHTML = `
                        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">أسئلة مقترحة لك</h4>
                        <div class="grid sm:grid-cols-2 gap-3">
                            ${related.map(q => `
                                <a href="${q.url.includes('/') ? q.url.split('/').pop() : q.url}" class="p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-500 transition-all flex justify-between items-center group">
                                    <span class="text-xs font-bold text-slate-700 group-hover:text-indigo-600">${q.title}</span>
                                    <svg class="w-4 h-4 text-slate-300 group-hover:text-indigo-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
                                </a>
                            `).join('')}
                        </div>
                    `;
                }
            })
            .catch(err => console.error("فشل تحميل قاعدة البيانات:", err));
    }

    // 4. معالجة البحث
    const handleSearch = debounce((e) => {
        searchTerm = e.target.value.toLowerCase();
        currentPage = 1;
        renderQuestions();
    }, 200);

    selectors.searchDesktop?.addEventListener('input', handleSearch);
    selectors.searchMobile?.addEventListener('input', handleSearch);
});

function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('opacity-100', 'translate-y-0'); observer.unobserve(e.target); } });
    }, { threshold: 0.01 });
    document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('transition-all', 'duration-500', 'opacity-0', 'translate-y-4');
        observer.observe(el);
    });
}

function setupCategories(data) {
    if (!selectors.categoriesFilter) return;
    const cats = ['all', ...new Set(data.map(q => q.category?.toLowerCase() || 'general'))];
    selectors.categoriesFilter.innerHTML = cats.map(c => `
        <button onclick="filterCategory('${c}')" class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${activeCategory === c ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-500'}">
            ${c === 'all' ? 'الكل' : c}
        </button>
    `).join('');
}

window.filterCategory = function(c) { activeCategory = c; setupCategories(allQuestions); renderQuestions(); };
