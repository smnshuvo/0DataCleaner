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
		
		let fillBlanksWithZero = vscode.commands.registerCommand('0data.fillWithZero',(uri) => {
			fillWithZero(uri.fsPath);
		});

	context.subscriptions.push(handleMissingValues);
	context.subscriptions.push(fillBlanksWithZero);
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

function removeBlankRows(jsonOfSheet){
	// No of rows that has data
	var actualRows = Object.keys(jsonOfSheet).length;
	console.log(`The sheet has ${actualRows} non empty rows`);
	
	jsonToExcelBuffer(jsonOfSheet).then((buffer)=>{
		saveBufferToFile(buffer);
	});
	
}

// returns excel buffer of json file
async function jsonToExcelBuffer(jsonFile) {
	let XLSX = require('xlsx');
	const workSheet = XLSX.utils.json_to_sheet(jsonFile);
	const workBook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workBook, workSheet, "0data");

	// Generate buffer
	let writeData = XLSX.write(workBook, {bookType: 'xlsx', type: 'buffer'});

	

	return writeData;
	
	
}

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


// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
