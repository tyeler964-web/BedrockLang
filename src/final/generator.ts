import { mkdirSync, writeFileSync, rmSync } from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";
import { execFileSync } from "child_process";
import { FinalProject, StructureDef, StructureOperation, StructureSpawnDef } from "./types";
export interface BuildResult{root:string;behaviorPack:string;resourcePack:string;mcaddon:string;}

const VERSION:[number,number,number]=[1,8,0];
const VERSION_ID="%TempSshot@1,8,0%";

export function generate(project:FinalProject,out="build"):BuildResult{
 const root=resolve(out+"/"+project.name);rmSync(root,{recursive:true,force:true});
 const bp=root+"/behavior_packs/"+project.name+"_BP",rp=root+"/resource_packs/"+project.name+"_RP";mkdirSync(bp,{recursive:true});mkdirSync(rp,{recursive:true});
 const bpUuid=randomUUID(),rpUuid=randomUUID();
 const description=project.description+" | "+VERSION_ID;
 writeJson(bp+"/manifest.json",{format_version:2,header:{name:project.name+" Behavior Pack",description,uuid:bpUuid,version:VERSION,min_engine_version:project.minEngineVersion},modules:[{type:"data",uuid:randomUUID(),version:VERSION},{type:"script",language:"javascript",uuid:randomUUID(),version:VERSION,entry:"scripts/main.js"}],dependencies:[{uuid:rpUuid,version:VERSION},{module_name:"@minecraft/server",version:"2.10.0"}]});
 writeJson(rp+"/manifest.json",{format_version:2,header:{name:project.name+" Resource Pack",description,uuid:rpUuid,version:VERSION,min_engine_version:project.minEngineVersion},modules:[{type:"resources",uuid:randomUUID(),version:VERSION}]});
 writeFile(root,"VERSION-ID.txt",VERSION_ID+"\n");
 writeFile(bp,"VERSION-ID.txt",VERSION_ID+"\n");writeFile(rp,"VERSION-ID.txt",VERSION_ID+"\n");
 for(const f of project.behaviorFiles)writeFile(bp,f.path,f.content); for(const f of project.resourceFiles)writeFile(rp,f.path,f.content);
 const parts=['import { world, system } from "@minecraft/server";', project.economy ? 'import "./economy.js";' : "","",generateCommands(project),generateSchedules(project),generateStructureSpawns(project),...project.scripts.filter(x=>!x.startsWith("@@PATH:"))];
 writeFile(bp,"scripts/main.js",parts.filter(Boolean).join("\n\n")+"\n");
 for(const e of project.scripts.filter(x=>x.startsWith("@@PATH:"))){const n=e.indexOf("\n");writeFile(bp,e.slice(7,n),e.slice(n+1));}
 for(const e of project.functions){const n=e.indexOf("\n");writeFile(bp,"functions/"+e.slice(7,n),e.slice(n+1));}
 if(project.economy)writeFile(bp,"scripts/economy.js",generateEconomy(project.economy));
 for(const s of project.structures)writeFile(bp,"functions/structures/"+safeName(s.name)+".mcfunction",generateStructure(s));
 const mcaddon=resolve(out)+"/"+project.name+".mcaddon";createMcaddon(mcaddon,[[project.name+"_BP.mcpack",bp],[project.name+"_RP.mcpack",rp]]);
 return{root,behaviorPack:bp,resourcePack:rp,mcaddon};
}

