import * as node from 'vscode-languageserver/node';
import * as vscode from 'vscode';
import {
	DocumentUri,
	TextDocument
} from 'vscode-languageserver-textdocument';
import { documents, connection, CommandParams } from './server';
import { replaceInvocation } from './service';

export function extractCommand(params: CommandParams) {
	const document:DocumentUri = params.arguments[0].document;
	const range:vscode.Range = params.arguments[0].range;
	const text = documents.get(document);
	const pick:string = params.arguments[0].pick; // 选项
	if (text === undefined || range === undefined) { 
		return; 
	}
	let code = text.getText(range);
	const regex = /(?<=function\s+)\b([^\s(]+)/;

	code = code.replace(regex, params.arguments[0].name);

	const documentChanges:node.TextDocumentEdit[] = [
		node.TextDocumentEdit.create({
			uri: document,
			version: text.version
		},
			[node.TextEdit.insert(range.end, code)]
		)
	];
	connection.workspace.applyEdit({
		documentChanges: documentChanges
	});
}

export function invocation2CompositionExec(params: CommandParams) {
	const document = documents.get(params.arguments[0].document);
	const range:vscode.Range = params.arguments[0].range;
	if(document === undefined || range === undefined) {return;}

	let code = document.getText(range);
	code = replaceInvocation(range, document.getText());

	const documentChanges: node.TextDocumentEdit[] = [
		node.TextDocumentEdit.create({
			uri:document.uri,
			version:document.version
		},
			[node.TextEdit.replace(range, code)]
		)
	];
	connection.workspace.applyEdit({
		documentChanges: documentChanges
	});
} 


export function extractJSXtoreturnExe(params: CommandParams) {
	console.log("hello vscode");
}

	


export function extractJSXtoreducerExe(params: CommandParams) {
	const document:DocumentUri = params.arguments[0].document;
	const range:vscode.Range = params.arguments[0].range;
	const text = documents.get(document);
	const pick:string = params.arguments[0].pick; // 选项
	if (text === undefined || range === undefined) { 
		return; 
	}
	let code = text.getText(range);
	const regex = /(?<=return\s+)\b([^\s(]+)/;

	code = code.replace(regex, params.arguments[0].name);

	const documentChanges:node.TextDocumentEdit[] = [
		node.TextDocumentEdit.create({
			uri: document,
			version: text.version
		},
			[node.TextEdit.insert(range.end, code)]
		)
	];
	connection.workspace.applyEdit({
		documentChanges: documentChanges
	});

} 


export function extractJSXtohooksExe(params: CommandParams) {
	const document:DocumentUri = params.arguments[0].document;
	const range:vscode.Range = params.arguments[0].range;
	const text = documents.get(document);
	const pick:string = params.arguments[0].pick; // 选项
	if (text === undefined || range === undefined) { 
		return; 
	}
	let code = text.getText(range);
	const regex = /(?<=function\s+)\b([^\s(]+)/;

	code = code.replace(regex, params.arguments[0].name);

	const documentChanges:node.TextDocumentEdit[] = [
		node.TextDocumentEdit.create({
			uri: document,
			version: text.version
		},
			[node.TextEdit.insert(range.end, code)]
		)
	];
	connection.workspace.applyEdit({
		documentChanges: documentChanges
	});
	console.log("hello 2233");
} 
