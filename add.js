let allQuestions = [];

async function initApp() {
    // قائمة بملفات JSON الموجودة داخل المجلد
    const files = ['general.json', 'islamic.json', 'science.json'];
    
    try {
        // جلب جميع الملفات بالتوازي
        const promises = files.map(file => fetch(`data/${file}`).then(res => res.json()));
        const results = await Promise.all(promises);
        
        // دمج النتائج في مصفوفة واحدة
        allQuestions = results.flat();
        
        renderQuestions(allQuestions);
    } catch (e) {
        console.error("خطأ في تحميل البيانات من المجلد:", e);
    }
}

function renderQuestions(data) {
    const list = document.getElementById('questions-list');
    if (!data.length) {
        list.innerHTML = "<p class='text-center p-10'>لا توجد أسئلة حالياً.</p>";
        return;
    }

    list.innerHTML = data.map(q => `
        <article class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex gap-4 hover:border-blue-400 transition-all">
            <div class="flex flex-col items-center gap-1 shrink-0 w-16">
                <div class="bg-slate-100 text-slate-600 px-3 py-1 rounded text-xs font-bold w-full text-center">${q.votes}</div>
                <div class="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold w-full text-center">${q.answers}</div>
            </div>
            <div class="flex-1">
                <h2 class="text-blue-700 font-bold mb-2 hover:underline">
                    <a href="${q.url}">${q.title}</a>
                </h2>
                <p class="text-xs text-slate-500 mb-2">تم الرد عليه منذ ${q.time} في تصنيف ${q.category}</p>
                <div class="flex flex-wrap gap-2">
                    ${q.tags.map(tag => `<span class="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded">${tag}</span>`).join('')}
                </div>
            </div>
        </article>
    `).join('');
}

initApp();
