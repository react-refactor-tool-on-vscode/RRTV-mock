import * as vsn from 'vscode-languageserver/node';
import * as vscode from 'vscode';
//import { register } from './register';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

export function initialize(params:vsn.InitializeParams): vsn.InitializeResult {
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
                    "trigger form"
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
}