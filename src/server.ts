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

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);
	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,//incremental增加的
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true
			},
			hoverProvider: true,
			codeActionProvider: true,
			executeCommandProvider: {
				commands: [
					"Rename Symbol"
				]
			}
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
	
});



// The example settings
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

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(
			(change.settings.languageServerExample || defaultSettings)
		);
	}
	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);//如果不支持configuration，就返回全局设置
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'languageServerExample'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

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

function dublicateFunc(document:TextDocument, range:Range): CodeAction {
	const text = document.getText(range);
	const change: WorkspaceChange = new WorkspaceChange();
	const a = change.getTextEditChange(document);
	a.insert({line: range.end.line + 2, character: 0}, "\n\n" + text + "\n\n", ChangeAnnotation.create('generate by refactor', false));
	const codeAction: CodeAction = {
		title: 'stellar hunter code action',
		kind: CodeActionKind.QuickFix,
		data: document.uri
	};
	codeAction.edit = change.edit;
	return codeAction;
}  


connection.onCodeAction((params) => {
	const document = documents.get(params.textDocument.uri);
	if(document === undefined) {return [];}
	const codeActions:CodeAction[] = [];
	const ctx = params.context;
	const range = params.range;
	const text = document.getText(range);
	const dublicateCode:CodeAction = dublicateFunc(document, range);
	codeActions.push(dublicateCode);
	
	const codeAction:CodeAction = {
		title: "range of this code action",
		kind: CodeActionKind.Refactor,
		data: document.uri,
	};
	const change = new WorkspaceChange();
	const a = change.getTextEditChange(document);
	a.insert({line: range.end.line + 1, character: 0}, JSON.stringify(range) + " text: "+ text, ChangeAnnotation.create('generate by refactor', false));
	codeAction.edit = change.edit;
	codeActions.push(codeAction);
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
			severity: DiagnosticSeverity.Warning,
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

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	// In this simple example we get the settings for every validate run.
	//const settings = await getDocumentSettings(textDocument.uri);
	
	const settings: ExampleSettings = { maxNumberOfProblems: 1000 };
	// The validator creates diagnostics for all uppercase words length 2 and more
	const text = textDocument.getText();
	const pattern = /\b[A-Z]{2,}\b/g;
	let m: RegExpExecArray | null;

	let problems = 0;
	const diagnostics: Diagnostic[] = [];
	while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Warning,
			range: {
				start: textDocument.positionAt(m.index),
				end: textDocument.positionAt(m.index + m[0].length)
			},
			message: `${m[0]} is all uppercase.`,
			source: 'ex'
		};
		if (hasDiagnosticRelatedInformationCapability) {
			diagnostic.relatedInformation = [
				{
					location: {
						uri: textDocument.uri,
						range: Object.assign({}, diagnostic.range)
					},
					message: 'Spelling matters'
				},
				{
					location: {
						uri: textDocument.uri,
						range: Object.assign({}, diagnostic.range)
					},
					message: 'Particularly for names'
					
				}
			];
		}
		diagnostics.push(diagnostic);
	}

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
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
