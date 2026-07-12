
/**
 * 🎓 محرك بيت العلم - إصدار "الإصلاح الشامل للمسارات"
 */

let allQuestions = [];
let searchTerm = '';
let currentPage = 1;
const itemsPerPage = 15;

// 1. تحديد مستوى المجلد الحالي (هل نحن داخل questions؟)
// إذا كان الرابط يحتوي على /questions/ فإن المسار للرجوع هو ../
const isSubDir = window.location.pathname.toLowerCase().includes('/questions/');
const prefix = isSubDir ? '../' : '';

// إعدادات المسارات
const DATA_FILES = [prefix + 'data/general.json'];

// --- 2. دالة إصلاح الروابط (تعمل فوراً وبدقة) ---
function fixLinks() {
    const navLinks = document.querySelectorAll('a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // إذا كنا داخل مجلد فرعي، نعدل الروابط الرئيسية فقط
        if (isSubDir) {
            if (href === 'index.html' || href === 'about.html' || href === 'privacy.html') {
                link.href = prefix + href;
            }
        }
    });
}

// --- 3. جلب البيانات ---
async function loadDatabase() {
    try {
        const promises = DATA_FILES.map(async (path) => {
            const res = await fetch(path);
            if (!res.ok) return [];
            return await res.json();
        });

        const results = await Promise.all(promises);
        allQuestions = results.flat();
        
        const stats = document.getElementById('stats-count');
        if (stats) stats.innerText = allQuestions.length.toLocaleString();
        
        if (document.getElementById('questions-list')) renderQuestions();
        if (isSubDir) renderRelated();

    } catch (err) {
        console.error("خطأ في البيانات:", err);
    }
}

// --- 4. عرض الأسئلة ---
function renderQuestions() {
    const list = document.getElementById('questions-list');
    if (!list) return;

    const filtered = allQuestions.filter(q => 
        (q.title || "").toLowerCase().includes(searchTerm)
    );

    const paginated = filtered.slice(0, currentPage * itemsPerPage);

    list.innerHTML = paginated.map(q => `
        <article class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4 mb-4 hover:border-blue-400 transition-all">
            <div class="hidden sm:flex flex-col items-center gap-1 shrink-0 w-16 text-center">
                <span class="text-sm font-bold text-slate-700">0</span>
                <span class="text-[10px] text-slate-400 font-bold uppercase">Votes</span>
                <div class="bg-green-600 text-white px-2 py-1 rounded text-[10px] font-bold mt-1">إجابة</div>
            </div>
            <div class="flex-grow">
                <span class="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">${q.category || 'عام'}</span>
                <h2 class="text-lg font-bold text-blue-800 mt-2 mb-2 leading-tight">
                    <a href="${prefix}questions/${q.url}">${q.title}</a>
                </h2>
                <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 text-[11px] font-bold">
                    <span class="text-emerald-600">✔ إجابة معتمدة</span>
                    <a href="${prefix}questions/${q.url}" class="text-blue-600">عرض الحل الكامل ←</a>
                </div>
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
            loader.className = 'py-6 text-center text-slate-400 text-xs font-bold';
            loader.innerText = 'جاري التحميل...';
            document.getElementById('questions-list').after(loader);
            const obs = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) { currentPage++; renderQuestions(); }
            });
            obs.observe(loader);
        }
    } else if (loader) loader.remove();
}

// --- 6. الأسئلة المقترحة ---
function renderRelated() {
    const rel = document.getElementById('related-questions');
    if (!rel) return;
    const current = window.location.pathname.split("/").pop();
    const related = allQuestions
        .filter(q => !q.url.includes(current))
        .sort(() => 0.5 - Math.random()).slice(0, 4);

    rel.innerHTML = `
        <h4 class="text-sm font-bold text-slate-400 mb-4 pr-3 border-r-4 border-blue-600">أسئلة مقترحة</h4>
        <div class="grid sm:grid-cols-2 gap-3">
            ${related.map(q => `
                <a href="${q.url}" class="p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-500 shadow-sm transition-all">
                    <span class="text-xs font-bold text-slate-700">${q.title}</span>
                </a>`).join('')}
        </div>`;
}

// --- 7. التشغيل ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. إصلاح الروابط فوراً
    fixLinks();
    
    // 2. تحميل البيانات
    loadDatabase();

    // 3. البحث
    const search = document.getElementById('search-input');
    if (search) {
        search.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            currentPage = 1;
            renderQuestions();
        });
    }
});
