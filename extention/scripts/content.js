/*------------------------Messages------------------------*/
// logger based onmessage passing
// const logging = chrome.runtime.connect();
logging = {}
logging.info = function(msg){chrome.runtime.sendMessage({'log':{'info':msg}})};
logging.error = function(msg){chrome.runtime.sendMessage({'log':{'error':msg}})};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      // check content script already
      if(request.checkContent)sendResponse(true);
  }
);
/*------------------------end Messages------------------------*/

/*------------------------Export------------------------*/
const exportForm = document.querySelector("form[id=export]");

const exportPlace = document.querySelector("div[id=tab-export]"); // Розміщення самого меню
const productExportType = document.createElement("div");
const exportInputBlockHtml = `<h4>Mass export of products</h4><span class="help">Enter the maximum number of items that can be uploaded at one time.<br>You can also enter values in the "Start id" and "End id" fields. You can also specify categories.</span><br><br><span>Number of products in one step:</span><br><input type="number" name="per_step" value="1000" min="1"><br><br>
<div class="progress">
  <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
</div><a id="BulkDownloadProducts" class="btn btn-primary"><span>Bulk export</span></a>`;
productExportType.insertAdjacentHTML("beforeend", exportInputBlockHtml);
productExportType.style = "border: solid 1px; padding:10px;";

exportPlace.append(productExportType);


const exportBar = productExportType.querySelector(".progress-bar");
exportBar.setBarValue = setBarValue;

const exportPerStep = productExportType.querySelector("input[name=per_step]");
exportPerStep.getStep = getStep;

const exportButton = document.querySelector("a[id=BulkDownloadProducts]");
exportButton.addEventListener("click", () => {  // Запуск перевірок та експорту товарів
    if(exportButton.hasAttribute("disabled")) return
    if (!(isNaN(exportPerStep.getStep())) && exportPerStep.getStep() > 0){
        exportBar.setBarValue(0)
        const on_one_page = exportPerStep.getStep()
        const action = exportForm.getAttribute("Action")

        const script_data_max_min = document.querySelector("#content > script")  // get min and max ranges
        const reg_p_max = /(?<=case 'p': maxItemId = parseInt\( )\d+(?= \))/gm
        const reg_p_min = /(?<=case 'p': minItemId = parseInt\( )\d+(?= \))/gm
        let p_min = script_data_max_min.innerText.match(reg_p_min)[0]
        let p_max = script_data_max_min.innerText.match(reg_p_max)[0]
        p_min = parseInt(p_min)
        p_max = parseInt(p_max)

        let start_id_e = document.querySelector("input[type=text][name=min]")  // start and end id range
        let end_id_e = document.querySelector("input[type=text][name=max]")
        let start_id = parseInt(start_id_e.value)
        let end_id = parseInt(end_id_e.value)

        if (start_id>end_id || start_id<=0){   // indicate, that range is not be success
            start_id_e.style.borderColor = "red";
            start_id_e.style.color = "red";
            end_id_e.style.borderColor = "red";
            end_id_e.style.color = "red";
            setTimeout(() =>{start_id_e.style.cssText = ""; end_id_e.style.cssText = "";}, 1000)
            return
        }

        const categories = exportForm.querySelectorAll(`input[name="categories[]"]`)

        exportButton.setAttribute("disabled", true)
        logging.info(`Start export from ${p_min} to ${p_max} by ${on_one_page} step ${categories.length?"with categories":""}`);
        doExportJob(action,start_id, end_id, p_min, p_max, on_one_page, categories).then((result)=>{
            if (result){    // do something when error
                exportBar.setBarValue(-1);
                logging.error(`${result}`);
            }
            exportButton.removeAttribute("disabled");
        })
    }else{   // Red light if per-step have error value
        exportPerStep.style.borderColor = "red"
        exportPerStep.style.color = "red"
        setTimeout(() =>{exportPerStep.style.cssText = ""}, 1000)
    }
});

