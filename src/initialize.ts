import * as vsn from 'vscode-languageserver/node';
import * as vscode from 'vscode';
//import { register } from './register';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';


export function initialize(params:vsn.InitializeParams): vsn.InitializeResult {
    const capabilities = params.capabilities;

    const result: vsn.InitializeResult = {
        capabilities: {
            textDocumentSync: vsn.TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true
            },
            hoverProvider: true,
            codeActionProvider: true,
            executeCommandProvider: {
                commands: [
                    "Rename Symbol",
                    "trigger form",
                    "extract-server",
                    "extract"
                ]
            },
        }
    };
    return result;
}