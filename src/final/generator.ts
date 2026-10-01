import { mkdirSync, writeFileSync, rmSync } from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";
import { execFileSync } from "child_process";
import { FinalProject, StructureDef, StructureOperation, StructureSpawnDef } from "./types";

export interface BuildResult { root:string; behaviorPack:string; resourcePack:string; mcaddon:string; }

const ADDON_VERSION:[number,number,number]=[1,0,0];
const BEDROCK_ENGINE:[number,number,number]=[1,26,52];
const SCRIPT_API="2.10.0";
const VERSION_ID="BedrockLang-26.52";

export function generate(project:FinalProject,out="build"):BuildResult{
  const root=resolve(out,project.name);
  rmSync(root,{recursive:true,force:true});
  const bp=resolve(root,"behavior_packs",project.name+"_BP");
  const rp=resolve(root,"resource_packs",project.name+"_RP");
  mkdirSync(bp,{recursive:true}); mkdirSync(rp,{recursive:true});
  const bpUuid=randomUUID(), rpUuid=randomUUID();

  writeJson(resolve(bp,"manifest.json"),{
    format_version:2,
    header:{name:project.name+" Behavior Pack",description:project.description,uuid:bpUuid,version:ADDON_VERSION,min_engine_version:BEDROCK_ENGINE},
    modules:[
      {type:"data",uuid:randomUUID(),version:ADDON_VERSION},
      {type:"script",language:"javascript",uuid:randomUUID(),version:ADDON_VERSION,entry:"scripts/main.js"}
    ],
    dependencies:[{uuid:rpUuid,version:ADDON_VERSION},{module_name:"@minecraft/server",version:SCRIPT_API}]
  });
  writeJson(resolve(rp,"manifest.json"),{
    format_version:2,
    header:{name:project.name+" Resource Pack",description:project.description,uuid:rpUuid,version:ADDON_VERSION,min_engine_version:BEDROCK_ENGINE},
    modules:[{type:"resources",uuid:randomUUID(),version:ADDON_VERSION}]
  });

  writeFile(root,"VERSION-ID.txt",VERSION_ID+"\n");
  writeFile(bp,"VERSION-ID.txt",VERSION_ID+"\n");
  writeFile(rp,"VERSION-ID.txt",VERSION_ID+"\n");
  for(const f of project.behaviorFiles) writeFile(bp,f.path,f.content);
  for(const f of project.resourceFiles) writeFile(rp,f.path,f.content);

  const mainParts=[
    'import { world, system } from "@minecraft/server";',
    project.economy ? 'import "./economy.js";' : "",
    generateCommands(project),
    generateSchedules(project),
    generateStructureSpawns(project),
    ...project.scripts.filter(x=>!x.startsWith("@@PATH:"))
  ].filter(Boolean);
  writeFile(bp,"scripts/main.js",mainParts.join("\n\n")+"\n");

  for(const e of project.scripts.filter(x=>x.startsWith("@@PATH:"))){
    const n=e.indexOf("\n"); writeFile(bp,e.slice(7,n),e.slice(n+1));
  }
  for(const e of project.functions){
    const n=e.indexOf("\n"); writeFile(bp,"functions/"+e.slice(7,n),e.slice(n+1));
  }
  if(project.economy) writeFile(bp,"scripts/economy.js",generateEconomy(project.economy));
  for(const s of project.structures) writeFile(bp,"functions/structures/"+safeName(s.name)+".mcfunction",generateStructure(s));

  const mcaddon=resolve(out,project.name+".mcaddon");
  createMcaddon(mcaddon,[[project.name+"_BP.mcpack",bp],[project.name+"_RP.mcpack",rp]]);
  return {root,behaviorPack:bp,resourcePack:rp,mcaddon};
}

