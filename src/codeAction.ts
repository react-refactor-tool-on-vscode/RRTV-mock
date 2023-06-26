import * as node from 'vscode-languageserver/node';
import { extractDOM } from './extract';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Command, Range } from 'vscode';


export function showRangeAciton(document: TextDocument, range: node.Range, ctx: node.CodeActionContext): node.CodeAction {
	const codeAction: node.CodeAction = {
		title: "range of this code action",
		kind: node.CodeActionKind.Refactor,
		data: document.uri,
	};
	const text = document.getText();
	const change = insertBehind(document, text, range);
	codeAction.edit = change.edit;
	return codeAction;
}


function insertBehind(document: TextDocument, text: string, range: node.Range): node.WorkspaceChange {
	const change = new node.WorkspaceChange();
	const a = change.getTextEditChange(document);
	a.insert({ line: range.end.line + 1, character: 0 }, `\n\n${text}\n\n`, node.ChangeAnnotation.create('insert behind', false));
	return change;
}


function replaceSelected(document: TextDocument, text: string, range: node.Range): node.WorkspaceChange {
	const change = new node.WorkspaceChange();
	const a = change.getTextEditChange(document);
	a.replace(range, `\n\n${text}\n\n`, node.ChangeAnnotation.create('replace selected', false));
	return change;
}


export function extractRename(document: TextDocument, range: node.Range, ctx: node.CodeActionContext, text: string): node.CodeAction | undefined {
	const command: node.Command = {
		title: 'extract',
		command: 'extract',
		arguments: [{
			items: ['1', '2', '3'],
			range: range,
			document:document.uri
		}]
	};
	const codeAction = {
		title: 'extract this DOM and rename',
		kind: node.CodeActionKind.RefactorExtract,
		data: document.uri,
		command: command
	};
	return codeAction;
}

export function renameSymbol(document:TextDocument, range:node.Range, text:string): node.CodeAction | undefined{
	const command: node.Command = {
		title: 'editor.action.rename',
		command: 'editor.action.rename',
		arguments: [
			range,
		]
	};
	const codeAction = {
		title: 'rename this symbol: ' + text,
		kind: node.CodeActionKind.Refactor,
		data: document.uri,
		command: command
	};
	return codeAction;
}

export function invocation2Composition(document:TextDocument, range:node.Range): node.CodeAction | undefined {
	const result = isInvocation(document, range);
	if(!result) {return;}
	const command:Command = {
		title:'invocation2Composition',
		command: 'invocation2Composition',
		arguments: [{
			range: result,
			document: document.uri
		}]
	};
	const codeAction:node.CodeAction = {
		title: '组件调用转为组件组合',
		kind: node.CodeActionKind.RefactorRewrite,
		data: document.uri,
		command: command
	};
	return codeAction;
}

function isInvocation(document:TextDocument, range:node.Range): node.Range | undefined {
	let lineRange:node.Range = range;
	if(range.start.line !== range.end.line) {
		return;
	}
	lineRange.start.character = 0;
	lineRange.end.character = 1000;
	const line:string = document.getText(lineRange);
	const regex = new RegExp(`(?<=.{${range.start.character}})\\b\\w+\\s*\\(`);
	if(regex.test(line)) {
		return lineRange;
	}
	return;
}

export function parameterFlattening(document:TextDocument,range:node.Range) : node.CodeAction | undefined {
	const result = isParameter(document, range);
	if(!result) {return;}
	const command:Command = {
		title:'parameterFlattening',
		command: 'parameterFlattening',
		arguments: [{
			range: result,
			document: document.uri
		}]
	};
	const codeAction:node.CodeAction = {
		title: '参数扁平化',
		kind: node.CodeActionKind.RefactorRewrite,
		data: document.uri,
		command: command
	};
	return codeAction;
}

function isParameter(document:TextDocument, range:node.Range): node.Range | undefined {
	let lineRange:node.Range = range;
	if(range.start.line !== range.end.line) {
		return;
	}
	lineRange.start.character = 0;
	lineRange.end.character = 1000;
	const line:string = document.getText(lineRange);
	const regex = /\(([^)]+)\)/;
	if(regex.test(line)) {
		return lineRange;
	}
	return;
}

export function stateUpgrade(document:TextDocument,range:node.Range) : node.CodeAction | undefined {
	const result = isState(document,range);
	if(!result) return
	const command : node.Command ={
		title : 'stateUpgrade',
		command : 'stateUpgrade',
		arguments : [{
			items:['button','square','whu'],
			range:result,
			document:document.uri
		}]
	}
	const codeAction:node.CodeAction = {
		title : '状态提升',
		kind : node.CodeActionKind.RefactorExtract,
		data: document.uri,
		command: command
	}
	return codeAction;
}

function isState(document:TextDocument, range:node.Range): node.Range | undefined {
	let lineRange:node.Range = range;
	if(range.start.line !== range.end.line) {
		return;
	}
	lineRange.start.character = 0;
	lineRange.end.character = 1000;
	const line:string = document.getText(lineRange);
	const regex = /\[(.*?)\]/g;
	if(regex.test(line)) {
		return lineRange;
	}
	return;
}