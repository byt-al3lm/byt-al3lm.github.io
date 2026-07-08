async function initApp() {
    const files = ['general.json', 'islamic.json', 'science.json'];
    
    // دالة لجلب ملف واحد مع إظهار الخطأ بشكل أوضح
    async function fetchFile(filename) {
        try {
            const response = await fetch(`./data/${filename}`);
            if (!response.ok) throw new Error(`لم يتم العثور على ${filename}`);
            return await response.json();
        } catch (e) {
            console.error(`خطأ في ${filename}:`, e.message);
            return []; // إرجاع مصفوفة فارغة لتجنب تعطل الموقع
        }
    }

    const results = await Promise.all(files.map(fetchFile));
    allQuestions = results.flat();
    
    if (allQuestions.length === 0) {
        console.warn("تحذير: لا توجد بيانات في المصفوفة. تأكد من مسار مجلد /data");
    } else {
        renderQuestions(allQuestions);
    }
}