function generateEconomy(e:FinalProject["economy"]):string{
 if(!e)return"";
 const esc=(s:string)=>JSON.stringify(s);
 const money=e.startingMoney,shards=e.startingShards;
 return [
  'import { world, system } from "@minecraft/server";',
  '',
  'const MONEY="tsuna:money";',
  'const SHARDS="tsuna:shards";',
  'const START_MONEY='+String(money)+';',
  'const START_SHARDS='+String(shards)+';',
  '',
  'function num(v, fallback=0){ return typeof v==="number" && Number.isFinite(v) ? v : fallback; }',
  'function getMoney(p){ return num(p.getDynamicProperty(MONEY), START_MONEY); }',
  'function getShards(p){ return num(p.getDynamicProperty(SHARDS), START_SHARDS); }',
  'function setMoney(p,v){ p.setDynamicProperty(MONEY, Math.max(0, Math.floor(v))); }',
  'function setShards(p,v){ p.setDynamicProperty(SHARDS, Math.max(0, Math.floor(v))); }',
  'function format(v){ return Math.floor(v).toLocaleString(); }',
  '',
  'function updateHud(p){',
  '  p.onScreenDisplay.setActionBar('+esc(e.scoreboardTitle)+' + "  |  Money: $" + format(getMoney(p)) + "  |  Shards: ✦" + format(getShards(p)));',
  '}',
  '',
  'world.afterEvents.playerSpawn.subscribe(ev=>{',
  '  if(!ev.initialSpawn)return;',
  '  const p=ev.player;',
  '  if(p.getDynamicProperty(MONEY)===undefined)setMoney(p,START_MONEY);',
  '  if(p.getDynamicProperty(SHARDS)===undefined)setShards(p,START_SHARDS);',
  '  updateHud(p);',
  '});',
  '',
  'system.runInterval(()=>{ for(const p of world.getAllPlayers()) updateHud(p); },20);',
  '',
  'world.afterEvents.playerLeave.subscribe(()=>{});',
  '',
  'world.afterEvents.worldLoad?.subscribe?.(()=>{});',
  '',
  'system.beforeEvents.startup.subscribe(init=>{',
  '  const r=init.customCommandRegistry;',
  '  r.registerCommand({name:"tsuna:money",description:"View your money",permissionLevel:0,cheatsRequired:false},(origin)=>{',
  '    const p=origin.sourceEntity; if(!p||p.typeId!=="minecraft:player")return {status:0};',
  '    p.sendMessage("§aMoney: §f$"+format(getMoney(p))); return {status:0};',
  '  });',
  '  r.registerCommand({name:"tsuna:balance",description:"View your money and shards",permissionLevel:0,cheatsRequired:false},(origin)=>{',
  '    const p=origin.sourceEntity; if(!p||p.typeId!=="minecraft:player")return {status:0};',
  '    p.sendMessage("§aMoney: §f$"+format(getMoney(p))+" §7| §dShards: §f✦"+format(getShards(p))); return {status:0};',
  '  });',
  '  r.registerCommand({name:"tsuna:pay",description:"Pay another player",permissionLevel:0,cheatsRequired:false,mandatoryParameters:[{type:"PlayerSelector",name:"target"},{type:"Integer",name:"amount"}]},(origin,args)=>{',
  '    const p=origin.sourceEntity; if(!p||p.typeId!=="minecraft:player")return {status:0};',
  '    const targets=args.target; const amount=Math.floor(Number(args.amount));',
  '    const target=Array.isArray(targets)?targets[0]:targets;',
  '    if(!target||target.typeId!=="minecraft:player"){p.sendMessage("§cPlayer not found.");return {status:0};}',
  '    if(!Number.isFinite(amount)||amount<=0){p.sendMessage("§cAmount must be greater than 0.");return {status:0};}',
  '    if(getMoney(p)<amount){p.sendMessage("§cYou do not have enough money.");return {status:0};}',
  '    if(target.id===p.id){p.sendMessage("§cYou cannot pay yourself.");return {status:0};}',
  '    setMoney(p,getMoney(p)-amount); setMoney(target,getMoney(target)+amount);',
  '    p.sendMessage("§aPaid §f$"+format(amount)+" §ato §f"+target.name+"§a.");',
  '    target.sendMessage("§aReceived §f$"+format(amount)+" §afrom §f"+p.name+"§a."); return {status:0};',
  '  });',
  '});',
  ''
 ].join("\n");
}

function generateCommands(p:FinalProject){if(!p.commands.length)return"// No custom BedrockLang commands";const lines=["system.beforeEvents.startup.subscribe((init) => {","    const registry = init.customCommandRegistry;"];for(const c of p.commands){const mandatory=c.params.filter(x=>!x.optional).map(x=>"{ type: "+JSON.stringify(x.type)+", name: "+JSON.stringify(x.name)+" }").join(",");const optional=c.params.filter(x=>x.optional).map(x=>"{ type: "+JSON.stringify(x.type)+", name: "+JSON.stringify(x.name)+" }").join(",");let header="    registry.registerCommand({ name: "+JSON.stringify(c.name)+", description: "+JSON.stringify(c.description)+", permissionLevel: "+JSON.stringify({Any:0,GameDirectors:1,Admin:2,Host:3,Owner:4}[c.permission])+", cheatsRequired: "+String(c.cheatsRequired);if(mandatory)header+=", mandatoryParameters: ["+mandatory+"]";if(optional)header+=", optionalParameters: ["+optional+"]";header+=" }, (origin, args) => {";lines.push(header);lines.push('        const player = origin.sourceEntity?.typeId === "minecraft:player" ? origin.sourceEntity : undefined;');for(const b of c.body)lines.push("        "+commandBody(b));lines.push('        return { status: 0 };',"    });");}lines.push("});");return lines.join("\n");}
function commandBody(x:string){let m=x.match(/^message\s+"([^"]*)"$/);if(m)return"player?.sendMessage("+JSON.stringify(m[1])+");";m=x.match(/^broadcast(?:\s*\()\s*"([^"]*)"\)?$/);if(m)return"world.sendMessage("+JSON.stringify(m[1])+ ");";m=x.match(/^run\s+"([^"]*)"$/);if(m)return"system.run(()=>player?.runCommand("+JSON.stringify(m[1])+"));";m=x.match(/^log\s+"([^"]*)"$/);if(m)return"console.log("+JSON.stringify(m[1])+ ");";return"// Unsupported command body: "+x.replace(/\*/g,"");}
function generateSchedules(p:FinalProject){return p.schedules.map(s=>{const ticks=s.every*(s.unit==="ticks"?1:s.unit==="seconds"?20:1200);const body=s.body.map(commandBody).join("\n    ");return"system.runInterval(()=>{\n    "+body+"\n}, "+ticks+");";}).join("\n\n");}

