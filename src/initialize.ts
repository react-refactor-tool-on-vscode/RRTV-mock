import * as vsn from 'vscode-languageserver/node';
import * as vscode from 'vscode';
//import { register } from './register';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

const registeredCommands = [
    "Rename Symbol",
    "trigger form",
    "extract-server",
    "extract",
    "invocation2Composition",
    "parameterFlattening",
    "jsx-extract-return",
    "jsx-extract-reducer",
    "jsx-extract-hooks",
    "stateUpgrade",
    "stateUpgrade-server",
    "modify-attribute",
    "provide attribute exec",
    "provide attribute",
    "run snippet"
];


export function initialize(params:vsn.InitializeParams): vsn.InitializeResult {
    const capabilities = params.capabilities;

    const result: vsn.InitializeResult = {
        capabilities: {
            textDocumentSync: vsn.TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: false,
            },
            hoverProvider: true,
            codeActionProvider: true,
            executeCommandProvider: {
                commands: registeredCommands
            },
        }
    };
    return result;
}