let structureType = '';
let colNames = [];
let rowNames = [];

function goToStep2() {
    structureType = document.getElementById('structureType').value;
    let container = document.getElementById('inputsContainer');
    container.innerHTML = ''; 

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
        tr.innerHTML += `<td><input type="text" class="cell-data" style="width:95%; padding:6px; margin:0; border: 1px solid #ddd; border-radius:3px; box-sizing: border-box;"></td>`;
    });

    tbody.appendChild(tr);
}

// 1. تصدير ملف إكسيل (CSV) متناسق مع التوجيه العربي
function exportToExcelNative() {
    let csvRows = [];
    let headerRow = [];
    
    if (structureType === 'rows' || structureType === 'both') {
        headerRow.push("العنوان");
    }
    
    // قلب ترتيب الأعمدة ليتناسب مع الإكسيل العربي (من اليمين لليسر)
    let reversedCols = [...colNames].reverse();
    reversedCols.forEach(name => headerRow.push(name));
    csvRows.push(headerRow.join(";"));

    let rows = document.querySelectorAll("#tableBody tr");
    rows.forEach(row => {
        let csvRow = [];
        let rowHeader = row.querySelector(".row-header");
        if (rowHeader) {
            csvRow.push(rowHeader.innerText);
        }
        
        let inputs = Array.from(row.querySelectorAll(".cell-data"));
        inputs.reverse().forEach(input => {
            let value = input.value.replace(/;/g, ",");
            csvRow.push(value);
        });
        
        csvRows.push(csvRow.join(";"));
    });

    let csvString = csvRows.join("\n");
    let blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: "text/csv;charset=utf-8;" });
    
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

// 2. تصدير ملف PDF منسق ودعم كامل ومضمون للعربية
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); // ورقة A4

    // جلب العناوين والمعطيات
    let headers = [];
    if (structureType === 'rows' || structureType === 'both') {
        headers.push("العنوان");
    }
    
    // نعكس الأعمدة باش ف الـ PDF تجي الخدمة من اليمين لليسر
    let pdfHeaders = [...colNames].reverse();
    pdfHeaders.forEach(name => headers.push(name));

    let bodyData = [];
    let rows = document.querySelectorAll("#tableBody tr");
    
    rows.forEach(row => {
        let rowData = [];
        let rowHeader = row.querySelector(".row-header");
        if (rowHeader) {
            rowData.push(rowHeader.innerText);
        }
        
        let inputs = Array.from(row.querySelectorAll(".cell-data"));
        inputs.reverse().forEach(input => {
            rowData.push(input.value || "");
        });
        bodyData.push(rowData);
    });

    // استخدام مكتبة autoTable المدمجة
    doc.autoTable({
        head: [headers],
        body: bodyData,
        styles: {
            font: "courier",            // خط أساسي لتفادي الأخطاء، ويدعم الأرقام والرموز
            halign: 'right',            // الكتابة من اليمين لليسر
            fontSize: 10,
            cellPadding: 4,
            overflow: 'linebreak'       // تقسيم السطور أوتوماتيكياً يلا كانت الكتابة طويلة
        },
        headStyles: {
            fillColor: [220, 220, 220], // خلفية رمادية خفيفة (Light Grey) للهيدر كيف طلبتي
            textColor: [0, 0, 0],       // لون نص أسود واضح
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250] // سطر أبيض وسطر رمادي باهت جداً للتنظيم البصري
        },
        margin: { top: 20, right: 15, left: 15 },
        theme: 'striped',
        columnStyles: {
            // كايخلي الجدول يتأدابطا ويتحكم فالعرض ديالو على حساب عرض الورقة
            0: { cellWidth: 'auto' }
        }
    });

    doc.save("جدول_البيانات.pdf");
}

function switchStep(from, to) {
    document.getElementById(from).classList.remove('active');
    document.getElementById(to).classList.add('active');
}