function generateStructureSpawns(p:FinalProject){return p.structureSpawns.filter(s=>s.enabled).map(s=>generateStructureSpawn(s)).join("\n\n");}
function generateStructureSpawn(s:StructureSpawnDef){
 const dims=JSON.stringify(s.dimensions);
 const safe=s.structure.replace(/[^A-Za-z0-9_./-]/g,"_").replace(/^\/+/,"");
 return `system.runInterval(() => {\n    if (Math.random() > ${s.chance}) return;\n    const dimensions = ${dims};\n    const dimensionId = dimensions[Math.floor(Math.random() * dimensions.length)];\n    const dimension = world.getDimension(dimensionId);\n    const players = world.getAllPlayers().filter(p => p.dimension.id === dimensionId);\n    if (!players.length) return;\n    for (let attempt = 0; attempt < ${s.attempts}; attempt++) {\n        const player = players[Math.floor(Math.random() * players.length)];\n        const angle = Math.random() * Math.PI * 2;\n        const distance = ${s.minDistance} + Math.random() * (${s.maxDistance} - ${s.minDistance});\n        const x = Math.floor(player.location.x + Math.cos(angle) * distance);\n        const z = Math.floor(player.location.z + Math.sin(angle) * distance);\n        const y = Math.floor(player.location.y);\n        try {\n            dimension.runCommand(\"execute positioned \" + x + \" \" + y + \" \" + z + \" run function structures/${safe}\");\n            break;\n        } catch (_) {\n            // Try another random location.\n        }\n    }\n}, ${s.intervalTicks});\n// ${VERSION_ID} structure generation: ${s.structure}`;
}

