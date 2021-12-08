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
	let loadExcel = vscode.commands.registerCommand('0data.loadExcel', loadFile);
		let handleMissingValues = vscode.commands.registerCommand('0data.handleMissing',(uri) => {
			HandleMissingValues(uri.fsPath);
		});

	context.subscriptions.push(handleMissingValues);
	context.subscriptions.push(loadExcel);
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
	// convert this to json
	// working with json will be much easier
	var jsonObjOfSheet = xlsx.utils.sheet_to_json(excelFile.Sheets[firstSheetName]);
	var jsonOfSheet = JSON.stringify(jsonObjOfSheet);
	
}


// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