exportInputsType = document.querySelectorAll("input[name=export_type]");  // Встановлення перевікнення опцій для експорту
for (let i = 0; i<exportInputsType.length; i++){
    if (exportInputsType[i].value === "p" && !exportInputsType[i].checked) // Перевірка на те, що опція продукту сразу не вибрана
        productExportType.style.display = "none";

    exportInputsType[i].addEventListener("change", (event)=>{
        switch (event.target.value){
            case "p":
                productExportType.style.display = "";
                break;
            default:
                productExportType.style.display = "none";
        }
    })
}

/*------------------------endExport------------------------*/

/*------------------------Import------------------------*/
const importForm = document.querySelector("form[id=import]");

const importPlace = document.querySelector("div[id=tab-import]");
const importBlock = document.createElement("div");
const importBlockHTML = `<td><span>Number of products in one step:</span><br>
<input type="number" name="per_step" value="1000" min="1"><br><br><div><a id="importBulkButton" class="btn btn-primary"><span>Bulk import</span></a>
    <div class="progress" style="width:50%; display:inline-block;vertical-align: middle; margin-bottom:0px; margin-left: 2%;">
      <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
    </div></div>
    </td>`
importBlock.insertAdjacentHTML("afterbegin", importBlockHTML);
importBlock.style = "border: solid 1px; padding:10px;";
importPlace.insertAdjacentElement("beforeend", importBlock);

const importBar = importBlock.querySelector(".progress-bar");
importBar.setBarValue = setBarValue;

const importPerStep = importBlock.querySelector("input[name=per_step]");
importPerStep.getStep = getStep;

const importButton = document.querySelector("a[id=importBulkButton]");
importButton.addEventListener("click", () => {
    const incremental = importForm.querySelector(`input[value="1"]`).checked;
    const filesInput = importForm.querySelector(`input[type="file"]`);
    const action = importForm.getAttribute("action")
    if(importButton.hasAttribute("disabled")) return
    if ((!(isNaN(importPerStep.getStep())) && importPerStep.getStep() > 0 && filesInput.files.length !== 0) && filesInput.files[0].name.endsWith("xlsx")){
        importButton.setAttribute("disabled", true)
        logging.info(`Start import by ${importPerStep.getStep()}. Incremental: ${incremental}`);
        doImportJob(action ,filesInput.files[0], incremental, importPerStep.getStep()).then((result)=>{
            if (result){    // do something when error
                exportBar.setBarValue(-1)
                logging.error(`${result}`);
            }
            importButton.removeAttribute("disabled");
        })


    }else if (filesInput.files.length === 0 || !filesInput.files[0].name.endsWith("xlsx")) { // Red light if input file have error value
        filesInput.style.border = "1px solid red";
        filesInput.style.color = "red";
        setTimeout(() =>{filesInput.style.cssText = ""}, 1000);
    }else{   // Red light if per-step have error value
        importPerStep.style.borderColor = "red";
        importPerStep.style.color = "red";
        setTimeout(() =>{importPerStep.style.cssText = ""}, 1000);
    }
});
/*------------------------endExport------------------------*/

/*----------------------htmls functions----------------------*/
function setBarValue(value) {
    if(value === 100 || value > 100){
        value = 100;
        this.style.backgroundColor = "#28a745";
    } else if (value === -1){
        this.style.backgroundColor = "#ff0000";
        return;
    }
    else{
        this.style.backgroundColor = null;
    }
    this.setAttribute("aria-valuenow", value.toString())
    this.style.width = value.toFixed(1).toString()+"%"
    this.textContent = value.toFixed(1).toString()+"%"
};  // Зміна статусу бару

function getStep(){return parseInt(this.value)};

