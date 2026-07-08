/**
 * byt-al3lm.github.io Core Controller - بيت العلم
 */

let allQuestions = [];
let activeCategory = 'all';
let searchTerm = '';
let activeSort = 'newest';
const itemsPerPage = 15;
let currentPage = 1;

const selectors = {
    questionsList: null,
    categoriesFilter: null,
    searchDesktop: null,
    statsCount: null
};

function initSelectors() {
    selectors.questionsList = document.getElementById('questions-list');
    selectors.categoriesFilter = document.getElementById('categories-filter');
    selectors.searchDesktop = document.getElementById('search-input');
    selectors.statsCount = document.getElementById('stats-count');
}

async function loadData() {
    const files = ['data/general.json', 'data/islamic.json', 'data/science.json'];
    try {
        const responses = await Promise.all(files.map(url => fetch(url).then(r => r.json())));
        allQuestions = responses.flat();
        if (selectors.statsCount) selectors.statsCount.innerText = allQuestions.length.toLocaleString();
        renderQuestions();
    } catch (err) {
        console.error("خطأ في تحميل البيانات:", err);
    }
}

function renderQuestions() {
    if (!selectors.questionsList) return;
    
    const filtered = allQuestions.filter(q => 
        (q.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (activeCategory === 'all' || q.category === activeCategory)
    );

    selectors.questionsList.innerHTML = filtered.map(q => `
        <article class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex gap-4 transition-all">
            <div class="flex flex-col items-center gap-1 shrink-0 w-16">
                <div class="bg-slate-100 text-slate-600 px-3 py-1 rounded text-xs font-bold w-full text-center">${q.votes || 0}</div>
                <div class="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold w-full text-center">${q.answers || 1}</div>
            </div>
            <div class="flex-1">
                <h2 class="text-blue-700 font-bold mb-2 hover:underline"><a href="${q.url}">${q.title}</a></h2>
                <div class="flex flex-wrap gap-2 mt-2">
                    ${(q.tags || []).map(t => `<span class="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded">${t}</span>`).join('')}
                </div>
            </div>
        </article>
    `).join('');
}

document.addEventListener("DOMContentLoaded", () => {
    initSelectors();
    loadData();

    if (selectors.searchDesktop) {
        selectors.searchDesktop.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            renderQuestions();
        });
    }
});
