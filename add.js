
/**
 * 🎓 محرك بيت العلم (مجتمع المعرفة) - الإصدار الاحترافي 2026
 * مخصص للأداء العالي، متوافق مع السيو، ودعم كامل للجوال والمسارات الذكية
 */

document.addEventListener("DOMContentLoaded", () => {
    console.log("%c بيت العلم | تم تشغيل المحرك الذكي بنجاح ", "color: white; background: #1e3a5a; padding: 5px; border-radius: 5px;");

    let allQuestions = [];
    
    // 1. تحديد المسارات الذكية (تلقائياً)
    const isInsideFolder = window.location.pathname.includes('/questions/');
    const jsonPath = isInsideFolder ? '../data/general.json' : 'data/general.json';
    const articleLinkPath = isInsideFolder ? '' : 'questions/';

    // 2. ربط عناصر الواجهة
    const questionsList = document.getElementById("questions-list");
    const statsCount = document.getElementById("stats-count");
    const searchInput = document.getElementById("search-input");
    const relatedContainer = document.getElementById("related-questions");

    // --- 3. دالة بناء الكروت (التصميم العصري الموحد) ---
    function createQuestionCard(q) {
        return `
            <article class="question-card bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all group overflow-hidden">
                <div class="flex items-center justify-between mb-3">
                    <span class="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-lg border border-blue-100/50 uppercase">
                        ${q.category || "عام"}
                    </span>
                    <span class="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        منذ فترة وجيزة
                    </span>
                </div>
                
                <h3 class="font-bold text-slate-800 text-base md:text-lg leading-snug mb-4">
                    <a href="${articleLinkPath}${q.url}" class="group-hover:text-blue-600 transition-colors">${q.title}</a>
                </h3>

                <div class="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div class="flex items-center gap-1.5">
                        <div class="w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px]">✔</div>
                        <span class="text-[11px] font-bold text-slate-500">إجابة معتمدة</span>
                    </div>
                    <a href="${articleLinkPath}${q.url}" class="text-[11px] font-extrabold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                        عرض الحل الكامل
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    </a>
                </div>
            </article>
        `;
    }

    // --- 4. جلب البيانات من JSON ---
    async function fetchData() {
        try {
            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error("File not found");
            allQuestions = await response.json();
            
            // تحديث العداد
            if (statsCount) statsCount.innerText = allQuestions.length.toLocaleString();

            // عرض في الرئيسية أو الجانب
            if (questionsList) renderList(allQuestions);
            if (relatedContainer) renderRelated();

        } catch (error) {
            console.warn("⚠️ تنبيه: تعذر تحميل general.json. تأكد من تشغيل الموقع عبر Server.");
            if (questionsList) questionsList.innerHTML = `<p class="text-center py-10 text-slate-400 text-xs">جاري انتظار البيانات...</p>`;
        }
    }

    // --- 5. دالة العرض الرئيسية (الرئيسية) ---
    function renderList(data) {
        if (!questionsList) return;
        questionsList.innerHTML = data.map(q => createQuestionCard(q)).join('');
    }

    // --- 6. دالة الأسئلة المتعلقة (للصفحة الداخلية) ---
    function renderRelated() {
        if (!relatedContainer) return;
        // عرض 4 أسئلة عشوائية لا تشبه الصفحة الحالية
        const currentFile = window.location.pathname.split('/').pop();
        const related = allQuestions
            .filter(q => q.url !== currentFile)
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);

        relatedContainer.innerHTML = related.map(q => `
            <a href="${q.url}" class="bg-slate-50 p-4 rounded-2xl border border-transparent hover:border-blue-400 hover:bg-white transition-all shadow-sm block group">
                <h4 class="text-xs md:text-sm font-bold text-slate-700 group-hover:text-blue-600 leading-snug">${q.title}</h4>
            </a>
        `).join('');
    }

    // --- 7. محرك البحث الذكي ---
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.trim().toLowerCase();
            const filtered = allQuestions.filter(q => 
                q.title.toLowerCase().includes(query) || 
                (q.category && q.category.toLowerCase().includes(query))
            );
            renderList(filtered);
        });
    }

    // --- 8. تفعيل زر "مفيد" التفاعلي ---
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (btn && btn.innerText.includes("مفيد")) {
            const badge = btn.querySelector("span:last-child");
            if (badge && !btn.disabled) {
                let count = parseInt(badge.innerText) || 0;
                badge.innerText = count + 1;
                btn.classList.add("text-emerald-600", "scale-105");
                btn.disabled = true;
                showNotification("شكراً لتقييمك! تم اعتماد صوتك في بيت العلم.");
            }
        }
    });

    // --- 9. أداة تنبيه بسيطة (Toast) ---
    function showNotification(msg) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold shadow-2xl z-50 animate-bounce';
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // تشغيل الجلب
    fetchData();
});
