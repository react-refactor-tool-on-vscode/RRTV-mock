import * as node from 'vscode-languageserver/node';
import { initialize } from './initialize';
//import * as vsn from 'vscode-languageserver-node'
//import { register } from './register';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';
import {
	attrOptProvider,
	extractRename,
	invocation2Composition,
	parameterFlattening,
	renameSymbol,
	stateUpgrade
} from './codeAction';
import { extractCommand, fulfillAttribute, invocation2CompositionExec, parameterFlatteningExec, stateUpgradeExec } from './command';
import { checkElement } from './diagnositc';

export const connection = node.createConnection(node.ProposedFeatures.all);
export const documents: node.TextDocuments<TextDocument> = new node.TextDocuments(TextDocument);


connection.onInitialize(initialize);
connection.onInitialized(() => {
	connection.client.register(node.CodeActionRequest.type, undefined);
});


documents.onDidChangeContent(change => {
	checkElement(change.document);
});


connection.onHover((params):node.Hover => {
	const position = params.position;
	const document = params.textDocument;
	
	return {
		contents: {
			kind: node.MarkupKind.PlainText,
			value: 'hover message create by server' 
		}
	};
});

export type CommandParams = {
	command: string,
	arguments: node.LSPAny[]
};

connection.onExecuteCommand((params) => {
	const command = params.command;
	//connection.window.showInformationMessage(JSON.stringify(params));
	if(params.arguments) {
		const withArgs:CommandParams = {
			command: params.command,
			arguments: params.arguments
		};
		// connection.window.showInformationMessage(JSON.stringify())
		const text = documents.get(params.arguments[0].document);
		if(text === undefined) {
			connection.window.showInformationMessage('document is undefined');
			return ;
		}
		if (command === 'extract-server') {
			extractCommand(withArgs);			
		} else if(command === 'invocation2Composition') {
			invocation2CompositionExec(withArgs);
		} else if(command === 'parameterFlattening') {
			parameterFlatteningExec(withArgs);
		} else if(command === 'stateUpgrade-server') {
			//connection.window.showInformationMessage("get the stateUpgrade-server")
			stateUpgradeExec(withArgs);
		} else if (command === 'provide attribute exec') {
			//connection.window.showInformationMessage(JSON.stringify(withArgs));
			fulfillAttribute(withArgs);
		}
	}
});


function push(codeActions:node.CodeAction[], codeAction: node.CodeAction | undefined):node.CodeAction[] {
	if(codeAction) {
		codeActions.push(codeAction);
	}
	return codeActions;
}



connection.onCodeAction((params) => {
	const document = documents.get(params.textDocument.uri);
	if(document === undefined) {return [];}
	let codeActions:node.CodeAction[] = [];
	const ctx = params.context;
	const range = params.range;
	const text = document.getText(range);
	//connection.window.showInformationMessage(JSON.stringify(params.range));
	codeActions = push(codeActions, renameSymbol(document, range, text));
	codeActions = push(codeActions, extractRename(document, range, ctx, text));
	codeActions = push(codeActions,invocation2Composition(document, range));
	codeActions = push(codeActions,parameterFlattening(document,range));
	codeActions = push(codeActions, stateUpgrade(document,range));
	codeActions = push(codeActions, attrOptProvider(document, range));

	return codeActions;
});


connection.onCompletion((params) => {
	const result: node.CompletionItem[] = [];
	const list = node.CompletionList.create(result, true);
	list.itemDefaults = { data: 'abc' };
	return list;
});


documents.listen(connection);
connection.listen();
