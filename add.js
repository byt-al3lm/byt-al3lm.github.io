/**
 * 🎓 محرك بيت العلم - الإصدار بدون مجلد questions
 * جميع الصفحات موجودة في المجلد الرئيسي.
 */
/**
 * إصلاح روابط الصفحات الثابتة
 * يحول:
 * /questions/index.html    -> /index.html
 * /questions/about.html    -> /about.html
 * /questions/privacy.html  -> /privacy.html
 */

(function () {

    const fixedLinks = {
        "/questions/index.html": "/index.html",
        "/questions/about.html": "/about.html",
        "/questions/privacy.html": "/privacy.html",

        "questions/index.html": "index.html",
        "questions/about.html": "about.html",
        "questions/privacy.html": "privacy.html"
    };

    function fixLinks() {

        document.querySelectorAll("a[href]").forEach(link => {

            const href = link.getAttribute("href");

            if (fixedLinks[href]) {
                link.setAttribute("href", fixedLinks[href]);
            }

        });

    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fixLinks);
    } else {
        fixLinks();
    }

})();
// إعدادات البيانات
let allQuestions = [];
let searchTerm = '';
let currentPage = 1;
const itemsPerPage = 15;

// تحميل قاعدة البيانات
async function loadDatabase() {
    try {
        const response = await fetch('data/general.json');

        if (!response.ok) {
            throw new Error('تعذر تحميل قاعدة البيانات');
        }

        allQuestions = await response.json();

        const stats = document.getElementById('stats-count');
        if (stats) {
            stats.textContent = allQuestions.length.toLocaleString();
        }

        if (document.getElementById('questions-list')) {
            renderQuestions();
        }

        if (document.getElementById('related-questions')) {
            renderRelated();
        }

    } catch (err) {
        console.error(err);
    }
}

// عرض الأسئلة
function renderQuestions() {
    const list = document.getElementById('questions-list');
    if (!list) return;

    const filtered = allQuestions.filter(q =>
        (q.title || '').toLowerCase().includes(searchTerm)
    );

    const paginated = filtered.slice(0, currentPage * itemsPerPage);

    list.innerHTML = paginated.map(q => `
        <article class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4 mb-4 hover:border-blue-400 transition-all">

            <div class="hidden sm:flex flex-col items-center gap-1 shrink-0 w-16 text-center">
                <span class="text-sm font-bold text-slate-700">0</span>
                <span class="text-[10px] text-slate-400 font-bold uppercase">Votes</span>
                <div class="bg-green-600 text-white px-2 py-1 rounded text-[10px] font-bold mt-1">
                    إجابة
                </div>
            </div>

            <div class="flex-grow">
                <span class="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">
                    ${q.category || 'عام'}
                </span>

                <h2 class="text-lg font-bold text-blue-800 mt-2 mb-2">
                    <a href="${q.url}">
                        ${q.title}
                    </a>
                </h2>

                <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 text-[11px] font-bold text-slate-400">
                    <span class="flex items-center gap-1">
                        <span class="text-emerald-500">✔</span>
                        إجابة معتمدة
                    </span>

                    <a href="${q.url}" class="text-blue-600">
                        عرض الحل ←
                    </a>
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
            loader.className = 'py-6 text-center text-slate-400 text-xs font-bold';
            loader.textContent = 'جاري التحميل...';

            document.getElementById('questions-list').after(loader);

            const observer = new IntersectionObserver(entries => {

                if (entries[0].isIntersecting) {
                    currentPage++;
                    renderQuestions();
                }

            });

            observer.observe(loader);
        }

    } else {

        if (loader) loader.remove();

    }
}

// الأسئلة المقترحة
function renderRelated() {

    const container = document.getElementById('related-questions');

    if (!container) return;

    const currentPageName = window.location.pathname.split('/').pop();

    const related = allQuestions
        .filter(q => q.url !== currentPageName)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

    container.innerHTML = `
        <h4 class="text-sm font-bold text-slate-400 mb-4 pr-3 border-r-4 border-blue-600">
            أسئلة مقترحة ببيت العلم
        </h4>

        <div class="grid sm:grid-cols-2 gap-3">

            ${related.map(q => `
                <a href="${q.url}" class="p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-500 shadow-sm transition-all">
                    <span class="text-xs font-bold text-slate-700 leading-snug">
                        ${q.title}
                    </span>
                </a>
            `).join('')}

        </div>
    `;
}

// تشغيل الموقع
document.addEventListener('DOMContentLoaded', () => {

    loadDatabase();

    const search = document.getElementById('search-input');

    if (search) {

        search.addEventListener('input', e => {

            searchTerm = e.target.value.toLowerCase();
            currentPage = 1;
            renderQuestions();

        });

    }

});
