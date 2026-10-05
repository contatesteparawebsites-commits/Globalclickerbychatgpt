const http=require("http");
const fs=require("fs");
const path=require("path");

let total=0;
let connections=new Set();
let lastBroadcast=0;
let pendingBroadcast=false;

function json(res,status,data){
  const body=JSON.stringify(data);
  res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Access-Control-Allow-Origin":"*"});
  res.end(body);
}

function broadcast(){
  const message="data: "+JSON.stringify({total,connections:connections.size})+"\n\n";
  for(const res of connections){try{res.write(message)}catch{}}
}

function scheduleBroadcast(){
  if(pendingBroadcast)return;
  const now=Date.now();
  const wait=Math.max(0,80-(now-lastBroadcast));
  pendingBroadcast=true;
  setTimeout(()=>{pendingBroadcast=false;lastBroadcast=Date.now();broadcast()},wait);
}

function serveFile(res,file){
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404);res.end("Not found");return}
    const ext=path.extname(file);
    const type=ext===".html"?"text/html; charset=utf-8":ext===".js"?"text/javascript; charset=utf-8":"application/octet-stream";
    res.writeHead(200,{"Content-Type":type,"Cache-Control":"no-store"});
    res.end(data);
  });
}

const server=http.createServer((req,res)=>{
  const url=new URL(req.url,"http://localhost");

  if(req.method==="GET"&&url.pathname==="/api/state"){
    return json(res,200,{total,connections:connections.size});
  }

  if(req.method==="GET"&&url.pathname==="/events"){
    res.writeHead(200,{"Content-Type":"text/event-stream; charset=utf-8","Cache-Control":"no-cache, no-transform","Connection":"keep-alive","Access-Control-Allow-Origin":"*"});
    res.write("retry: 1500\n\n");
    connections.add(res);
    res.write("data: "+JSON.stringify({total,connections:connections.size})+"\n\n");
    broadcast();
    req.on("close",()=>{connections.delete(res);broadcast()});
    return;
  }

  if(req.method==="POST"&&url.pathname==="/api/clicks"){
    let body="";
    req.on("data",chunk=>{body+=chunk;if(body.length>10000)req.destroy()});
    req.on("end",()=>{
      try{
        const data=JSON.parse(body||"{}");
        const count=Number(data.count);
        if(!Number.isInteger(count)||count<1||count>10000)return json(res,400,{error:"count must be an integer from 1 to 10000"});
        total+=count;
        json(res,200,{total,count});
        scheduleBroadcast();
      }catch{return json(res,400,{error:"invalid json"})}
    });
    return;
  }

  if(req.method==="GET"&&(url.pathname==="/"||url.pathname==="/index.html"))return serveFile(res,path.join(__dirname,"index.html"));
  if(req.method==="GET"&&url.pathname==="/health")return json(res,200,{ok:true,total,connections:connections.size});
  res.writeHead(404);res.end("Not found");
});

const port=Number(process.env.PORT)||3000;
server.listen(port,"0.0.0.0",()=>console.log("Global Clicker live on port "+port));