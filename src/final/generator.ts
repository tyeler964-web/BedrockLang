import { mkdirSync, writeFileSync, rmSync } from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";
import { execFileSync } from "child_process";
import { FinalProject } from "./types";
export interface BuildResult{root:string;behaviorPack:string;resourcePack:string;mcaddon:string;}
export function generate(project:FinalProject,out="build"):BuildResult{
 const root=resolve(out+"/"+project.name);rmSync(root,{recursive:true,force:true});
 const bp=root+"/behavior_packs/"+project.name+"_BP",rp=root+"/resource_packs/"+project.name+"_RP";mkdirSync(bp,{recursive:true});mkdirSync(rp,{recursive:true});
 const bpUuid=randomUUID(),rpUuid=randomUUID();
 writeJson(bp+"/manifest.json",{format_version:2,header:{name:project.name+" Behavior Pack",description:project.description,uuid:bpUuid,version:[1,7,2],min_engine_version:project.minEngineVersion},modules:[{type:"data",uuid:randomUUID(),version:[1,7,2]},{type:"script",language:"javascript",uuid:randomUUID(),version:[1,7,2],entry:"scripts/main.js"}],dependencies:[{uuid:rpUuid,version:[1,7,2]},{module_name:"@minecraft/server",version:"2.10.0"}]});
 writeJson(rp+"/manifest.json",{format_version:2,header:{name:project.name+" Resource Pack",description:project.description,uuid:rpUuid,version:[1,7,2],min_engine_version:project.minEngineVersion},modules:[{type:"resources",uuid:randomUUID(),version:[1,7,2]}]});
 for(const f of project.behaviorFiles)writeFile(bp,f.path,f.content); for(const f of project.resourceFiles)writeFile(rp,f.path,f.content);
 const parts=['import { world, system } from "@minecraft/server";',"",generateCommands(project),generateSchedules(project),...project.scripts.filter(x=>!x.startsWith("@@PATH:"))];
 writeFile(bp,"scripts/main.js",parts.filter(Boolean).join("\n\n")+"\n");
 for(const e of project.scripts.filter(x=>x.startsWith("@@PATH:"))){const n=e.indexOf("\n");writeFile(bp,e.slice(7,n),e.slice(n+1));}
 for(const e of project.functions){const n=e.indexOf("\n");writeFile(bp,"functions/"+e.slice(7,n),e.slice(n+1));}
 const mcaddon=resolve(out)+"/"+project.name+".mcaddon";createMcaddon(mcaddon,[[project.name+"_BP.mcpack",bp],[project.name+"_RP.mcpack",rp]]);
 return{root,behaviorPack:bp,resourcePack:rp,mcaddon};
}
function generateCommands(p:FinalProject){
 if(!p.commands.length)return"// No custom BedrockLang commands";
 const lines=["system.beforeEvents.startup.subscribe((init) => {","    const registry = init.customCommandRegistry;"];
 for(const c of p.commands){
   const mandatory=c.params.filter(x=>!x.optional).map(x=>"{ type: "+JSON.stringify(x.type)+", name: "+JSON.stringify(x.name)+" }").join(",");
   const optional=c.params.filter(x=>x.optional).map(x=>"{ type: "+JSON.stringify(x.type)+", name: "+JSON.stringify(x.name)+" }").join(",");
   let header="    registry.registerCommand({ name: "+JSON.stringify(c.name)+", description: "+JSON.stringify(c.description)+", permissionLevel: "+JSON.stringify(c.permission)+", cheatsRequired: "+String(c.cheatsRequired);
   if(mandatory)header+=", mandatoryParameters: ["+mandatory+"]"; if(optional)header+=", optionalParameters: ["+optional+"]"; header+=" }, (origin, args) => {"; lines.push(header);
   lines.push('        const player = origin.sourceEntity?.typeId === "minecraft:player" ? origin.sourceEntity : undefined;');
   for(const b of c.body)lines.push("        "+commandBody(b));
   lines.push('        return { status: "success" };',"    });");
 } lines.push("});"); return lines.join("\n");
}
function commandBody(x:string){let m=x.match(/^message\\s+"([^"]*)"$/);if(m)return"player?.sendMessage("+JSON.stringify(m[1])+");";m=x.match(/^broadcast(?:\\s*\\()\\s*"([^"]*)"\\)?$/);if(m)return"world.sendMessage("+JSON.stringify(m[1])+");";m=x.match(/^run\\s+"([^"]*)"$/);if(m)return"system.run(()=>player?.runCommand("+JSON.stringify(m[1])+"));";m=x.match(/^log\\s+"([^"]*)"$/);if(m)return"console.log("+JSON.stringify(m[1])+");";return"// Unsupported command body: "+x.replace(/\\*/g,"");}
function generateSchedules(p:FinalProject){return p.schedules.map(s=>{const ticks=s.every*(s.unit==="ticks"?1:s.unit==="seconds"?20:1200);const body=s.body.map(commandBody).join("\n    ");return"system.runInterval(()=>{\n    "+body+"\n}, "+ticks+");";}).join("\n\n");}
function writeFile(root:string,path:string,content:string){const full=root+"/"+path.replace(/^\\/+/, "");mkdirSync(full.slice(0,full.lastIndexOf("/")),{recursive:true});writeFileSync(full,content,"utf8");}
function writeJson(path:string,value:unknown){mkdirSync(path.slice(0,path.lastIndexOf("/")),{recursive:true});writeFileSync(path,JSON.stringify(value,null,2)+"\n","utf8");}
function createMcaddon(path:string,packs:[string,string][]):void{const tmp=resolve(path+".tmp"),output=resolve(path);rmSync(tmp,{recursive:true,force:true});mkdirSync(tmp,{recursive:true});for(const pair of packs){const name=pair[0],folder=pair[1],packZip=tmp+"/"+name,packDir=tmp+"/"+name+".dir";mkdirSync(packDir,{recursive:true});execFileSync("cp",["-R",resolve(folder)+"/.",packDir]);execFileSync("zip",["-qr",packZip,"."],{cwd:packDir});rmSync(packDir,{recursive:true,force:true});}execFileSync("zip",["-qr",output,"."],{cwd:tmp});rmSync(tmp,{recursive:true,force:true});}