function generateStructure(s:StructureDef):string{const out:string[]=["# Generated by BedrockLang "+VERSION_ID,`# Structure: ${s.name}`];for(const op of s.operations)out.push(...operationCommands(op));return out.join("\n")+"\n";}
function operationCommands(op:StructureOperation):string[]{switch(op.kind){case"set":return[`setblock ~${n(op.x)} ~${n(op.y)} ~${n(op.z)} ${op.block}`];case"fill":return[`fill ~${n(op.x1)} ~${n(op.y1)} ~${n(op.z1)} ~${n(op.x2)} ~${n(op.y2)} ~${n(op.z2)} ${op.block}${op.mode?" "+op.mode:""}`];case"clear":return[`fill ~${n(op.x1)} ~${n(op.y1)} ~${n(op.z1)} ~${n(op.x2)} ~${n(op.y2)} ~${n(op.z2)} air`];case"box":return boxCommands(op.block,op.x1,op.y1,op.z1,op.x2,op.y2,op.z2);case"hollow":return[`fill ~${n(op.x1)} ~${n(op.y1)} ~${n(op.z1)} ~${n(op.x2)} ~${n(op.y2)} ~${n(op.z2)} ${op.block}`,`fill ~${n(op.x1+1)} ~${n(op.y1+1)} ~${n(op.z1+1)} ~${n(op.x2-1)} ~${n(op.y2-1)} ~${n(op.z2-1)} ${op.inner??"minecraft:air"}`];case"pillar":return[`fill ~${n(op.x)} ~${n(op.y1)} ~${n(op.z)} ~${n(op.x)} ~${n(op.y2)} ~${n(op.z)} ${op.block}`];case"line":return lineCommands(op);case"sphere":return sphereCommands(op);case"cylinder":return cylinderCommands(op);case"stairs":return stairsCommands(op);}}
function boxCommands(block:string,x1:number,y1:number,z1:number,x2:number,y2:number,z2:number){return[`fill ~${n(x1)} ~${n(y1)} ~${n(z1)} ~${n(x2)} ~${n(y1)} ~${n(z2)} ${block}`,`fill ~${n(x1)} ~${n(y2)} ~${n(z1)} ~${n(x2)} ~${n(y2)} ~${n(z2)} ${block}`,`fill ~${n(x1)} ~${n(y1+1)} ~${n(z1)} ~${n(x1)} ~${n(y2-1)} ~${n(z2)} ${block}`,`fill ~${n(x2)} ~${n(y1+1)} ~${n(z1)} ~${n(x2)} ~${n(y2-1)} ~${n(z2)} ${block}`,`fill ~${n(x1+1)} ~${n(y1+1)} ~${n(z1)} ~${n(x2-1)} ~${n(y2-1)} ~${n(z1)} ${block}`,`fill ~${n(x1+1)} ~${n(y1+1)} ~${n(z2)} ~${n(x2-1)} ~${n(y2-1)} ~${n(z2)} ${block}`];}
function sphereCommands(op:Extract<StructureOperation,{kind:"sphere"}>){const out:string[]=[];const r=op.radius;for(let y=-r;y<=r;y++){for(let z=-r;z<=r;z++){const dx=Math.sqrt(Math.max(0,r*r-y*y-z*z));const min=Math.ceil(-dx),max=Math.floor(dx);if(op.hollow){const near=Math.abs(Math.sqrt(y*y+z*z)-r)<=1||Math.abs(y)===r;if(!near)continue;}out.push(`fill ~${n(op.x+min)} ~${n(op.y+y)} ~${n(op.z+z)} ~${n(op.x+max)} ~${n(op.y+y)} ~${n(op.z+z)} ${op.block}`);}}return out;}
function cylinderCommands(op:Extract<StructureOperation,{kind:"cylinder"}>){const out:string[]=[];const r=op.radius;for(let y=0;y<op.height;y++){for(let z=-r;z<=r;z++){const dx=Math.floor(Math.sqrt(Math.max(0,r*r-z*z)));out.push(`fill ~${n(op.x-dx)} ~${n(op.y+y)} ~${n(op.z+z)} ~${n(op.x+dx)} ~${n(op.y+y)} ~${n(op.z+z)} ${op.block}`);}}return out;}
function lineCommands(op:Extract<StructureOperation,{kind:"line"}>){const out:string[]=[];const dx=op.x2-op.x1,dy=op.y2-op.y1,dz=op.z2-op.z1;const steps=Math.max(Math.abs(dx),Math.abs(dy),Math.abs(dz));for(let i=0;i<=steps;i++){const t=steps===0?0:i/steps;out.push(`setblock ~${n(Math.round(op.x1+dx*t))} ~${n(Math.round(op.y1+dy*t))} ~${n(Math.round(op.z1+dz*t))} ${op.block}`);}return out;}
function stairsCommands(op:Extract<StructureOperation,{kind:"stairs"}>){const out:string[]=[];for(let i=0;i<op.length;i++){let x=op.x,y=op.y+i,z=op.z;if(op.direction==="north")z-=i;else if(op.direction==="south")z+=i;else if(op.direction==="east")x+=i;else x-=i;out.push(`setblock ~${n(x)} ~${n(y)} ~${n(z)} ${op.block}`);}return out;}
function n(v:number){return v>=0?`+${v}`:String(v);}
function safeName(name:string){return name.replace(/[^A-Za-z0-9_./-]/g,"_").replace(/^\/+/,"");}
function writeFile(root:string,path:string,content:string){const full=root+"/"+path.replace(/^\/+/,"");mkdirSync(full.slice(0,full.lastIndexOf("/")),{recursive:true});writeFileSync(full,content,"utf8");}
function writeJson(path:string,value:unknown){mkdirSync(path.slice(0,path.lastIndexOf("/")),{recursive:true});writeFileSync(path,JSON.stringify(value,null,2)+"\n","utf8");}
function createMcaddon(path:string,packs:[string,string][]):void{const tmp=resolve(path+".tmp"),output=resolve(path);rmSync(tmp,{recursive:true,force:true});mkdirSync(tmp,{recursive:true});for(const pair of packs){const name=pair[0],folder=pair[1],packZip=tmp+"/"+name,packDir=tmp+"/"+name+".dir";mkdirSync(packDir,{recursive:true});execFileSync("cp",["-R",resolve(folder)+"/.",packDir]);execFileSync("zip",["-qr",packZip,"."],{cwd:packDir});rmSync(packDir,{recursive:true,force:true});}execFileSync("zip",["-qr",output,"."],{cwd:tmp});rmSync(tmp,{recursive:true,force:true});}
