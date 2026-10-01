import {createServer} from 'vite';

// Keep Vite in the test runner's process. Windows subprocess-tree termination
// can leave npm/Vite children alive and prevent Playwright from reporting exit.
export default async function setup(){
 const server=await createServer({logLevel:'error',server:{host:'127.0.0.1',port:5174,strictPort:true}});
 await server.listen();
 return async()=>{await server.close();};
}
