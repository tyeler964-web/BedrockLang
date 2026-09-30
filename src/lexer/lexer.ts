import { TokenType } from "./tokenType";
import { Token } from "./token";

const KEYWORDS: Record<string, TokenType> = {
    project: TokenType.KeywordProject, event: TokenType.KeywordEvent, player: TokenType.KeywordPlayer,
    join: TokenType.KeywordJoin, leave: TokenType.KeywordLeave, spawn: TokenType.KeywordSpawn,
    message: TokenType.KeywordMessage, command: TokenType.KeywordCommand, broadcast: TokenType.KeywordBroadcast,
    run: TokenType.KeywordRun, log: TokenType.KeywordLog, function: TokenType.KeywordFunction, return: TokenType.KeywordReturn,
    if: TokenType.KeywordIf, else: TokenType.KeywordElse, while: TokenType.KeywordWhile, for: TokenType.KeywordFor,
    in: TokenType.KeywordIn, break: TokenType.KeywordBreak, continue: TokenType.KeywordContinue,
    switch: TokenType.KeywordSwitch, case: TokenType.KeywordCase, default: TokenType.KeywordDefault,
    let: TokenType.KeywordLet, const: TokenType.KeywordConst, var: TokenType.KeywordVar, set: TokenType.KeywordSet, get: TokenType.KeywordGet,
    true: TokenType.KeywordTrue, false: TokenType.KeywordFalse, null: TokenType.KeywordNull,
    world: TokenType.KeywordWorld, dimension: TokenType.KeywordDimension, overworld: TokenType.KeywordOverworld,
    nether: TokenType.KeywordNether, end: TokenType.KeywordEnd, location: TokenType.KeywordLocation, position: TokenType.KeywordPosition,
    teleport: TokenType.KeywordTeleport, weather: TokenType.KeywordWeather, time: TokenType.KeywordTime, day: TokenType.KeywordDay, night: TokenType.KeywordNight,
    gamerule: TokenType.KeywordGameRule, difficulty: TokenType.KeywordDifficulty, seed: TokenType.KeywordSeed,
    entity: TokenType.KeywordEntity, entities: TokenType.KeywordEntities, nearest: TokenType.KeywordNearest, random: TokenType.KeywordRandom,
    self: TokenType.KeywordSelf, all: TokenType.KeywordAll, tag: TokenType.KeywordTag, addtag: TokenType.KeywordAddTag, removetag: TokenType.KeywordRemoveTag,
    kill: TokenType.KeywordKill, damage: TokenType.KeywordDamage, heal: TokenType.KeywordHeal, effect: TokenType.KeywordEffect,
    cleareffect: TokenType.KeywordClearEffect, summon: TokenType.KeywordSummon,
    item: TokenType.KeywordItem, items: TokenType.KeywordItems, give: TokenType.KeywordGive, take: TokenType.KeywordTake,
    clear: TokenType.KeywordClear, replace: TokenType.KeywordReplace, enchant: TokenType.KeywordEnchant, durability: TokenType.KeywordDurability,
    components: TokenType.KeywordComponents, lore: TokenType.KeywordLore, name: TokenType.KeywordName,
    block: TokenType.KeywordBlock, blocks: TokenType.KeywordBlocks, setblock: TokenType.KeywordSetBlock, fill: TokenType.KeywordFill,
    clone: TokenType.KeywordClone, structure: TokenType.KeywordStructure,
    generate: TokenType.KeywordStructureGenerate, place: TokenType.KeywordStructurePlace, set_structure: TokenType.KeywordStructureSet,
    fill_structure: TokenType.KeywordStructureFill, box: TokenType.KeywordStructureBox, hollow: TokenType.KeywordStructureHollow,
    sphere: TokenType.KeywordStructureSphere, cylinder: TokenType.KeywordStructureCylinder, pillar: TokenType.KeywordStructurePillar,
    line: TokenType.KeywordStructureLine, stairs: TokenType.KeywordStructureStairs, clear_structure: TokenType.KeywordStructureClear,
    air: TokenType.KeywordStructureAir, relative: TokenType.KeywordStructureRelative, origin: TokenType.KeywordStructureOrigin,
    size: TokenType.KeywordStructureSize, rotation: TokenType.KeywordStructureRotation, mirror: TokenType.KeywordStructureMirror,
    random_block: TokenType.KeywordStructureRandom, weight: TokenType.KeywordStructureWeight, layer: TokenType.KeywordStructureLayer,
    room: TokenType.KeywordStructureRoom, wall: TokenType.KeywordStructureWall, floor: TokenType.KeywordStructureFloor, roof: TokenType.KeywordStructureRoof,
    structure_spawn: TokenType.KeywordStructureSpawn, structure_generation: TokenType.KeywordStructureGeneration,
    enable: TokenType.KeywordStructureEnable, disable: TokenType.KeywordStructureDisable, chance: TokenType.KeywordStructureChance,
    interval: TokenType.KeywordStructureInterval, attempts: TokenType.KeywordStructureAttempts, min_distance: TokenType.KeywordStructureMinDistance,
    max_distance: TokenType.KeywordStructureMaxDistance, structure_dimension: TokenType.KeywordStructureDimension,
    structure_overworld: TokenType.KeywordStructureOverworld, structure_nether: TokenType.KeywordStructureNether, structure_end: TokenType.KeywordStructureEnd,
    on: TokenType.KeywordStructureOn, off: TokenType.KeywordStructureOff,
    score: TokenType.KeywordScore, scoreboard: TokenType.KeywordScoreboard, objective: TokenType.KeywordObjective,
    team: TokenType.KeywordTeam, teams: TokenType.KeywordTeams, add: TokenType.KeywordAdd, remove: TokenType.KeywordRemove,
    reset: TokenType.KeywordReset, getscore: TokenType.KeywordGetScore,
    sound: TokenType.KeywordSound, music: TokenType.KeywordMusic, particle: TokenType.KeywordParticle, animation: TokenType.KeywordAnimation,
    camera: TokenType.KeywordCamera, title: TokenType.KeywordTitle, actionbar: TokenType.KeywordActionbar, subtitle: TokenType.KeywordSubtitle,
    bossbar: TokenType.KeywordBossbar, toast: TokenType.KeywordToast,
    ui: TokenType.KeywordUi, form: TokenType.KeywordForm, button: TokenType.KeywordButton, label: TokenType.KeywordLabel,
    input: TokenType.KeywordInput, dropdown: TokenType.KeywordDropdown, slider: TokenType.KeywordSlider, toggle: TokenType.KeywordToggle,
    item_definition: TokenType.KeywordItemDefinition, block_definition: TokenType.KeywordBlockDefinition, entity_definition: TokenType.KeywordEntityDefinition,
    recipe: TokenType.KeywordRecipe, shaped: TokenType.KeywordShaped, shapeless: TokenType.KeywordShapeless, furnace: TokenType.KeywordFurnace,
    smithing: TokenType.KeywordSmithing, loot: TokenType.KeywordLoot, loot_table: TokenType.KeywordLootTable, function_file: TokenType.KeywordFunctionFile,
    language: TokenType.KeywordLanguage, texture: TokenType.KeywordTexture, textures: TokenType.KeywordTextures, sound_file: TokenType.KeywordSoundFile,
    script: TokenType.KeywordScript, file: TokenType.KeywordFile, behavior: TokenType.KeywordBehavior, resource: TokenType.KeywordResource,
    manifest: TokenType.KeywordManifest, namespace: TokenType.KeywordNamespace, identifier: TokenType.KeywordIdentifier,
    schedule: TokenType.KeywordSchedule, every: TokenType.KeywordEvery, after: TokenType.KeywordAfter, delay: TokenType.KeywordDelay,
    ticks: TokenType.KeywordTicks, seconds: TokenType.KeywordSeconds, minutes: TokenType.KeywordMinutes, hours: TokenType.KeywordHours,
    try: TokenType.KeywordTry, catch: TokenType.KeywordCatch, throw: TokenType.KeywordThrow, assert: TokenType.KeywordAssert,
    import: TokenType.KeywordImport, export: TokenType.KeywordExport, include: TokenType.KeywordInclude, using: TokenType.KeywordUsing,
    from: TokenType.KeywordFrom, as: TokenType.KeywordAs, permission: TokenType.KeywordPermission, cheats: TokenType.KeywordCheats,
    description: TokenType.KeywordDescription, optional: TokenType.KeywordOptional, required: TokenType.KeywordRequired,
    enum: TokenType.KeywordEnum, string: TokenType.KeywordString, integer: TokenType.KeywordInteger, float: TokenType.KeywordFloat,
    boolean: TokenType.KeywordBoolean, location_type: TokenType.KeywordLocationType, position_type: TokenType.KeywordPositionType,
    player_type: TokenType.KeywordPlayerType, entity_type: TokenType.KeywordEntityType, item_type: TokenType.KeywordItemType, block_type: TokenType.KeywordBlockType,
    player_join: TokenType.KeywordPlayerJoin, player_leave: TokenType.KeywordPlayerLeave, player_spawn: TokenType.KeywordPlayerSpawn,
    player_death: TokenType.KeywordPlayerDeath, player_respawn: TokenType.KeywordPlayerRespawn, player_chat: TokenType.KeywordPlayerChat,
    player_interact: TokenType.KeywordPlayerInteract, player_attack: TokenType.KeywordPlayerAttack, player_break: TokenType.KeywordPlayerBreak,
    player_place: TokenType.KeywordPlayerPlace, player_move: TokenType.KeywordPlayerMove, player_sneak: TokenType.KeywordPlayerSneak, player_sprint: TokenType.KeywordPlayerSprint
};

