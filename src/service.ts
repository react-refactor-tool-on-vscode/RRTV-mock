import * as node from 'vscode-languageserver/node';
import * as vscode from 'vscode';

export function replaceInvocation(range:vscode.Range, text:string):string {
    const ret = "<>hello I'm a composition</>";
    return ret;
}