function generateEconomy(e:FinalProject["economy"]):string{
  if(!e) return "";
  const title=JSON.stringify(e.scoreboardTitle);
  return `import { world, system, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, DisplaySlotId, ObjectiveSortOrder } from "@minecraft/server";

const MONEY="tsuna:money";
const SHARDS="tsuna:shards";
const START_MONEY=${e.startingMoney};
const START_SHARDS=${e.startingShards};
const MONEY_OBJECTIVE="tsuna_money";
const SHARDS_OBJECTIVE="tsuna_shards";
let moneyObjective;
let shardsObjective;

function value(v,fallback){ return typeof v === "number" && Number.isFinite(v) ? v : fallback; }
function getMoney(player){ return value(player.getDynamicProperty(MONEY),START_MONEY); }
function getShards(player){ return value(player.getDynamicProperty(SHARDS),START_SHARDS); }
function setMoney(player,v){ player.setDynamicProperty(MONEY,Math.max(0,Math.floor(v))); }
function setShards(player,v){ player.setDynamicProperty(SHARDS,Math.max(0,Math.floor(v))); }
function format(v){ return Math.floor(v).toLocaleString(); }

function ensureObjectives(){
  moneyObjective=world.scoreboard.getObjective(MONEY_OBJECTIVE) ?? world.scoreboard.addObjective(MONEY_OBJECTIVE,"Money");
  shardsObjective=world.scoreboard.getObjective(SHARDS_OBJECTIVE) ?? world.scoreboard.addObjective(SHARDS_OBJECTIVE,"Shards");
  if(${e.scoreboard}){
    try{ world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar,{objective:moneyObjective,sortOrder:ObjectiveSortOrder.Descending}); }catch(_){ }
  }
}

function update(player){
  if(player.getDynamicProperty(MONEY)===undefined) setMoney(player,START_MONEY);
  if(player.getDynamicProperty(SHARDS)===undefined) setShards(player,START_SHARDS);
  try{
    ensureObjectives();
    if(player.scoreboardIdentity){
      moneyObjective.setScore(player.scoreboardIdentity,Math.floor(getMoney(player)));
      shardsObjective.setScore(player.scoreboardIdentity,Math.floor(getShards(player)));
    }
  }catch(error){ console.warn("TsunaEconomy scoreboard: "+error); }
  player.onScreenDisplay.setActionBar(${title}+" + "  |  Money: $" + format(getMoney(player)) + "  |  Shards: ✦" + format(getShards(player)));
}

world.afterEvents.playerSpawn.subscribe(event=>{ if(event.initialSpawn) system.run(()=>update(event.player)); });
system.runInterval(()=>{ for(const player of world.getAllPlayers()) update(player); },20);

system.beforeEvents.startup.subscribe(init=>{
  const registry=init.customCommandRegistry;
  registry.registerCommand({name:"tsuna:money",description:"View your money",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false},origin=>{
    const player=origin.sourceEntity;
    if(!player || player.typeId!=="minecraft:player") return {status:CustomCommandStatus.Failure,message:"Player only."};
    system.run(()=>player.sendMessage("§aMoney: §f$"+format(getMoney(player))));
    return {status:CustomCommandStatus.Success};
  });
  registry.registerCommand({name:"tsuna:balance",description:"View your money and shards",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false},origin=>{
    const player=origin.sourceEntity;
    if(!player || player.typeId!=="minecraft:player") return {status:CustomCommandStatus.Failure,message:"Player only."};
    system.run(()=>player.sendMessage("§aMoney: §f$"+format(getMoney(player))+" §7| §dShards: §f✦"+format(getShards(player))));
    return {status:CustomCommandStatus.Success};
  });
  registry.registerCommand({name:"tsuna:pay",description:"Pay another player",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false,mandatoryParameters:[{type:CustomCommandParamType.PlayerSelector,name:"target"},{type:CustomCommandParamType.Integer,name:"amount"}]},(origin,args)=>{
    const player=origin.sourceEntity;
    if(!player || player.typeId!=="minecraft:player") return {status:CustomCommandStatus.Failure,message:"Player only."};
    const target=Array.isArray(args?.[0]) ? args[0][0] : undefined;
    const amount=Math.floor(Number(args?.[1]));
    system.run(()=>{
      if(!target || target.typeId!=="minecraft:player"){ player.sendMessage("§cPlayer not found."); return; }
      if(!Number.isFinite(amount) || amount<=0){ player.sendMessage("§cAmount must be greater than 0."); return; }
      if(target.id===player.id){ player.sendMessage("§cYou cannot pay yourself."); return; }
      if(getMoney(player)<amount){ player.sendMessage("§cYou do not have enough money."); return; }
      setMoney(player,getMoney(player)-amount); setMoney(target,getMoney(target)+amount);
      update(player); update(target);
      player.sendMessage("§aPaid §f$"+format(amount)+" §ato §f"+target.name+"§a.");
      target.sendMessage("§aReceived §f$"+format(amount)+" §afrom §f"+player.name+"§a.");
    });
    return {status:CustomCommandStatus.Success};
  });
});
`;
}

