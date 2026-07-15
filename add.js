
/**
 * 🎓 محرك بيت العلم (مجتمع المعرفة) - الإصدار الاحترافي 2026
 * مخصص للأداء العالي ودعم 10,000+ سؤال عبر التمرير اللانهائي
 */

document.addEventListener("DOMContentLoaded", () => {
    console.log("%c بيت العلم | تم تفعيل نظام التمرير الذكي (Infinite Scroll) ", "color: white; background: #059669; padding: 5px; border-radius: 5px;");

    let allQuestions = [];
    let filteredQuestions = []; // لتخزين الأسئلة المفلترة أثناء البحث
    let itemsPerPage = 12;     // عدد الأسئلة في كل "تحميلة"
    let currentPage = 1;

    // 1. تحديد المسارات
    const isInsideFolder = window.location.pathname.includes('/questions/');
    const jsonPath = isInsideFolder ? '../data/general.json' : 'data/general.json';
    const articleLinkPath = isInsideFolder ? '' : 'questions/';

    // 2. ربط العناصر
    const questionsList = document.getElementById("questions-list");
    const statsCount = document.getElementById("stats-count");
    const searchInput = document.getElementById("search-input");
    const relatedContainer = document.getElementById("related-questions");

    // إضافة عنصر "المراقب" في نهاية القائمة
    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    sentinel.className = 'w-full h-10 flex justify-center items-center py-10';
    sentinel.innerHTML = `<span class="text-slate-400 text-xs animate-pulse">جاري تحميل المزيد من الأسئلة...</span>`;

    // --- 3. دالة بناء الكروت ---
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

    // --- 4. جلب البيانات ---
    async function fetchData() {
        try {
            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error("File not found");
            allQuestions = await response.json();
            filteredQuestions = [...allQuestions];
            
            if (statsCount) statsCount.innerText = allQuestions.length.toLocaleString();

            if (questionsList) {
                renderInitialList();
                setupIntersectionObserver();
            }
            if (relatedContainer) renderRelated();

        } catch (error) {
            console.error("Error:", error);
            if (questionsList) questionsList.innerHTML = `<p class="text-center py-10 text-slate-400 text-xs">تعذر تحميل البيانات...</p>`;
        }
    }

    // --- 5. وظائف العرض والتمرير ---
    
    function renderInitialList() {
        questionsList.innerHTML = "";
        currentPage = 1;
        loadMoreItems();
        questionsList.after(sentinel); // وضع المراقب تحت القائمة
    }

    function loadMoreItems() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const nextBatch = filteredQuestions.slice(startIndex, endIndex);

        if (nextBatch.length > 0) {
            const html = nextBatch.map(q => createQuestionCard(q)).join('');
            questionsList.insertAdjacentHTML('beforeend', html);
            currentPage++;
        } else {
            sentinel.innerHTML = `<span class="text-slate-300 text-[10px]">نهاية النتائج</span>`;
        }
    }

    // إعداد Intersection Observer
    function setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && filteredQuestions.length > (currentPage - 1) * itemsPerPage) {
                setTimeout(loadMoreItems, 300); // تأخير بسيط لتجربة مستخدم سلسة
            }
        }, { threshold: 0.1 });

        observer.observe(sentinel);
    }

    // --- 6. محرك البحث الذكي (معدل ليتوافق مع التمرير) ---
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.trim().toLowerCase();
            filteredQuestions = allQuestions.filter(q => 
                q.title.toLowerCase().includes(query) || 
                (q.category && q.category.toLowerCase().includes(query))
            );
            
            // إعادة تصفير القائمة عند البحث
            renderInitialList();
        });
    }

    // --- 7. الأسئلة المتعلقة (بدون تغيير) ---
    function renderRelated() {
        if (!relatedContainer) return;
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

    // تشغيل الجلب
    fetchData();
});
