
import * as node from 'vscode-languageserver/node';
import {initialize} from './initialize' ;
//import * as vsn from 'vscode-languageserver-node'
import * as vscode from 'vscode';
//import { register } from './register';

import {
	DocumentUri,
	TextDocument
} from 'vscode-languageserver-textdocument';
import { dublicateAction, showRangeAciton, extractRename } from './codeAction';
import { extractCommand } from './command';

export const connection = node.createConnection(node.ProposedFeatures.all);
export const documents: node.TextDocuments<TextDocument> = new node.TextDocuments(TextDocument);


connection.onInitialize(initialize);
connection.onInitialized(() => {
	connection.client.register(node.CodeActionRequest.type, undefined);
});


documents.onDidChangeContent(change => {
	checkElement(change.document);

});


connection.onHover((textPosition):node.Hover => {
	return {
		contents: {
			kind: node.MarkupKind.PlainText,
			value: 'hover message create by server' 
		}
	};
});

connection.onExecuteCommand((params) => {
	const command = params.command;
	if(params.arguments) {
		const text = documents.get(params.arguments[0].document);
		if(text === undefined) {return ;}
		if (command === 'extract-server') {
			extractCommand(params);			
		}
	}
	
});

interface CommandParams {
	range: vscode.Range;
	document: DocumentUri;
}

connection.onCodeAction((params) => {
	const document = documents.get(params.textDocument.uri);
	if(document === undefined) {return [];}
	const codeActions:node.CodeAction[] = [];
	const ctx = params.context;
	const range = params.range;
	const text = document.getText(range);

	//const dublicateCode:CodeAction = dublicateAction(document, range);
	codeActions.push(dublicateAction(document, range, ctx));
	codeActions.push(showRangeAciton(document, range, ctx));
	codeActions.push(extractRename(document, range, ctx, text));
	return codeActions;
});


async function showForm(params:string) {
	const response = await connection.window.showInformationMessage(params, {title: 'a'}, {title: 'b'});
	if(response === undefined) {return undefined;};
	if(response.title === 'a') {
		connection.window.showInformationMessage("good choice");
	} else if (response.title === 'b') {
		connection.window.showInformationMessage("bad choice");
	}
}


async function checkElement(textDocument: TextDocument) {
	const maxNumberOfChecks = 1000;
	const pattern = /function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/g;
	let m: RegExpExecArray | null;
	const text = textDocument.getText();
	const diagnostics: node.Diagnostic[] = [];
	let checks = 0;
	while ((m = pattern.exec(text)) && checks < maxNumberOfChecks) {
		checks ++;
		const codeAction:node.CodeAction = {
			title: "code action published by diagnositic",
			kind: node.CodeActionKind.QuickFix,
			data: textDocument.uri
		};
		const diagnostic: node.Diagnostic = {
			severity: node.DiagnosticSeverity.Hint,
			range: {
				start: textDocument.positionAt(m.index),
				end: textDocument.positionAt(m.index + m[0].length)
			},
			message: `element can be extract`,
			source: 'stellaron hunter',
			data: [codeAction]
		};
		diagnostics.push(diagnostic);
	}
	connection.sendDiagnostics({uri:textDocument.uri, diagnostics});

}


documents.listen(connection);
connection.listen();
