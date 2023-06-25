import * as node from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { connection } from './server';



async function showForm(params: string) {
	const response = await connection.window.showInformationMessage(params, { title: 'a' }, { title: 'b' });
	if (response === undefined) { return undefined; };
	if (response.title === 'a') {
		connection.window.showInformationMessage("good choice");
	} else if (response.title === 'b') {
		connection.window.showInformationMessage("bad choice");
	}
}
export async function checkElement(textDocument: TextDocument) {
	const maxNumberOfChecks = 1000;
	const pattern = /function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/g;
	let m: RegExpExecArray | null;
	const text = textDocument.getText();
	const diagnostics: node.Diagnostic[] = [];
	let checks = 0;
	while ((m = pattern.exec(text)) && checks < maxNumberOfChecks) {
		checks++;
		const codeAction: node.CodeAction = {
			title: "code action published by diagnositic",
			kind: node.CodeActionKind.QuickFix,
			data: textDocument.uri,
			isPreferred: true
		};
		const diagnostic: node.Diagnostic = {
			severity: node.DiagnosticSeverity.Hint,
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
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}