async function* getXlsxParts(action, start_id, end_id, per_page, categories){

    let data = new FormData()
    data.set("export_type", "p")
    data.set("category", "")
    data.set("range_type", "id")
    data.set("min",  start_id.toString())
    data.set("max", end_id.toString())

    for (let cat of categories){
        data.append("categories[]", cat.value)
    }

    let pages = Math.ceil((end_id-start_id)/per_page)
    if (pages === 0) pages = 1;

    for (let i = 0; i<pages; i++){
        let current_min = start_id + per_page*i;
        let current_max = current_min + per_page >= end_id ? end_id : current_min + per_page - 1;
        data.set("min", current_min)
        data.set("max", current_max)

        let c_try = 0;
        while (c_try<5){ // internet error maker
            try{
                let response = await fetch(action, {
                    method: "POST",
                    body: data,
                });
                if (response.status !== 200){throw new Error("not200")}
                let result = await response.blob()
                yield result
                logging.info(`Exported ${i+1}/${pages} pages. ${per_page} items per page`)
                exportBar.setBarValue(((i+1)/pages)*100) //Progress bar
                break;
            } catch (e){
                logging.error(`Error request items between ${current_min} and ${current_max} product ID. Attemt num: ${c_try + 1}`)
                c_try += 1
                if (c_try === 5){
                    throw new Error("maxTry")
                }
                await new Promise((resolve)=>{setTimeout(resolve, 5000)})
            }
        }
    }

}

async function doExportJob(action, start_id, end_id, p_min, p_max, per_page, categories){ //if it return something, it is error

    if(isNaN(start_id)) start_id = p_min;
    if(isNaN(end_id)) end_id = p_max;

    if (end_id>p_max) end_id = p_max;
    if (start_id > p_max) start_id = p_max

    let book_master;

    try{
        let xlsx_parts =getXlsxParts(action, start_id, end_id, per_page, categories)
        book_master = await xlsx_parts.next()
        book_master = await blobToWorkbook(book_master["value"])

        const is_font_deleted = new Array(book_master.worksheets.length);
        is_font_deleted.fill(false);
        let i;

        i=0;
        book_master.eachSheet((sheet)=>{  // TODO FIX FIRST EMPTY Remove strikethrough from head of each sheet on first part
            if (is_font_deleted[i] === false){
                if (sheet.rowCount >= 1){
                    sheet.eachRow((row)=>{row.font = {}});
                    is_font_deleted[i] = true;
                }
            }
            i+=1;
        });

        let book_slave;
        for await (let part of xlsx_parts){
            book_slave = await blobToWorkbook(part);
            concatanateBook(book_master, book_slave);
    }
    }catch (e) {
        if (e.message === "maxTry"){
            return e.message;
        }
    }

    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth()+1).toString();
    const day = date.getDate().toString();
    logging.info(`Preparing file: ${"products-"+year+"-"+month+"-"+day}.xlsx`);
    await downloadBook(book_master, "products-"+year+"-"+month+"-"+day);
    logging.info(`Preparing ${"products-"+year+"-"+month+"-"+day}.xlsx done!`);
    logging.info("Export done!");
}

async function doImportJob(action, file, incremental, perStep){
    importBar.setBarValue(0);
    const originalBook = await blobToWorkbook(file);
    const validateStatus = validateBook(originalBook);

    const book_size = originalBook.worksheets[0].rowCount - 1 //getting count of products
    if (validateStatus){
        logging.error(`Worksheet not validated ${validateStatus}`);
        return validateStatus; // not validated
    }

    let i = 0;
    for (const partValues of getBookPartsValues(originalBook, perStep)){
        const book = createXlsxPart(originalBook, partValues);
        const blob = await workbookToBlob(book);
        const isError = await sendBlob(action, blob, incremental);

        if (isError){
            importBar.setBarValue(-1);
            logging.error(`${isError}`);
            return;
        }else{
            i += perStep;
            importBar.setBarValue((i/book_size)*100);
            logging.info(`Imported ${i}/${book_size}.`)
            incremental = true; // if first not increment, then other must be incremental
        }
    }
    logging.info("Import done!");
    importBar.setBarValue(100);
}

/*----------------------end htmls functions----------------------*/

/*----------------------xlsx functions----------------------*/

async function blobToBinary(file){
        return new Promise((resolve, reject)=>{
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            fileReader.onload = function(event) {
              resolve(fileReader.result);
        };
        })}

async function blobToWorkbook(file){
    let workbook = new ExcelJS.Workbook();
    const file_array = await blobToBinary(file)
    await workbook.xlsx.load(file_array)
    return workbook
}

async function downloadBook(workbook, name){
    const buffer = await workbook.xlsx.writeBuffer();
    let link = document.createElement('a');
    link.download = name.concat('.xlsx');
    const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
}

