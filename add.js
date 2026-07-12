
/**
 * 🎓 محرك بيت العلم (مجتمع المعرفة) - الإصدار الاحترافي المتوافق مع المجلدات
 * الهيكل: الرئيسية في / والمقالات في /questions/ والبيانات في /data/
 */

// --- 1. اكتشاف الموقع الحالي والتحكم في المسارات ---
const isInsideQuestions = window.location.pathname.includes('/questions/');
// إذا كنا داخل مجلد الأسئلة، نحتاج للرجوع خطوة للخلف (../) للوصول للبيانات أو الرئيسية
const pathPrefix = isInsideQuestions ? '../' : '';

let allQuestions = [];
let searchTerm = '';
let currentPage = 1;
const itemsPerPage = 15;

// --- 2. إصلاح روابط الهيدر تلقائياً (الرئيسية، عن الموقع، الخصوصية) ---
(function fixNav() {
    const adjust = () => {
        if (isInsideQuestions) {
            const targets = ['index.html', 'about.html', 'privacy.html'];
            document.querySelectorAll("a[href]").forEach(link => {
                const href = link.getAttribute("href");
                if (targets.includes(href)) {
                    link.setAttribute("href", pathPrefix + href);
                }
            });
        }
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", adjust);
    else adjust();
})();

// --- 3. جلب قاعدة البيانات ---
async function loadDatabase() {
    try {
        // الوصول للمجلد data بناءً على مكان الصفحة الحالية
        const response = await fetch(pathPrefix + 'data/general.json');
        if (!response.ok) throw new Error('تعذر تحميل البيانات');

        allQuestions = await response.json();

        const stats = document.getElementById('stats-count');
        if (stats) stats.textContent = allQuestions.length.toLocaleString();

        if (document.getElementById('questions-list')) renderQuestions();
        if (document.getElementById('related-questions')) renderRelated();

    } catch (err) {
        console.error("❌ فشل في جلب البيانات:", err);
    }
}

// --- 4. دالة عرض الأسئلة (بتصميم بيت العلم المطور) ---
function renderQuestions() {
    const list = document.getElementById('questions-list');
    if (!list) return;

    const filtered = allQuestions.filter(q =>
        (q.title || '').toLowerCase().includes(searchTerm)
    );

    const paginated = filtered.slice(0, currentPage * itemsPerPage);

    list.innerHTML = paginated.map(q => {
        // تحديد رابط المقال: 
        // إذا كنا في الرئيسية، نذهب لـ questions/
        // إذا كنا داخل المجلد بالفعل، نفتح الملف مباشرة
        const finalArticleUrl = isInsideQuestions ? q.url : 'questions/' + q.url;

        return `
        <article class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4 mb-4 hover:border-blue-400 hover:shadow-md transition-all group">
            
            <!-- مربعات الإحصائيات الملونة -->
            <div class="flex gap-2 shrink-0">
                <div class="w-[65px] h-[70px] bg-[#1e3a5a] text-white rounded-xl flex flex-col items-center justify-center shadow-sm">
                    <span class="text-lg font-bold leading-none">${Math.floor(Math.random() * 10)}</span>
                    <span class="text-[9px] uppercase font-bold opacity-70 italic mt-1">Votes</span>
                </div>
                <div class="w-[65px] h-[70px] bg-[#a68b4c] text-white rounded-xl flex flex-col items-center justify-center text-center px-1 shadow-sm">
                    <span class="text-lg font-bold leading-none">1</span>
                    <span class="text-[8px] font-bold leading-tight uppercase italic opacity-90 mt-1">لحون<br>Answers</span>
                </div>
            </div>

            <!-- محتوى السؤال -->
            <div class="flex-grow text-right">
                <span class="text-[10px] font-bold bg-green-700 text-white px-2.5 py-1 rounded-md mb-2 inline-block">
                    ${q.category || 'تفسير الاحلام'}
                </span>

                <h2 class="text-lg font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors">
                    <a href="${finalArticleUrl}">${q.title}</a>
                </h2>

                <div class="flex justify-between items-center mt-4 pt-3 border-t border-slate-50 text-[11px] font-bold text-slate-400">
                    <span class="flex items-center gap-1">
                        <span class="w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px]">✔</span>
                        إجابة معتمدة ببيت العلم
                    </span>

                    <a href="${finalArticleUrl}" class="text-blue-600 font-black hover:underline">
                        عرض الحل الكامل ←
                    </a>
                </div>
            </div>
        </article>
    `;
    }).join('');

    manageInfiniteScroll(filtered.length, paginated.length);
}

// --- 5. التمرير اللانهائي (Infinite Scroll) ---
function manageInfiniteScroll(total, current) {
    let loader = document.getElementById('infinite-loader');
    if (current < total) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'infinite-loader';
            loader.className = 'py-8 text-center text-slate-400 text-xs font-bold animate-pulse';
            loader.textContent = 'جاري جلب المزيد من إجابات بيت العلم...';
            document.getElementById('questions-list').after(loader);
            const observer = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    currentPage++;
                    renderQuestions();
                }
            }, { threshold: 0.1 });
            observer.observe(loader);
        }
    } else if (loader) loader.remove();
}

// --- 6. الأسئلة المقترحة (في صفحات المقال الداخلية) ---
function renderRelated() {
    const container = document.getElementById('related-questions');
    if (!container) return;

    const currentFilename = window.location.pathname.split('/').pop();

    const related = allQuestions
        .filter(q => q.url !== currentFilename)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

    container.innerHTML = `
        <h4 class="text-sm font-black text-[#1e3a5a] mb-5 pr-3 border-r-4 border-orange-500">
            أسئلة مقترحة قد تهمك
        </h4>
        <div class="grid sm:grid-cols-2 gap-3">
            ${related.map(q => `
                <a href="${q.url}" class="p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 shadow-sm transition-all group">
                    <span class="text-xs font-bold text-slate-700 group-hover:text-blue-600 leading-relaxed">
                        ${q.title}
                    </span>
                </a>
            `).join('')}
        </div>
    `;
}

// --- 7. تشغيل المحرك والبحث ---
document.addEventListener('DOMContentLoaded', () => {
    loadDatabase();

    const search = document.getElementById('search-input');
    if (search) {
        search.addEventListener('input', e => {
            searchTerm = e.target.value.toLowerCase().trim();
            currentPage = 1;
            renderQuestions();
        });
    }
});
