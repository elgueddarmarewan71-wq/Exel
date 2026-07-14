let structureType = '';
let colNames = [];
let rowNames = [];

function goToStep2() {
    structureType = document.getElementById('structureType').value;
    let container = document.getElementById('inputsContainer');
    container.innerHTML = ''; // مسح المحتوى القديم

    if (structureType === 'cols' || structureType === 'both') {
        container.innerHTML += `
            <label>شحال عندك من عمود (Columns)؟</label>
            <input type="number" id="colCount" min="1" value="2" onchange="generateNameInputs()">
            <div id="colNamesInputs"></div>
        `;
    }
    if (structureType === 'rows' || structureType === 'both') {
        container.innerHTML += `
            <label>شحال عندك من سطر غاتسميه (Rows)؟</label>
            <input type="number" id="rowCount" min="1" value="2" onchange="generateNameInputs()">
            <div id="rowNamesInputs"></div>
        `;
    }

    switchStep('step1', 'step2');
    generateNameInputs();
}

function generateNameInputs() {
    if (document.getElementById('colCount')) {
        let count = document.getElementById('colCount').value;
        let div = document.getElementById('colNamesInputs');
        div.innerHTML = '<h4>أسماء الأعمدة:</h4>';
        for (let i = 1; i <= count; i++) {
            // كايحط "الإسم" و "الجهة" كاقتراح تلقائي إلا كانوا جوج أعمدة كيفما طلب المطور
            let defaultVal = (i === 1 && count == 2) ? 'الإسم' : ((i === 2 && count == 2) ? 'الجهة' : '');
            div.innerHTML += `<input type="text" class="col-name-input" placeholder="سمية العمود ${i}" value="${defaultVal}">`;
        }
    }
    if (document.getElementById('rowCount')) {
        let count = document.getElementById('rowCount').value;
        let div = document.getElementById('rowNamesInputs');
        div.innerHTML = '<h4>أسماء السطور:</h4>';
        for (let i = 1; i <= count; i++) {
            div.innerHTML += `<input type="text" class="row-name-input" placeholder="سمية السطر الرئيسي ${i}">`;
        }
    }
}

function goToStep3() {
    colNames = Array.from(document.querySelectorAll('.col-name-input')).map(input => input.value || 'عمود');
    rowNames = Array.from(document.querySelectorAll('.row-name-input')).map(input => input.value || 'سطر');

    let thead = document.getElementById('tableHead');
    let tbody = document.getElementById('tableBody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    let headerRow = '<tr>';
    if (structureType === 'rows' || structureType === 'both') {
        headerRow += '<th>العنوان</th>'; 
    }
    colNames.forEach(name => {
        headerRow += `<th>${name}</th>`;
    });
    headerRow += '</tr>';
    thead.innerHTML = headerRow;

    if (structureType === 'rows' || structureType === 'both') {
        rowNames.forEach(rName => { addNewRow(rName); });
    } else {
        addNewRow();
    }

    switchStep('step2', 'step3');
}

function addNewRow(rowTitle = '') {
    let tbody = document.getElementById('tableBody');
    let tr = document.createElement('tr');

    if (structureType === 'rows' || structureType === 'both') {
        tr.innerHTML += `<td class="row-header">${rowTitle}</td>`;
    }

    colNames.forEach(() => {
        tr.innerHTML += `<td><input type="text" class="cell-data" class="cell-input" style="width:90%; padding:5px; margin:0;"></td>`;
    });

    tbody.appendChild(tr);
}

// تصدير البيانات باستعمال جافاسكريبت صافية متوافقة مع الـ Local Server والـ Sandboxes
function exportToExcelNative() {
    let csvRows = [];
    
    // 1. عناوين الجدول
    let headerRow = [];
    if (structureType === 'rows' || structureType === 'both') {
        headerRow.push("العنوان");
    }
    colNames.forEach(name => headerRow.push(name));
    csvRows.push(headerRow.join(";")); // استعمال الفاصلة المنقوطة للتوافق الكامل مع إكسيل باللغة العربية

    // 2. أسطر البيانات
    let rows = document.querySelectorAll("#tableBody tr");
    rows.forEach(row => {
        let csvRow = [];
        
        let rowHeader = row.querySelector(".row-header");
        if (rowHeader) {
            csvRow.push(rowHeader.innerText);
        }
        
        let inputs = row.querySelectorAll(".cell-data");
        inputs.forEach(input => {
            let value = input.value.replace(/;/g, ","); // إزالة أي نقطة منقوطة كتبها المستخدم باش ما يخسرش الترتيب
            csvRow.push(value);
        });
        
        csvRows.push(csvRow.join(";"));
    });

    // 3. إضافة UTF-8 BOM لضمان قراءة اللغة العربية بامتياز في Excel دون تشويه الحروف
    let csvString = csvRows.join("\n");
    let blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: "text/csv;charset=utf-8;" });
    
    // 4. إنشاء رابط التحميل التلقائي الآمن
    let link = document.createElement("a");
    if (link.download !== undefined) {
        let url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "جدول_البيانات.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function switchStep(from, to) {
    document.getElementById(from).classList.remove('active');
    document.getElementById(to).classList.add('active');
}
