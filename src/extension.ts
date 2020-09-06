
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { resolveCliPathFromVSCodeExecutablePath } from 'vscode-test';

// This method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dafny-symbols" is now active!');

	context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(
        {language: "dafny"}, new DafnyDocumentSymbolProvider2()
    ));
    console.log('Document symbol provider registered');
}

// This method is called when your extension is deactivated
export function deactivate() {}

//  This function ollects symbols, consts, vars, functions, lemmas
class DafnyDocumentSymbolProvider2 implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(document: vscode.TextDocument,
            token: vscode.CancellationToken): Thenable<vscode.SymbolInformation[]> {
        return new Promise((resolve, reject) => {
            var symbols = [];

            var inComment = false 

            for (var i = 0; i < document.lineCount; i++) {
                //  line number starts at 0
                var line = document.lineAt(i);
                
                //  This var holds the part of a line that is not a comment.
                //  It is refined in the sequel. 
                var nonCommentPart : string = line.text ;

                //  track multi-line comments. 
                //  Assume no nested comments and nothing except comment beg. or end on single line
                let begComment : RegExp = /\/\*/;
                var s = begComment.exec(line.text);
                if ( s != null ) {
                    inComment = true
                }
                let endComment : RegExp = /\*\//;
                var s = endComment.exec(line.text);
                if ( s != null ) {
                    inComment = false;
                }

                //  one-line comment. 
                let singleLineComment : RegExp = /(.*)\/\/.*/;
                var s = singleLineComment.exec(line.text);
                if ( s != null ) {
                    nonCommentPart = s[1];
                }

                if (inComment) {
                    //  current line is part of a comment
                    nonCommentPart = "";
                }
                // find constants
                let constNames : RegExp  = /(?<=(const|var))\s*\b(\w+)\b/;
                var s = constNames.exec(nonCommentPart);
                if (s != null ) {
                    let symbolInfo = new vscode.SymbolInformation(
                        s[0],   // name
                        (s[1]=="const")?vscode.SymbolKind.Constant:vscode.SymbolKind.Variable, // kind
                        "", //   containerName, for display only in the drop down menu, not the outlines
                        new vscode.Location(document.uri, line.range) // location
                    );
                    // console.log(s);
                    symbols.push(symbolInfo)
                };

                //  find function names
                let funNames : RegExp  = /(?<=(function\s+method|method|function|lemma|predicate))\b\s*[{}:,\w\s]*\b([\w]+)\s*(\(|\<)/;
                var s = funNames.exec(nonCommentPart);
                if (s != null ) {
                    let symbolInfo = new vscode.SymbolInformation(
                        s[2],
                        (s[1]=="function" || s[1]== "method")?vscode.SymbolKind.Function:vscode.SymbolKind.Boolean,
                        "",
                        new vscode.Location(document.uri, line.range)
                    )
                    // console.log(s);
                    symbols.push(symbolInfo)
                };

                //  find (data)types names
                let typeNames : RegExp  = /(?<=(type|datatype))\s*\b([\w]+)\s*=/;
                var s = typeNames.exec(nonCommentPart);
                if (s != null ) {
                    // console.log(s);
                    symbols.push({
                        name: s[2],
                        kind: vscode.SymbolKind.Struct,
                        containerName : "",
                        location: new vscode.Location(document.uri, line.range)
                    })
                };

                //  find class  names
                let classNames : RegExp  = /(?<=(class))\s*\b([\w]+)\s*\{/;
                var s = classNames.exec(nonCommentPart);
                if (s != null ) {
                    console.log(s);
                    symbols.push({
                        name: s[2],
                        kind: vscode.SymbolKind.Class,
                        containerName : "",
                        location: new vscode.Location(document.uri, line.range)
                    })
                };
            }
            resolve(symbols);
        });
    }
}

//	Collect symbols
//  This code does not work for some reasons ... it would use the more up to date
//  DocumentSymbol[] compared to SymbolInformation, but does not work.
// https://stackoverflow.com/questions/57011685/symbolinformation-containername-use-for-outline-view-hierarchy
class DafnyDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(document: vscode.TextDocument,
            token: vscode.CancellationToken): Thenable<vscode.DocumentSymbol[]> {
        return new Promise((resolve, reject) => {
            console.log('Computing Symbols');
            var symbols = [];

            for (var i = 0; i < document.lineCount; i++) {
                var line = document.lineAt(i);
                if (line.text.startsWith("@me")) {
                    console.log('Found symbol!');
                    //  create the symbol
                    var k : vscode.DocumentSymbol = {
                        name:  "me", //line.text.substr(1).trimRight(),
						kind: vscode.SymbolKind.Function,
						children: [],
					    range: new vscode.Range(1,1,1,1), //line.range,
					    detail: "1e",
					    selectionRange: new vscode.Range(1,1,1,1) //line.range
                    };

                    console.log(k);
                    symbols.push({
                        name:  "me", //line.text.substr(1).trimRight(),
						kind: vscode.SymbolKind.Function,
						children: [],
					    range: new vscode.Range(1,1,1,1), //line.range,
					    detail: "1e",
					    selectionRange: new vscode.Range(1,1,1,1) //line.range
                    });
                    console.log('Pushed symbol!');
                }
            }
            console.log('Now resolving symbol!');
            resolve(symbols);
        });
    }
}


