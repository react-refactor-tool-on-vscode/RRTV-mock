import * as node from 'vscode-languageserver/node';
import * as vscode from 'vscode';
import { TabPosition } from './command';

export function replaceInvocation(range:node.Range, text:string):string {
    const ret = "<>hello I'm a composition</>";
    return ret;
}

export function getAttrPositions(pick:string, range:node.Range):TabPosition[] {
    const tabpos:TabPosition[] = [];
    for(let i = 1; i < 30; i += 5) {
        const tabPosition:TabPosition = {
            position: range.start as vscode.Position,
            tab: 1
        };
        if(i > 3) {tabPosition.tab = 2;}
        tabpos.push(tabPosition);
    }
    return tabpos;
}