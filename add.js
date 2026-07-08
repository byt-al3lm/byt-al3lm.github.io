let allQuestions = [];

async function initApp() {
    const dataFiles = ['data/general.json', 'data/islamic.json', 'data/science.json'];
    const results = await Promise.all(dataFiles.map(url => fetch(url).then(r => r.json())));
    allQuestions = results.flat();
    renderQuestions(allQuestions);
}

function renderQuestions(data) {
    const list = document.getElementById('questions-list');
    list.innerHTML = data.map(q => `
        <article class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex gap-4 hover:border-blue-400 transition-all">
            <div class="flex flex-col items-center gap-1 shrink-0 w-16">
                <div class="bg-slate-100 text-slate-600 px-3 py-1 rounded text-xs font-bold">${q.votes}</div>
                <div class="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">1 إجابة</div>
            </div>
            <div class="flex-1">
                <h2 class="text-blue-700 font-bold mb-2"><a href="${q.url}">${q.title}</a></h2>
                <div class="flex flex-wrap gap-2">
                    ${q.tags.map(t => `<span class="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded">${t}</span>`).join('')}
                </div>
            </div>
        </article>
    `).join('');
}

document.getElementById('search-input').addEventListener('input', (e) => {
    renderQuestions(allQuestions.filter(q => q.title.includes(e.target.value)));
});

initApp();
