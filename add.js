
let allQuestions = [];

async function initApp() {
    // نحدد أسماء الملفات الموجودة في مجلد /data
    const files = ['general.json', 'islamic.json', 'science.json'];
    
    try {
        const promises = files.map(file => fetch(`data/${file}`).then(res => res.json()));
        const results = await Promise.all(promises);
        allQuestions = results.flat(); // دمج كل الملفات في مصفوفة واحدة
        renderQuestions(allQuestions);
    } catch (e) {
        console.error("خطأ في تحميل البيانات:", e);
    }
}

function renderQuestions(data) {
    const list = document.getElementById('questions-list');
    list.innerHTML = data.map(q => `
        <article class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex gap-4 hover:border-blue-400 transition-all">
            <div class="flex flex-col items-center gap-1 shrink-0 w-16">
                <div class="bg-slate-100 text-slate-600 px-3 py-1 rounded text-xs font-bold w-full text-center">${q.votes}</div>
                <div class="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold w-full text-center">${q.answers}</div>
            </div>
            <div class="flex-1">
                <h2 class="text-blue-700 font-bold mb-2 hover:underline"><a href="${q.url}">${q.title}</a></h2>
                <div class="flex flex-wrap gap-2">
                    ${q.tags.map(t => `<span class="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded">${t}</span>`).join('')}
                </div>
            </div>
        </article>
    `).join('');
}

document.getElementById('search-input').addEventListener('input', (e) => {
    const filtered = allQuestions.filter(q => q.title.includes(e.target.value));
    renderQuestions(filtered);
});

initApp();
