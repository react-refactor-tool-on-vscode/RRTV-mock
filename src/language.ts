import * as node from 'vscode-languageserver/node';
import * as vscode from 'vscode';
import { TabPosition } from './command';

export function replaceInvocation(range:node.Range, text:string):string {
    const ret = "<>hello I'm a composition</>";
    return ret;
}

export function getSnippet(pick:string, text:string):string {
    text = "<div $1=$2>hello I'm a snippet</> \n <div $1=$2>do you want to add attribute on me?</> ";
    return text;
}

