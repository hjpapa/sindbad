import ts from 'typescript';
import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const printer=ts.createPrinter({newLine:ts.NewLineKind.LineFeed});
function format(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())format(path);else if(path.endsWith('.ts')){const source=ts.createSourceFile(path,readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true);writeFileSync(path,printer.printFile(source));}}}
for(const dir of ['src','scripts','tests'])format(dir);