function generateCommands(p:FinalProject):string{
  if(!p.commands.length) return "// BedrockLang: no additional custom commands";
  const permission={Any:"CommandPermissionLevel.Any",GameDirectors:"CommandPermissionLevel.GameDirectors",Admin:"CommandPermissionLevel.Admin",Host:"CommandPermissionLevel.Host",Owner:"CommandPermissionLevel.Owner"};
  const lines=['system.beforeEvents.startup.subscribe(init=>{','  const registry=init.customCommandRegistry;'];
  for(const c of p.commands){
    const mandatory=c.params.filter(x=>!x.optional).map(x=>`{type:CustomCommandParamType.${x.type},name:${JSON.stringify(x.name)}}`).join(",");
    const optional=c.params.filter(x=>x.optional).map(x=>`{type:CustomCommandParamType.${x.type},name:${JSON.stringify(x.name)}}`).join(",");
    lines.push(`  registry.registerCommand({name:${JSON.stringify(c.name)},description:${JSON.stringify(c.description)},permissionLevel:${permission[c.permission]},cheatsRequired:${c.cheatsRequired}${mandatory?`,mandatoryParameters:[${mandatory}]`:""}${optional?`,optionalParameters:[${optional}]`:""}},(origin,args)=>{`);
    lines.push('    const player=origin.sourceEntity?.typeId==="minecraft:player"?origin.sourceEntity:undefined;');
    for(const b of c.body) lines.push("    "+commandBody(b));
    lines.push('    return {status:CustomCommandStatus.Success};','  });');
  }
  lines.push('});');
  return lines.join("\n");
}
function commandBody(x:string){
  let m=x.match(/^message\s+"([^"]*)"$/); if(m)return `system.run(()=>player?.sendMessage(${JSON.stringify(m[1])}));`;
  m=x.match(/^broadcast\s+"([^"]*)"$/); if(m)return `system.run(()=>world.sendMessage(${JSON.stringify(m[1])}));`;
  m=x.match(/^run\s+"([^"]*)"$/); if(m)return `system.run(()=>player?.runCommand(${JSON.stringify(m[1])}));`;
  m=x.match(/^log\s+"([^"]*)"$/); if(m)return `console.log(${JSON.stringify(m[1])});`;
  return `// Unsupported BedrockLang command body: ${x.replace(/\*/g,"")}`;
}
function generateSchedules(p:FinalProject):string{return p.schedules.map(s=>{const ticks=s.every*(s.unit==="ticks"?1:s.unit==="seconds"?20:1200);return `system.runInterval(()=>{\n${s.body.map(x=>"  "+commandBody(x)).join("\n")}\n},${ticks});`;}).join("\n\n");}
function generateStructureSpawns(p:FinalProject):string{return p.structureSpawns.filter(x=>x.enabled).map(generateStructureSpawn).join("\n\n");}
function generateStructureSpawn(s:StructureSpawnDef){const dims=JSON.stringify(s.dimensions),safe=s.structure.replace(/[^A-Za-z0-9_./-]/g,"_").replace(/^\/+/,"");return `system.runInterval(()=>{\n  if(Math.random()>${s.chance})return;\n  const dimensions=${dims};\n  const dimensionId=dimensions[Math.floor(Math.random()*dimensions.length)];\n  const dimension=world.getDimension(dimensionId);\n  const players=world.getAllPlayers().filter(p=>p.dimension.id===dimensionId);\n  if(!players.length)return;\n  const player=players[Math.floor(Math.random()*players.length)];\n  const angle=Math.random()*Math.PI*2;\n  const distance=${s.minDistance}+Math.random()*(${s.maxDistance}-${s.minDistance});\n  const x=Math.floor(player.location.x+Math.cos(angle)*distance);\n  const z=Math.floor(player.location.z+Math.sin(angle)*distance);\n  const y=Math.floor(player.location.y);\n  try{dimension.runCommand("execute positioned "+x+" "+y+" "+z+" run function structures/${safe}");}catch(_){}\n},${s.intervalTicks});`}
function generateStructure(s:StructureDef){return ["# Generated by BedrockLang "+VERSION_ID,...s.operations.flatMap(operationCommands)].join("\n")+"\n";}
function operationCommands(op:StructureOperation):string[]{switch(op.kind){case"set":return[`setblock ~${n(op.x)} ~${n(op.y)} ~${n(op.z)} ${op.block}`];case"fill":return[`fill ~${n(op.x1)} ~${n(op.y1)} ~${n(op.z1)} ~${n(op.x2)} ~${n(op.y2)} ~${n(op.z2)} ${op.block}${op.mode?" "+op.mode:""}`];case"clear":return[`fill ~${n(op.x1)} ~${n(op.y1)} ~${n(op.z1)} ~${n(op.x2)} ~${n(op.y2)} ~${n(op.z2)} air`];case"box":return[`fill ~${n(op.x1)} ~${n(op.y1)} ~${n(op.z1)} ~${n(op.x2)} ~${n(op.y1)} ~${n(op.z2)} ${op.block}`,`fill ~${n(op.x1)} ~${n(op.y2)} ~${n(op.z1)} ~${n(op.x2)} ~${n(op.y2)} ~${n(op.z2)} ${op.block}`];case"hollow":return[`fill ~${n(op.x1)} ~${n(op.y1)} ~${n(op.z1)} ~${n(op.x2)} ~${n(op.y2)} ~${n(op.z2)} ${op.block}`,`fill ~${n(op.x1+1)} ~${n(op.y1+1)} ~${n(op.z1+1)} ~${n(op.x2-1)} ~${n(op.y2-1)} ~${n(op.z2-1)} ${op.inner??"minecraft:air"}`];case"pillar":return[`fill ~${n(op.x)} ~${n(op.y1)} ~${n(op.z)} ~${n(op.x)} ~${n(op.y2)} ~${n(op.z)} ${op.block}`];case"line":return lineCommands(op);case"sphere":return sphereCommands(op);case"cylinder":return cylinderCommands(op);case"stairs":return stairsCommands(op);}}
function lineCommands(op:Extract<StructureOperation,{kind:"line"}>){const out:string[]=[];const steps=Math.max(Math.abs(op.x2-op.x1),Math.abs(op.y2-op.y1),Math.abs(op.z2-op.z1));for(let i=0;i<=steps;i++){const t=steps?i/steps:0;out.push(`setblock ~${n(Math.round(op.x1+(op.x2-op.x1)*t))} ~${n(Math.round(op.y1+(op.y2-op.y1)*t))} ~${n(Math.round(op.z1+(op.z2-op.z1)*t))} ${op.block}`);}return out;}
function sphereCommands(op:Extract<StructureOperation,{kind:"sphere"}>){const out:string[]=[];for(let y=-op.radius;y<=op.radius;y++)for(let z=-op.radius;z<=op.radius;z++){const dx=Math.sqrt(Math.max(0,op.radius*op.radius-y*y-z*z));out.push(`fill ~${n(op.x-Math.floor(dx))} ~${n(op.y+y)} ~${n(op.z+z)} ~${n(op.x+Math.floor(dx))} ~${n(op.y+y)} ~${n(op.z+z)} ${op.block}`);}return out;}
function cylinderCommands(op:Extract<StructureOperation,{kind:"cylinder"}>){const out:string[]=[];for(let y=0;y<op.height;y++)for(let z=-op.radius;z<=op.radius;z++){const dx=Math.floor(Math.sqrt(Math.max(0,op.radius*op.radius-z*z)));out.push(`fill ~${n(op.x-dx)} ~${n(op.y+y)} ~${n(op.z+z)} ~${n(op.x+dx)} ~${n(op.y+y)} ~${n(op.z+z)} ${op.block}`);}return out;}
function stairsCommands(op:Extract<StructureOperation,{kind:"stairs"}>){const out:string[]=[];for(let i=0;i<op.length;i++){let x=op.x,z=op.z;if(op.direction==="north")z-=i;else if(op.direction==="south")z+=i;else if(op.direction==="east")x+=i;else x-=i;out.push(`setblock ~${n(x)} ~${n(op.y+i)} ~${n(z)} ${op.block}`);}return out;}
function n(v:number){return v>=0?`+${v}`:String(v);}
function safeName(v:string){return v.replace(/[^A-Za-z0-9_./-]/g,"_").replace(/^\/+/,"");}
function writeFile(root:string,path:string,content:string){const full=resolve(root,path);mkdirSync(resolve(full,".."),{recursive:true});writeFileSync(full,content,"utf8");}
function writeJson(path:string,value:unknown){mkdirSync(resolve(path,".."),{recursive:true});writeFileSync(path,JSON.stringify(value,null,2)+"\n","utf8");}
function createMcaddon(path:string,packs:[string,string][]):void{const tmp=resolve(path+".tmp");rmSync(tmp,{recursive:true,force:true});mkdirSync(tmp,{recursive:true});for(const [name,src] of packs){const dir=resolve(tmp,name+".dir");mkdirSync(dir,{recursive:true});execFileSync("cp",["-R",resolve(src)+"/.",dir]);execFileSync("zip",["-qr",resolve(tmp,name),"."],{cwd:dir});rmSync(dir,{recursive:true,force:true});}execFileSync("zip",["-qr",resolve(path),"."],{cwd:tmp});rmSync(tmp,{recursive:true,force:true});}
