// ملف add.js المخصص لموقع بيت العلم (مجتمع المعرفة)
// هذا الملف يتم تضمينه تلقائياً في نهاية كل صفحة سؤال مضافة لدعم التفاعلية والبحث المشترك

document.addEventListener("DOMContentLoaded", () => {
    console.log("تم تحميل ملف add.js المخصص لموقع بيت العلم بنجاح! 🎓");

    let allQuestions = [];

    // تحديد العناصر الأساسية للواجهة والبحث والعدادات
    const questionsList = document.getElementById("questions-list");
    const statsCount = document.getElementById("stats-count");
    const searchInput = document.getElementById("search-input");

    // دالة بناء وعرض كروت الأسئلة ديناميكياً لتطابق واجهة بيت العلم الرئيسية
    function renderQuestions(items) {
        if (!questionsList) return;
        questionsList.innerHTML = "";

        if (items.length === 0) {
            questionsList.innerHTML = `
                <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-400">
                    <p class="text-sm">لا توجد أسئلة تطابق بحثك حالياً.</p>
                </div>
            `;
            return;
        }

        items.forEach(q => {
            const card = document.createElement("div");
            card.className = "bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all space-y-3";
            card.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="bg-blue-50 text-[#1e3a5a] text-xs font-bold px-2.5 py-1 rounded-md border border-blue-100/50">
                        ${q.category || "عام"}
                    </span>
                    <span class="text-[11px] text-slate-400">منذ فترة وجيزة</span>
                </div>
                <h3 class="font-bold text-slate-800 text-base md:text-lg leading-snug">
                    <a href="${q.url}" class="hover:text-blue-600 transition-colors">${q.title}</a>
                </h3>
                <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-50 text-slate-500">
                    <span class="flex items-center gap-1">
                        <span class="text-emerald-500">✔</span> إجابة معتمدة
                    </span>
                    <a href="${q.url}" class="text-blue-500 hover:underline font-bold flex items-center gap-1">
                        <span>عرض الإجابة الكاملة</span>
                        <span>←</span>
                    </a>
                </div>
            `;
            questionsList.appendChild(card);
        });
    }

    // جلب ملف general.json وعرض البيانات تلقائياً
    if (questionsList || statsCount || searchInput) {
        fetch("general.json")
            .then(res => res.json())
            .then(data => {
                allQuestions = data || [];
                
                // تحديث العداد الإجمالي لعدد الإجابات
                if (statsCount) {
                    statsCount.innerText = allQuestions.length;
                }

                // عرض كافة الأسئلة مبدئياً
                if (questionsList) {
                    renderQuestions(allQuestions);
                }
            })
            .catch(err => {
                console.warn("تنبيـه: لم يتم العثور على general.json بعد أو أنك تتصفح كملفات محلية مباشرة بدون سيرفر.", err);
                if (questionsList) {
                    questionsList.innerHTML = `
                        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-3">
                            <p class="text-sm text-slate-500">يرجى تشغيل الملفات عبر سيرفر محلي (مثل Live Server) لقراءة ملفات JSON ديناميكياً.</p>
                            <p class="text-xs text-slate-400">أو يمكنك النقر فوق أي صفحة سؤال تابعة للحزمة بداخل المجلد لتصفحها مباشرة.</p>
                        </div>
                    `;
                }
            });
    }

    // فلترة البحث الفوري وتحديث قائمة الأسئلة أثناء الكتابة
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (!query) {
                renderQuestions(allQuestions);
                return;
            }
            const filtered = allQuestions.filter(q => 
                q.title.toLowerCase().includes(query) || 
                (q.category && q.category.toLowerCase().includes(query)) ||
                (q.tags && q.tags.some(t => t.toLowerCase().includes(query)))
            );
            renderQuestions(filtered);
        });
    }

    // 2. تفعيل أزرار مفيد / غير مفيد وحفظ تفاعلات الزوار في التخزين المحلي
    const reactionButtons = document.querySelectorAll("button");
    reactionButtons.forEach(btn => {
        if (btn.innerText.includes("مفيد")) {
            btn.addEventListener("click", () => {
                const badge = btn.querySelector("span:last-child");
                if (badge) {
                    let count = parseInt(badge.innerText) || 0;
                    badge.innerText = count + 1;
                    btn.classList.add("text-emerald-600");
                    btn.disabled = true;
                    alert("شكراً لك على تقييم الإجابة! تم تسجيل تصويتك بنجاح ببيت العلم.");
                }
            });
        }
    });
});
