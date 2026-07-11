
/**
 * محرك بيت العلم المطور - متوافق مع التصميم الجديد
 */

let allQuestions = [];
let activeCategory = 'all';
let searchTerm = '';
let currentPage = 1;
const itemsPerPage = 15;

const DATA_FILES = ['general.json']; 
const isInsideQuestions = window.location.pathname.includes('/questions/');
const baseDataPath = isInsideQuestions ? '../data/' : 'data/';
const baseArticlePath = isInsideQuestions ? '' : 'questions/';

const selectors = {
    questionsList: null,
    searchDesktop: null,
    statsCount: null
};

function initSelectors() {
    selectors.questionsList = document.getElementById('questions-list');
    selectors.searchDesktop = document.getElementById('search-input');
    selectors.statsCount = document.getElementById('stats-count');
}

// تحميل البيانات
async function loadDatabase() {
    try {
        const promises = DATA_FILES.map(async (fileName) => {
            const res = await fetch(baseDataPath + fileName);
            return res.ok ? await res.json() : [];
        });
        const results = await Promise.all(promises);
        allQuestions = results.flat();
        
        if (selectors.statsCount) selectors.statsCount.innerText = allQuestions.length.toLocaleString();
        if (selectors.questionsList) renderQuestions();
    } catch (e) { console.error("فشل التحميل", e); }
}

// عرض الأسئلة بتصميم البطاقة الجديد
function renderQuestions() {
    if (!selectors.questionsList) return;

    const filtered = allQuestions.filter(q => 
        (q.title || "").toLowerCase().includes(searchTerm)
    );

    const paginated = filtered.slice(0, currentPage * itemsPerPage);

    selectors.questionsList.innerHTML = paginated.map(q => `
        <article class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4 hover:shadow-md transition-all">
            
            <!-- مربعات الإحصائيات (مثل الصورة) -->
            <div class="flex gap-2 shrink-0">
                <div class="stats-box bg-[#1e3a5a] text-white rounded-xl flex flex-col items-center justify-center">
                    <span class="text-lg font-bold">${q.votes || 0}</span>
                    <span class="text-[9px] uppercase font-bold opacity-80 italic">تصويتات</span>
                </div>
                <div class="stats-box bg-[#a68b4c] text-white rounded-xl flex flex-col items-center justify-center text-center px-1">
                    <span class="text-lg font-bold">1</span>
                    <span class="text-[8px] font-bold leading-tight uppercase italic text-sky-100">إجابة</span>
                </div>
            </div>

            <!-- محتوى السؤال -->
            <div class="flex-grow">
                <div class="flex justify-between items-start mb-1">
                    <span class="text-[10px] font-bold bg-green-700 text-white px-2 py-0.5 rounded-md">${q.category || 'تفسير الاحلام'}</span>
                </div>
                <h2 class="text-[15px] font-bold text-slate-800 leading-snug mb-3">
                    <a href="${baseArticlePath}${q.url}" class="hover:text-blue-700">${q.title}</a>
                </h2>
                
                <!-- الوسوم والمعلومات السفلية -->
                <div class="flex justify-between items-center mt-auto">
                    <div class="flex gap-1 flex-wrap">
                        ${(q.tags || []).slice(0, 3).map(t => `<span class="bg-[#1e3a5a] text-white text-[9px] px-2 py-0.5 rounded">${t}</span>`).join('')}
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] text-slate-500 font-bold italic">بيت العلم</span>
                        <div class="w-6 h-6 bg-slate-200 rounded-full border border-white shadow-sm overflow-hidden">
                           <img src="https://ui-avatars.com/api/?name=Alm&background=1e3a5a&color=fff" alt="User">
                        </div>
                    </div>
                </div>
            </div>
        </article>
    `).join('');

    manageInfiniteScroll(filtered.length, paginated.length);
}

// التمرير اللانهائي
function manageInfiniteScroll(total, current) {
    let loader = document.getElementById('infinite-loader');
    if (current < total) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'infinite-loader';
            loader.className = 'py-4 text-center text-slate-400 text-[10px] font-bold';
            loader.innerText = 'جاري تحميل المزيد...';
            selectors.questionsList.after(loader);
            const obs = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) { currentPage++; renderQuestions(); }
            }, { threshold: 0.1 });
            obs.observe(loader);
        }
    } else if (loader) loader.remove();
}

// إصلاح الروابط تلقائياً
function fixLinks() {
    if (isInsideQuestions) {
        const pages = ['index.html', 'about.html', 'privacy.html'];
        document.querySelectorAll('a').forEach(a => {
            const h = a.getAttribute('href');
            if (h && pages.includes(h)) a.setAttribute('href', '../' + h);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initSelectors();
    loadDatabase();
    fixLinks();
    selectors.searchDesktop?.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        currentPage = 1;
        renderQuestions();
    });
});
