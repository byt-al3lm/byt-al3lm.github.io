   // 4. Remote content loader init (تحديث لدعم مجلد /data)
    if (selectors.questionsList) {
        // قائمة ملفات البيانات الخاصة بك
        const dataFiles = [
            'data/general.json', 
            'data/islamic.json', 
            'data/science.json'
        ];

        // جلب جميع الملفات بالتوازي ودمجها
        Promise.all(dataFiles.map(url => 
            fetch(url).then(res => {
                if (!res.ok) throw new Error(`Failed to fetch ${url}`);
                return res.json();
            })
        ))
        .then(results => {
            // دمج كل مصفوفات الأسئلة في مصفوفة واحدة ضخمة
            allQuestions = results.flat();
            
            if (selectors.statsCount) {
                selectors.statsCount.innerText = allQuestions.length.toLocaleString();
            }

            setupCategories(allQuestions);
            setSort('newest'); 
        })
        .catch(e => console.error("Data load failure:", e));
    }