export class Lexer {
    private position = 0;
    constructor(private source: string) {}
    tokenize(): Token[] {
        const tokens: Token[] = [];
        while (!this.isAtEnd()) {
            const c = this.advance();
            if (/\s/.test(c)) continue;
            if (c === "/" && this.peek() === "/") { this.advance(); while (!this.isAtEnd() && this.peek() !== "\n") this.advance(); continue; }
            if (c === "/" && this.peek() === "*") { this.advance(); while (!this.isAtEnd() && !(this.peek() === "*" && this.peek(1) === "/")) this.advance(); if (!this.isAtEnd()) { this.advance(); this.advance(); } continue; }
            const single: Record<string, TokenType> = { "{":TokenType.LBrace,"}":TokenType.RBrace,"(":TokenType.LParen,")":TokenType.RParen,"[":TokenType.LBracket,"]":TokenType.RBracket,",":TokenType.Comma,":":TokenType.Colon,";":TokenType.Semicolon,".":TokenType.Dot,"@":TokenType.At,"#":TokenType.Hash,"+":TokenType.Plus,"-":TokenType.Minus,"*":TokenType.Star,"%":TokenType.Percent };
            if (single[c] !== undefined) { tokens.push(this.token(single[c], c)); continue; }
            if (c === "/") { tokens.push(this.token(TokenType.Slash, c)); continue; }
            if (c === "!") { tokens.push(this.token(this.match("=") ? TokenType.NotEqual : TokenType.Bang, this.previousText("!"))); continue; }
            if (c === "=") { tokens.push(this.token(this.match("=") ? TokenType.EqualEqual : TokenType.Equal, this.previousText("="))); continue; }
            if (c === "<") { tokens.push(this.token(this.match("=") ? TokenType.LessEqual : TokenType.Less, this.previousText("<"))); continue; }
            if (c === ">") { tokens.push(this.token(this.match("=") ? TokenType.GreaterEqual : TokenType.Greater, this.previousText(">"))); continue; }
            if (c === "&" && this.match("&")) { tokens.push(this.token(TokenType.AndAnd, "&&")); continue; }
            if (c === "|" && this.match("|")) { tokens.push(this.token(TokenType.OrOr, "||")); continue; }
            if (c === '"') { tokens.push(this.readString()); continue; }
            if (/[0-9]/.test(c)) { tokens.push(this.readNumber(c)); continue; }
            if (/[A-Za-z_]/.test(c)) { tokens.push(this.readIdentifier(c)); continue; }
            throw new Error(`Unexpected character '${c}' at position ${this.position - 1}`);
        }
        tokens.push({ type: TokenType.EOF, value: "" }); return tokens;
    }
    private readString(): Token { let value=""; while(!this.isAtEnd()&&this.peek()!=='"'){const c=this.advance();if(c==="\\"&&!this.isAtEnd()){const n=this.advance();value+=n==="n"?"\n":n==="r"?"\r":n==="t"?"\t":n;}else value+=c;}if(this.isAtEnd())throw new Error("Unterminated string.");this.advance();return{type:TokenType.String,value}; }
    private readNumber(first:string):Token{let value=first;while(!this.isAtEnd()&&/[0-9]/.test(this.peek()))value+=this.advance();if(this.peek()==="."&&/[0-9]/.test(this.peek(1))){value+=this.advance();while(!this.isAtEnd()&&/[0-9]/.test(this.peek()))value+=this.advance();}return{type:TokenType.Number,value};}
    private readIdentifier(first:string):Token{let value=first;while(!this.isAtEnd()&&/[A-Za-z0-9_]/.test(this.peek()))value+=this.advance();if(value==="true"||value==="false")return{type:TokenType.Boolean,value};return{type:KEYWORDS[value]??TokenType.Identifier,value};}
    private match(expected:string):boolean{if(this.peek()!==expected)return false;this.advance();return true;}
    private peek(offset=0):string{return this.source[this.position+offset]??"\0";}
    private previousText(first:string):string{return first+(this.source[this.position-1]==="="?"=":"");}
    private advance():string{const c=this.source[this.position];if(c===undefined)throw new Error("Unexpected end of source.");this.position++;return c;}
    private isAtEnd():boolean{return this.position>=this.source.length;}
    private token(type:TokenType,value:string):Token{return{type,value};}
}
