
/**
 * 🎓 محرك بيت العلم - إصدار الإصلاح الشامل للمسارات (V7.0)
 * حل مشكلة الروابط في المجلدات الفرعية + التمرير اللانهائي
 */

// 1. اكتشاف الموقع الحالي فوراً (قبل أي شيء)
const currentURL = window.location.pathname.toLowerCase();
const isInsideQuestions = currentURL.includes('/questions/');

// تحضير الـ Prefix: إذا كنا داخل المجلد نستخدم ../ للرجوع للمجلد الرئيسي
const folderPrefix = isInsideQuestions ? '../' : '';

// إعدادات البيانات
let allQuestions = [];
let searchTerm = '';
let currentPage = 1;
const itemsPerPage = 15;

/**
 * دالة إصلاح الروابط (الحل الجذري)
 * تقوم بتحويل index.html إلى ../index.html داخل صفحات المقالات
 */
function forceFixLinks() {
    const targets = ['index.html', 'about.html', 'privacy.html'];
    
    // استهداف كافة الروابط في الصفحة
    const allLinks = document.querySelectorAll('a');
    
    allLinks.forEach(link => {
        const href = link.getAttribute('href'); // جلب النص المكتوب في الـ HTML
        
        if (isInsideQuestions && href && targets.includes(href)) {
            // إضافة ../ للرابط لإرجاعه للمجلد الرئيسي
            link.setAttribute('href', folderPrefix + href);
        }
    });
    console.log("🛠️ تم إصلاح مسارات الروابط: تم إضافة ../ للرجوع للمجلد الرئيسي");
}

// تنفيذ الإصلاح فوراً (حتى قبل اكتمال تحميل الصور)
forceFixLinks();

// --- 2. جلب البيانات من المجلد الصحيح ---
async function loadDatabase() {
    const dataPath = folderPrefix + 'data/general.json';
    try {
        const response = await fetch(dataPath);
        if (!response.ok) throw new Error("File not found");
        allQuestions = await response.json();
        
        const stats = document.getElementById('stats-count');
        if (stats) stats.innerText = allQuestions.length.toLocaleString();
        
        if (document.getElementById('questions-list')) renderQuestions();
        if (isInsideQuestions) renderRelated();
    } catch (err) {
        console.warn("⚠️ تنبيه: تعذر تحميل البيانات. تأكد من تشغيل Live Server.");
    }
}

// --- 3. عرض قائمة الأسئلة (الصفحة الرئيسية) ---
function renderQuestions() {
    const list = document.getElementById('questions-list');
    if (!list) return;

    const filtered = allQuestions.filter(q => 
        (q.title || "").toLowerCase().includes(searchTerm)
    );

    const paginated = filtered.slice(0, currentPage * itemsPerPage);

    list.innerHTML = paginated.map(q => {
        // إذا كنا في الرئيسية، الرابط يجب أن يسبقه questions/
        // إذا كنا داخل المجلد، الرابط هو اسم الملف مباشرة
        const articleLink = isInsideQuestions ? q.url : 'questions/' + q.url;

        return `
            <article class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4 mb-4 hover:border-blue-400 transition-all">
                <div class="hidden sm:flex flex-col items-center gap-1 shrink-0 w-16 text-center">
                    <span class="text-sm font-bold text-slate-700">0</span>
                    <span class="text-[10px] text-slate-400 font-bold uppercase">Votes</span>
                    <div class="bg-green-600 text-white px-2 py-1 rounded text-[10px] font-bold mt-1">إجابة</div>
                </div>
                <div class="flex-grow">
                    <span class="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">${q.category || 'عام'}</span>
                    <h2 class="text-lg font-bold text-blue-800 mt-2 mb-2">
                        <a href="${articleLink}">${q.title}</a>
                    </h2>
                    <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 text-[11px] font-bold text-slate-400">
                        <span class="flex items-center gap-1"><span class="text-emerald-500">✔</span> إجابة معتمدة</span>
                        <a href="${articleLink}" class="text-blue-600">عرض الحل ←</a>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    manageInfiniteScroll(filtered.length, paginated.length);
}

// --- 4. التمرير اللانهائي ---
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

// --- 5. الأسئلة المقترحة (داخل المقالات) ---
function renderRelated() {
    const rel = document.getElementById('related-questions');
    if (!rel) return;
    const current = window.location.pathname.split("/").pop();
    const related = allQuestions
        .filter(q => !q.url.includes(current))
        .sort(() => 0.5 - Math.random()).slice(0, 4);

    rel.innerHTML = `
        <h4 class="text-sm font-bold text-slate-400 mb-4 pr-3 border-r-4 border-blue-600">أسئلة مقترحة ببيت العلم</h4>
        <div class="grid sm:grid-cols-2 gap-3">
            ${related.map(q => `
                <a href="${q.url}" class="p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-500 shadow-sm transition-all">
                    <span class="text-xs font-bold text-slate-700 leading-snug">${q.title}</span>
                </a>`).join('')}
        </div>`;
}

// --- 6. تشغيل التطبيق ---
document.addEventListener("DOMContentLoaded", () => {
    // تشغيل الإصلاح مرة أخرى للتأكد بعد اكتمال تحميل العناصر
    forceFixLinks();
    loadDatabase();

    const search = document.getElementById('search-input');
    if (search) {
        search.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            currentPage = 1;
            renderQuestions();
        });
    }
});
