import * as node from 'vscode-languageserver/node';
import { extractDOM } from './extract';
import { TextDocument } from 'vscode-languageserver-textdocument';


export function dublicateAction(document: TextDocument, range: node.Range, ctx: node.CodeActionContext): node.CodeAction {
	const text = document.getText(range);
	const change: node.WorkspaceChange = new node.WorkspaceChange();
	const a = change.getTextEditChange(document);
	a.insert({ line: range.end.line + 2, character: 0 }, `\n\n${text}\n\n`, node.ChangeAnnotation.create('generate by refactor', false));
	const codeAction: node.CodeAction = {
		title: 'stellar hunter code action',
		kind: node.CodeActionKind.QuickFix,
		data: document.uri
	};
	codeAction.edit = change.edit;
	return codeAction;
}


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


export function extractRename(document: TextDocument, range: node.Range, ctx: node.CodeActionContext, text: string): node.CodeAction {
	const result = extractDOM(text, document, undefined);
	const position: node.Position = {
		line: range.end.line + 3,
		character: 11
	};
	// const command: node.Command = {
	// 	title: 'Rename Symbol',
	// 	command: 'editor.action.rename',
	// 	arguments: [position]
	// };
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
