// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { off } = require('process');
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('0DateCleaner is now running!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('0data.helloWorld', showWelcomeMessage);
		let handleMissingValues = vscode.commands.registerCommand('0data.handleMissing',(uri) => {
			HandleMissingValues(uri.fsPath);
		});
		
		let fillBlanksWithZero = vscode.commands.registerCommand('0data.fillWithZero',(uri) => {
			fillWithZero(uri.fsPath);
		});

		let fillBlanksWithAverage = vscode.commands.registerCommand('0data.fillWithAverage',(uri) => {
			fillWithAverage(uri.fsPath);
		});

		let viewExcelFile = vscode.commands.registerCommand('0data.viewFile', (uri) => {
			visualizeExcelFile(uri.fsPath);
		});

		let deDuplicate = vscode.commands.registerCommand('0data.deDuplication', (uri) => {
			deDuplicateExcelFile(uri.fsPath);
		});

	context.subscriptions.push(handleMissingValues);
	context.subscriptions.push(fillBlanksWithZero);
	context.subscriptions.push(fillBlanksWithAverage);
	context.subscriptions.push(viewExcelFile);
	context.subscriptions.push(deDuplicate);
}

function showWelcomeMessage(){
	// Display a message box to the user
	vscode.window.showInformationMessage('Hello from 0DataCleaner!');

}

function HandleMissingValues(filePath){
	var xlsx = require('xlsx');
	var excelFile = xlsx.readFile(filePath);
	// read the first sheet of that excel file
	var firstSheetName = excelFile.SheetNames[0];
	// convert the sheet to json
	var jsonObjOfSheet = xlsx.utils.sheet_to_json(excelFile.Sheets[firstSheetName]);
	console.log(JSON.stringify(jsonObjOfSheet));
	removeBlankRows(jsonObjOfSheet);	
}

/**
 * 
 * @param {*} filePath takes a string which is the location of the excel file
 * @returns the json object of that file
 */
function getJsonOfFile(filePath){
	var xlsx = require('xlsx');
	var excelFile = xlsx.readFile(filePath);
	// read the first sheet of that excel file
	var firstSheetName = excelFile.SheetNames[0];
	// convert the sheet to json
	return xlsx.utils.sheet_to_json(excelFile.Sheets[firstSheetName]);
}


/**
 * 
 * @param {*} jsonObj receives a json objects
 * @returns a set of keys
 */
function getKeysOfJson(jsonObj){
	let keyArray = jsonObj.reduce(function(keys, element){
		for(let key in element){
			keys.push(key);
		}
		return keys;
	},[]);
	return new Set(keyArray);

}
/**
 * @brief
 * This method fills the empty cells of a column with zero.
 * @param {*} filePath takes a string which has the path of file 
 * @returns void
 */
async function fillWithZero(filePath){
	let jsonObj = getJsonOfFile(filePath);
	console.log(JSON.stringify(jsonObj));

	console.log(getKeysOfJson(jsonObj));

	let keySet = getKeysOfJson(jsonObj);
	
	vscode.window.showInformationMessage('Enter the column name' + "\n");
	const input = await vscode.window.showInputBox();
	if(!keySet.has(input)){
		vscode.window.showInformationMessage('The column doesn\'t exist!!!');
		return;
	}
	vscode.window.showInformationMessage('Filling the values with zero!' + input);

	// fills the json object with a value of zero
	jsonObj.forEach((obj)=>{
		if(!obj.hasOwnProperty(input)){
			obj[input] = 0;

		}
	});

	// Save the file to disk
	jsonToExcelBuffer(jsonObj).then((buffer)=>{
		saveBufferToFile(buffer);
	});

	
}

/**
 * @brief
 * This method removes the blank rows of excel file
 * @param {*} jsonOfSheet takes the json of the sheet as input * 
 */
function removeBlankRows(jsonOfSheet){
	// No of rows that has data
	var actualRows = Object.keys(jsonOfSheet).length;
	console.log(`The sheet has ${actualRows} non empty rows`);
	
	jsonToExcelBuffer(jsonOfSheet).then((buffer)=>{
		saveBufferToFile(buffer);
	});
	
}

 
/**
 * 
 * @param {*} jsonFile takes a json a file as input
 * @returns excel buffer of json file
 */
async function jsonToExcelBuffer(jsonFile) {
	let XLSX = require('xlsx');
	const workSheet = XLSX.utils.json_to_sheet(jsonFile);
	const workBook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workBook, workSheet, "0data");

	// Generate buffer
	let writeData = XLSX.write(workBook, {bookType: 'xlsx', type: 'buffer'});

	

	return writeData;
	
	
}

/**
 * 
 * @param {*} buffer takes a buffer as input
 * doesn't return anything but saves the file to the disk
 */
