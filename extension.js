// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
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

	context.subscriptions.push(handleMissingValues);
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

function removeBlankRows(jsonOfSheet){
	// No of rows that has data
	var actualRows = Object.keys(jsonOfSheet).length;
	console.log(`The sheet has ${actualRows} non empty rows`);
	jsonToExcel(jsonOfSheet);
}

function jsonToExcel(jsonFile){
	let XLSX = require('xlsx');
	const workSheet = XLSX.utils.json_to_sheet(jsonFile);
	const workBook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workBook, workSheet, "0data");

	// Generate buffer
	XLSX.write(workBook, {bookType: 'xlsx', type: 'buffer'});

	// Binary String
	XLSX.write(workBook, {bookType: 'xlsx', type: 'binary'});

	XLSX.writeFile(workBook, 'output.xlsx');


	return workBook;
	// read the first sheet of that excel file
	var firstSheetName = excelFile.SheetNames[0];
	console.log(firstSheetName);
	
}


// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
