
/**
 * 🎓 محرك بيت العلم (المطور) - النسخة المحسنة للسرعة والتقسيم
 */

document.addEventListener("DOMContentLoaded", () => {
    let allQuestions = [];
    let filteredQuestions = [];
    let currentIndex = 0;
    const itemsPerPage = 12; // عدد الأسئلة في كل دفعة

    const isInsideFolder = window.location.pathname.includes('/questions/');
    const jsonPath = isInsideFolder ? '../data/general.json' : 'data/general.json';
    const articleLinkPath = isInsideFolder ? '' : 'questions/';

    const questionsList = document.getElementById("questions-list");
    const statsCount = document.getElementById("stats-count");
    const searchInput = document.getElementById("search-input");
    const categoryTabs = document.getElementById("category-tabs"); // تأكد من إضافة هذا الـ ID في HTML
    const loadMoreBtn = document.getElementById("load-more"); // زر "عرض المزيد"

    // --- 1. جلب البيانات ---
    async function fetchData() {
        try {
            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error("File not found");
            allQuestions = await response.json();
            filteredQuestions = [...allQuestions];
            
            if (statsCount) statsCount.innerText = allQuestions.length.toLocaleString();

            renderCategories(); // توليد الأقسام تلقائياً
            resetAndRender();   // عرض أول دفعة
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }

    // --- 2. بناء الأقسام (Tabs) تلقائياً ---
    function renderCategories() {
        if (!categoryTabs) return;
        const categories = ["الكل", ...new Set(allQuestions.map(q => q.category).filter(Boolean))];
        
        categoryTabs.innerHTML = categories.map(cat => `
            <button class="cat-btn px-4 py-2 rounded-full text-xs font-bold transition-all border border-slate-200 hover:bg-blue-600 hover:text-white" data-cat="${cat}">
                ${cat}
            </button>
        `).join('');

        // إضافة حدث الضغط على القسم
        categoryTabs.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.getAttribute('data-cat');
                filterByCategory(cat);
                
                // تمييز الزر النشط
                categoryTabs.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('bg-blue-600', 'text-white'));
                btn.classList.add('bg-blue-600', 'text-white');
            });
        });
    }

    // --- 3. دالة العرض المقسم (السرعة) ---
    function renderNextBatch(clear = false) {
        if (clear) {
            questionsList.innerHTML = '';
            currentIndex = 0;
        }

        const nextBatch = filteredQuestions.slice(currentIndex, currentIndex + itemsPerPage);
        if (nextBatch.length === 0 && clear) {
            questionsList.innerHTML = `<p class="col-span-full text-center py-10 text-slate-400">لا توجد نتائج مطابقة</p>`;
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = nextBatch.map(q => createQuestionCard(q)).join('');
        
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }

        questionsList.appendChild(fragment);
        currentIndex += itemsPerPage;

        // إخفاء زر "المزيد" إذا انتهت الأسئلة
        if (loadMoreBtn) {
            loadMoreBtn.style.display = currentIndex >= filteredQuestions.length ? 'none' : 'block';
        }
    }

    function resetAndRender() {
        renderNextBatch(true);
    }

    // --- 4. التصفية والبحث الذكي ---
    function filterByCategory(cat) {
        filteredQuestions = cat === "الكل" 
            ? [...allQuestions] 
            : allQuestions.filter(q => q.category === cat);
        resetAndRender();
    }

    // تقنية الـ Debounce لتحسين سرعة البحث
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = e.target.value.trim().toLowerCase();
                filteredQuestions = allQuestions.filter(q => 
                    q.title.toLowerCase().includes(query) || 
                    (q.category && q.category.toLowerCase().includes(query))
                );
                resetAndRender();
            }, 300); // ابحث بعد 300 ملي ثانية من توقف المستخدم عن الكتابة
        });
    }

    // زر عرض المزيد
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => renderNextBatch());
    }

    // --- دالة الكارت (نفس تصميمك مع تحسين طفيف) ---
    function createQuestionCard(q) {
        return `
            <article class="question-card bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div class="flex items-center justify-between mb-3">
                    <span class="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-lg border border-blue-100/50">
                        ${q.category || "عام"}
                    </span>
                </div>
                <h3 class="font-bold text-slate-800 text-base mb-4">
                    <a href="${articleLinkPath}${q.url}" class="hover:text-blue-600 transition-colors">${q.title}</a>
                </h3>
                <div class="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span class="text-[11px] font-bold text-emerald-600 flex items-center gap-1">✔ إجابة معتمدة</span>
                    <a href="${articleLinkPath}${q.url}" class="text-[11px] font-extrabold text-blue-600">عرض الحل</a>
                </div>
            </article>
        `;
    }

    fetchData();
});