async function saveBufferToFile(buffer){
	// demo
	const filePath = vscode.Uri.file('E://demo.xlsx');
	vscode.window.showInformationMessage("File was exported as output.xlsx");
	const wsedit = new vscode.WorkspaceEdit();
	
	wsedit.createFile(filePath, { ignoreIfExists: true });
	
	vscode.workspace.applyEdit(wsedit);

	// read that empty file and then write to it
	await vscode.workspace.fs.writeFile(filePath, buffer);
}

/**
 * 
 * @param {*} filePath takes the file path as String
 */
async function fillWithAverage(filePath){
	let jsonObj = getJsonOfFile(filePath);
	let keySet = getKeysOfJson(jsonObj);	
		vscode.window.showInformationMessage('Enter the column name' + "\n");
			const input = await vscode.window.showInputBox();
				if(!keySet.has(input)){
					vscode.window.showInformationMessage('The column doesn\'t exist!!!');
						return;
					}
	vscode.window.showInformationMessage('Filling the values with zero!' + input);

	//TODO: Move this to another method
	let count = 0, average = 0, total = 0;
	jsonObj.forEach((obj)=>{
		if(obj.hasOwnProperty(input)){
			if(isNumber(obj[input])){
			total += obj[input];
			count++;
			} else{
				vscode.window.showErrorMessage("Can only calculate the average of integers and float!");
				return;
			}
		}
	});
	
	average = total/count;
	console.log(`Total: ${total}, Average: ${average}, Count: ${count}\n`);

	// fills the json object with a value of zero
	jsonObj.forEach((obj)=>{
		if(!obj.hasOwnProperty(input)){
			obj[input] = average;

		}
	});

	// Save the file to disk
	jsonToExcelBuffer(jsonObj).then((buffer)=>{
		saveBufferToFile(buffer);
	});

}

function visualizeExcelFile(fsPath) {
	
	const panel = vscode.window.createWebviewPanel(
        'catCoding',
        "Powered by 0Data",
        vscode.ViewColumn.One,
        {
          // Enable scripts in the webview
          enableScripts: true
        }
      );

      panel.webview.html = getWebviewContent(getJsonOfFile(fsPath));
}


function getWebviewContent(jsonObj) {
	let tableHeaders = Array.from(getKeysOfJson(jsonObj));
	let keys = JSON.stringify(tableHeaders);
	console.log(JSON.parse(keys));
	
	
	
	
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Cat Coding</title>

	  <style>
	  
		tr, td{
			color: #FFF;
			min-width: 20px;
			border: 1px dotted #03A062 ;
			text-align: center;
			background-color: #000;
		}
		
	  </style>
  </head>
  <body>
	  <table id="table">
		
	  </table>
  
	  <script>
			
		
			var table = document.getElementById("table");	
			let th = table.createTHead();
			let	tr = th.insertRow(0);	
			let keys = Array.from(JSON.parse(JSON.stringify(${keys})));
				
			
		    for(let x=0; x<keys.length;x++){
				
				tc = tr.insertCell(0);
				tc.innerHTML = keys[keys.length-x-1];
						
			}	  
		  	for (let item of ${JSON.stringify(jsonObj)}) {
			row = table.insertRow(-1);
			for (let key in item) {
				var cell = row.insertCell(-1);
				cell.innerHTML = item[key];
			}
		}
	  </script>
  </body>
  </html>`;
  
  }

  function deDuplicateExcelFile(filePath){
	vscode.window
	.showInformationMessage(
	  "Deduplication can take a while.",
	  ...["Proceed", "No"]
	)
		.then((answer) => {
			if (answer === "Proceed") {
				let file = getJsonOfFile(filePath);
				let newFile = [];
				file.forEach((f) => {
					// TODO: fix unequal param rows
					if (countEqual(file, f) <= 1) {
						
						newFile.push(f);
					} else if (countEqual(newFile, f) < 1) {
						newFile.push(f);
					}

				});
				console.log(newFile);
	  }
	});
	
  }
/**
 * @brief
 * The function is more like an equatity operator of my json
 * arrays
 * @param {*} oo Receives the full list
 * @param {*} pp the object to compare with the whole list
 * @returns how many matches are common with this database
 */
  function countEqual(oo, pp) {
    var count = 0;
    oo.forEach(function (el) {
        var i, equal = true;
        for (i in el) {
            equal = equal && el[i] === pp[i];
        }
        equal && count++;
		
    });
	
    return count;
}


/**
 * 
 * @param {*} n takes a number n as input
 * @returns true or false
 */
 function isInt(n){
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}

function isNumber(n){
    return isInt(n) || isFloat(n);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}




