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
	console.log(filePath);
}

function loadFile(){
	var xlsx = require('node-xlsx');
	xlsx.parse('C:/Users/Shuvo/Desktop/New folder/test.xlsx');
	vscode.window.showInformationMessage('Excel file is being loaded!');
	getFilePath();
}


async function getFilePath(){	
		let selectedFile = await vscode.window.showOpenDialog();
		return selectedFile;
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
