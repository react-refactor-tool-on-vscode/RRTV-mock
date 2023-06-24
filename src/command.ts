import * as node from 'vscode-languageserver/node';
import * as vscode from 'vscode';
import {
	DocumentUri,
	TextDocument
} from 'vscode-languageserver-textdocument';
import { documents, connection } from './server';

type ExtractParamsBack = {
	name: string;
	range: vscode.Range;
	document: TextDocument;
};
export function extractCommand(params: node.ExecuteCommandParams):node.TextDocumentEdit[] {
	if(params.arguments === undefined) {
		return [];
	}
	const document:DocumentUri = params.arguments[0].document;
	const range = params.arguments[0].range as vscode.Range;
	const text = documents.get(document);
	if (text === undefined || range === undefined) { 
		return []; 
	}
	const code = text.getText(range);
	

	const documentChanges:node.TextDocumentEdit[] = [
		node.TextDocumentEdit.create({
			uri: document,
			version: text.version
		},
			[node.TextEdit.insert(range.end, code)]
		)
	];
	return documentChanges;

}
