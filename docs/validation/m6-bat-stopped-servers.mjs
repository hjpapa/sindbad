import net from 'node:net';
import {writeFileSync} from 'node:fs';
const ports=await Promise.all([5174,5175,9323].map(port=>new Promise(resolve=>{
    const socket=net.createConnection({host:'127.0.0.1',port});
    const finish=result=>{socket.destroy();resolve({port,...result});};
    socket.setTimeout(1500);
    socket.once('connect',()=>finish({state:'open'}));
    socket.once('error',error=>finish({state:error.code==='ECONNREFUSED'?'closed':'unverified',code:error.code}));
    socket.once('timeout',()=>finish({state:'unverified',code:'timeout'}));
})));
const report={date:new Date().toISOString(),method:'Node TCP loopback probes after stopping owned dev/test/report servers',ports};
writeFileSync('docs/validation/m6-bat-stopped-servers.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
if(ports.some(result=>result.state!=='closed'))process.exitCode=1;
