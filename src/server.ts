/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */


import {
	CodeAction, CodeActionKind, Command, DeclarationLink, Definition, DefinitionLink,
	DocumentHighlight, DocumentHighlightKind, Hover, InitializeError, Location, MarkupKind, MessageActionItem,
	Position, Range, ResponseError, SignatureHelp, SymbolInformation, SymbolKind,
	TextEdit, DiagnosticTag, InsertTextFormat, SelectionRangeRequest, SelectionRange, InsertReplaceEdit,
	SemanticTokensClientCapabilities, SemanticTokensLegend, SemanticTokensBuilder, SemanticTokensRegistrationType,
	SemanticTokensRegistrationOptions, ProtocolNotificationType, ChangeAnnotation, WorkspaceChange,
	DocumentDiagnosticReportKind, WorkspaceDiagnosticReport, NotebookDocuments, CompletionList, DocumentLinkResolveRequest,
	WorkspaceEdit,createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
} from 'vscode-languageserver/node';
import {initialize} from './initialize' ;
import {extractDOM} from './extract';
//import * as vsn from 'vscode-languageserver-node'
import * as vsn from 'vscode-languageserver/node';
import * as vscode from 'vscode';
//import { register } from './register';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';


// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;
const DidTriggerFormCommand = {
	type: { get method() { return 'rrtv-client/formTrigger'; } },
};
// 自定义输入框命令
const DidTriggerInputCommand = {
	type: { get method() { return 'rrtv-client/inputTrigger'; } },
};
connection.onInitialize(initialize);
connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
		connection.client.register(vsn.CodeActionRequest.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
	//connection.client.register(DidTriggerFormCommand.type, {trigger: 'form'});
	
});


interface ExampleSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();





// Only keep settings for open documents
documents.onDidClose(e => { //documents is a documents manager, not the document itself
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	//validateTextDocument(change.document);
	checkElement(change.document);

});

function dublicateAction(document:TextDocument, range:Range, ctx:vsn.CodeActionContext): CodeAction {
	const text = document.getText(range);
	const change: WorkspaceChange = new WorkspaceChange();
	const a = change.getTextEditChange(document);
	a.insert({line: range.end.line + 2, character: 0}, `\n\n${text}\n\n`, ChangeAnnotation.create('generate by refactor', false));
	const codeAction: CodeAction = {
		title: 'stellar hunter code action',
		kind: CodeActionKind.QuickFix,
		data: document.uri
	};
	codeAction.edit = change.edit;
	return codeAction;
}  
connection.onCodeActionResolve((codeAction) => {

	return codeAction;
});

function showRangeAciton(document:TextDocument, range:Range, ctx: vsn.CodeActionContext): CodeAction {

	const codeAction:CodeAction = {
		title: "range of this code action",
		kind: CodeActionKind.Refactor,
		data: document.uri,
	};
	const text = document.getText();
	const change = insertBehind(document, text, range);
	codeAction.edit = change.edit;
	return codeAction;
}

function insertBehind(document:TextDocument, text:string, range:Range):vsn.WorkspaceChange {
	const change = new WorkspaceChange();
	const a = change.getTextEditChange(document);
	a.insert({line: range.end.line + 1, character: 0}, `\n\n${text}\n\n`, ChangeAnnotation.create('insert behind', false));
	return change;
}

function replaceSelected(document: TextDocument, text:string, range:Range):vsn.WorkspaceChange {
	const change = new WorkspaceChange();
	const a = change.getTextEditChange(document);
	a.replace(range, `\n\n${text}\n\n`, ChangeAnnotation.create('replace selected', false));
	return change;
}
connection.sendNotification

function extractRename(document:TextDocument, range:Range, ctx:vsn.CodeActionContext, text:string): CodeAction {
	const result = extractDOM(text, document, undefined);
	const position:Position = {
		line: range.end.line + 3,
		character: 11
	};
	const command:Command = {
		title: 'Rename Symbol',
		command: 'editor.action.rename',
		arguments: [position]
	};
	const command2:Command = {
		title: 'rrtv-client.triggerForm',
		command: 'rrtv-client.triggerForm',
	};
	const codeAction = {
		title: 'extract this DOM and rename',
		kind: CodeActionKind.RefactorExtract,
		data: document.uri,
		command: command2
	};
	return codeAction;
}


connection.onExecuteCommand((params) => {
	const command = params.command;
	if(command === DidTriggerFormCommand.type.method) {
		showForm();
	} else if (command === DidTriggerInputCommand.type.method) {
		showInputBox();
	} else if (command === 'extract') {
		showForm();
	}
});

// connection.onNotification((params) => {
// 	const command = params;
// 	if(command === DidTriggerFormCommand.type.method) {
// 		showForm();
// 	} else if (command === DidTriggerInputCommand.type.method) {
// 		showInputBox();
// 	}
// });

async function showForm() {
	const response = await connection.window.showInformationMessage('choose a parent', {title: 'a'}, {title: 'b'});
	if(response === undefined) {return undefined;};
	if(response.title === 'a') {
		connection.window.showInformationMessage("good choice");
	} else if (response.title === 'b') {
		connection.window.showInformationMessage("bad choice");
	}
}

function showInputBox() {
	
}

connection.onCodeAction((params) => {
	const document = documents.get(params.textDocument.uri);
	if(document === undefined) {return [];}
	const codeActions:CodeAction[] = [];
	const ctx = params.context;
	const range = params.range;
	const text = document.getText(range);

	//const dublicateCode:CodeAction = dublicateAction(document, range);
	codeActions.push(dublicateAction(document, range, ctx));
	codeActions.push(showRangeAciton(document, range, ctx));
	codeActions.push(extractRename(document, range, ctx, text));
	
	return codeActions;
});




connection.onHover((textPosition):Hover => {
	return {
		contents: {
			kind: MarkupKind.PlainText,
			value: 'hover message create by server' 
		}
	};
});




async function checkElement(textDocument: TextDocument) {
	const maxNumberOfChecks = 1000;
	const pattern = /function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/g;
	let m: RegExpExecArray | null;
	const text = textDocument.getText();
	const diagnostics: Diagnostic[] = [];
	let checks = 0;
	while ((m = pattern.exec(text)) && checks < maxNumberOfChecks) {
		checks ++;
		const codeAction:CodeAction = {
			title: "code action published by diagnositic",
			kind: vsn.CodeActionKind.QuickFix,
			data: textDocument.uri
		};
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Hint,
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



connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.
		return [
			{
				label: 'TypeScript',
				kind: CompletionItemKind.Text,
				data: 1
			},
			{
				label: 'JavaScript',
				kind: CompletionItemKind.Text,
				data: 2
			}
		];
	}
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		if (item.data === 1) {
			item.detail = 'TypeScript details';
			item.documentation = 'TypeScript documentation';
		} else if (item.data === 2) {
			item.detail = 'JavaScript details';
			item.documentation = 'JavaScript documentation';
		}
		return item;
	}
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