function concatanateBook(master, slave){
    master.eachSheet((worksheet_master)=>{
        const worksheet_slave = slave.getWorksheet(worksheet_master.name)
        worksheet_slave.eachRow((row, rowNum)=>{
            if (rowNum !== 1){
                worksheet_master.addRow(row.values, 'i+');
            }
        });
    })

    return master
}

function validateBook(book){  // validate Product list
    let status = ""; // nothing - good
    let prev = -1;
    let now;
    book.eachSheet(function(worksheet) {
        if(!status){
            worksheet.eachRow((row, rowNum)=>{
                if (rowNum > 1){
                    now = row.values[1]
                    if(((worksheet.name === "Products" && now > prev) || (worksheet.name !== "Products" && now>=prev)) && row.hasValues){
                        prev = now;
                    }else{
                        status = worksheet.name;
                    }
                }

        });
            prev = -1;
}});
        return status;
}

function* getBookPartsValues(book, per_page){
    /*
    Розбиття однієї книги на менші книги. Кількість товарів в меншій книзі ставновить значення аргументу per_page.
     */
    const PER_PAGE = per_page;
    let isDone = false;
    const onNumItem = Array(book.worksheets.length); onNumItem.fill(1);
    const partBookRawRows = Array(book.worksheets.length)
    for (let i = 0; i<partBookRawRows.length; i++) partBookRawRows[i] = Array();

    while(!isDone){
        const partBookRawRows = Array(book.worksheets.length)
        for (let i = 0; i<partBookRawRows.length; i++) partBookRawRows[i] = Array();

        let tmp = book.worksheets[0].getRows(onNumItem[0]+1, PER_PAGE); // get products
        tmp.forEach((elem)=>{
            if (!elem.hasValues) {isDone = true; return}
            partBookRawRows[0].push(elem.values)
            onNumItem[0] += 1;
        });

        if(partBookRawRows[0].length === 0) break; // if nothing -- prevent next code block

        for(let i = 1; i< book.worksheets.length; i++){
            for(let j = 0; j< partBookRawRows[0].length; j++){
                let productId = partBookRawRows[0][j][1]
                while (true){
                    const sheetRow = book.worksheets[i].getRow(onNumItem[i]+1)
                    if (sheetRow.hasValues && sheetRow.values[1] === productId){
                        onNumItem[i] += 1;
                        partBookRawRows[i].push(sheetRow.values);
                    }else{
                        break;
                    }
                }
            }
        }
        yield partBookRawRows;
    }
}

function createXlsxPart(template, partValues){
    if (template.worksheets.length !== partValues.length) throw new Error("not it is")
    const partBook = new ExcelJS.Workbook();
    partBook.properties.date1904 = false
    let i = 0
    template.eachSheet((sheet)=>{
       const sheetPart = partBook.addWorksheet(sheet.name);
       sheetPart.addRow(sheet.getRow(1).values);
       sheetPart.addRows(partValues[i]);
       i += 1;
    });

    return partBook;
}

async function workbookToBlob(workbook){
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
}

async function sendBlob(action, file, incremental = true, name="blob.xlsx"){
        const form = new FormData();
        form.append('upload', file, name)
        form.append('incremental', incremental ? 1 : 0)

        let request;
        let i = 0; // getting request with errors protections
        while (true){
            try{
                request = await fetch(action, {method:"POST", body:form});
                break;
            }catch (e){
                if (e instanceof TypeError){
                  if (i < 5) {
                      i += 1;
                      logging.error(`Import error:${e.message}. Attempt num: ${i}`);
                      await new Promise((resolve) =>{setTimeout(resolve, 3000)});
                  }else{
                      return "Connection error. maxTry"; // internet error
                  }

                }
            }


        }


        const is_redirected = request.redirected;
        const result_text = await request.text();
        const regRes = result_text.match(/You have successfully imported your data!/gm);

        await new Promise((resolve) =>{setTimeout(resolve, 200)});

        if (is_redirected && regRes) return 0; // good
        else return "Server error or file does not match the pattern"; // content error

}

/*----------------------end xlsx functions----------------------*/
