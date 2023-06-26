import * as node from 'vscode-languageserver/node';
import * as vscode from 'vscode';
import {
	DocumentUri,
	TextDocument
} from 'vscode-languageserver-textdocument';
import { documents, connection, CommandParams } from './server';
import { replaceInvocation } from './service';
import * as service from './language';

export type TabPosition = {
    position: vscode.Position,
    tab: number
};

export function extractCommand(params: CommandParams) {
	const document:DocumentUri = params.arguments[0].document;
	const range:vscode.Range = params.arguments[0].range;
	const text = documents.get(document);
	const pick:string = params.arguments[0].pick;
	//connection.window.showInformationMessage(range.start.line.toString())
	//connection.window.showInformationMessage(range.end.line.toString())
	// 选项
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

export function parameterFlatteningExec(params: CommandParams) {
	const document = documents.get(params.arguments[0].document);
	const range:vscode.Range = params.arguments[0].range;
	if(document === undefined || range === undefined) {return;}

	let code = 'hello parameterFlattening';

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

export function stateUpgradeExec(params:CommandParams) {
	const document:DocumentUri = params.arguments[0].document;
	const range:vscode.Range = params.arguments[0].range;
	const text = documents.get(document);
	const pick:string = params.arguments[0].pick;
	//connection.window.showInformationMessage(document)
	//connection.window.showInformationMessage(range.start.line.toString())
	//connection.window.showInformationMessage(range.end.line.toString())
	//connection.window.showInformationMessage(pick) // 选项
	if (text === undefined || range === undefined) { 
		return; 
	}
	if(pick === 'button'){
		connection.window.showInformationMessage("get button")
		let code = text.getText(range);
		const regex = /(?<=function\s+)\b([^\s(]+)/;
		code = code.replace(regex, params.arguments[0].name);
		const documentChanges = [
			node.TextDocumentEdit.create({
				uri:document,
				version:text.version
			},
				[node.TextEdit.insert(range.end,code)]
			)
		]
		connection.workspace.applyEdit({
			documentChanges: documentChanges
		})
	}
	else if(pick === 'square'){
		connection.window.showInformationMessage("get square")
		let code = 'That is a square!'
		const documentChanges = [
			node.TextDocumentEdit.create({
				uri:document,
				version:text.version
			},
				[node.TextEdit.replace(range,code)]
			)
		]
		connection.workspace.applyEdit({
			documentChanges: documentChanges
		})
	}
	else if(pick === 'whu'){
		connection.window.showInformationMessage("get whu")
		let code = 'whu!'
		const documentChanges = [
			node.TextDocumentEdit.create({
				uri:document,
				version:text.version
			},
				[node.TextEdit.insert(range.start,code.repeat(3))]
			)
		]
		connection.workspace.applyEdit({
			documentChanges: documentChanges
		})
	}
	else {
		connection.window.showInformationMessage("get nothing")
	}

}

export function fulfillAttribute(params: CommandParams) {
	const pick = params.arguments[0].pick;
	const document = params.arguments[0].document;
	const range = params.arguments[0].range;
    const tabpos:TabPosition[] = service.getAttrPositions(pick, range);
	connection.sendRequest(node.ExecuteCommandRequest.method, {
		command: "run snippet",
		arguments:[]
	});
	connection.window.showInformationMessage("snippet is sent");
}