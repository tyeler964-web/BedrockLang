export enum TokenType {
    Identifier, String, Number, Boolean,
    LBrace, RBrace, LParen, RParen, LBracket, RBracket, Comma, Colon, Semicolon, Dot, At, Hash,
    Plus, Minus, Star, Slash, Percent, Equal, EqualEqual, NotEqual, Less, LessEqual, Greater, GreaterEqual, AndAnd, OrOr, Bang,

    KeywordProject, KeywordEvent, KeywordPlayer, KeywordJoin, KeywordLeave, KeywordSpawn, KeywordMessage, KeywordCommand, KeywordBroadcast, KeywordRun, KeywordLog,
    KeywordFunction, KeywordReturn, KeywordIf, KeywordElse, KeywordWhile, KeywordFor, KeywordIn, KeywordBreak, KeywordContinue, KeywordSwitch, KeywordCase, KeywordDefault,
    KeywordLet, KeywordConst, KeywordVar, KeywordSet, KeywordGet, KeywordTrue, KeywordFalse, KeywordNull,
    KeywordPlayerJoin, KeywordPlayerLeave, KeywordPlayerSpawn, KeywordPlayerDeath, KeywordPlayerRespawn, KeywordPlayerChat, KeywordPlayerInteract, KeywordPlayerAttack, KeywordPlayerBreak, KeywordPlayerPlace, KeywordPlayerMove, KeywordPlayerSneak, KeywordPlayerSprint,
    KeywordWorld, KeywordDimension, KeywordOverworld, KeywordNether, KeywordEnd, KeywordLocation, KeywordPosition, KeywordTeleport, KeywordWeather, KeywordTime, KeywordDay, KeywordNight, KeywordGameRule, KeywordDifficulty, KeywordSeed,
    KeywordEntity, KeywordEntities, KeywordPlayerSelector, KeywordNearest, KeywordRandom, KeywordSelf, KeywordAll, KeywordTag, KeywordAddTag, KeywordRemoveTag, KeywordKill, KeywordDamage, KeywordHeal, KeywordEffect, KeywordClearEffect, KeywordSummon,
    KeywordItem, KeywordItems, KeywordGive, KeywordTake, KeywordClear, KeywordReplace, KeywordEnchant, KeywordDurability, KeywordComponents, KeywordLore, KeywordName,
    KeywordBlock, KeywordBlocks, KeywordSetBlock, KeywordFill, KeywordClone, KeywordStructure,
    KeywordScore, KeywordScoreboard, KeywordObjective, KeywordTeam, KeywordTeams, KeywordAdd, KeywordRemove, KeywordReset, KeywordGetScore,
    KeywordSound, KeywordMusic, KeywordParticle, KeywordAnimation, KeywordCamera, KeywordTitle, KeywordActionbar, KeywordSubtitle, KeywordBossbar, KeywordToast,
    KeywordUi, KeywordForm, KeywordButton, KeywordLabel, KeywordInput, KeywordDropdown, KeywordSlider, KeywordToggle,
    KeywordItemDefinition, KeywordBlockDefinition, KeywordEntityDefinition, KeywordRecipe, KeywordShaped, KeywordShapeless, KeywordFurnace, KeywordSmithing, KeywordLoot, KeywordLootTable, KeywordFunctionFile, KeywordLanguage, KeywordTexture, KeywordTextures, KeywordSoundFile, KeywordScript, KeywordFile, KeywordBehavior, KeywordResource, KeywordManifest, KeywordNamespace, KeywordIdentifier,
    KeywordSchedule, KeywordEvery, KeywordAfter, KeywordDelay, KeywordTicks, KeywordSeconds, KeywordMinutes, KeywordHours,
    KeywordTry, KeywordCatch, KeywordThrow, KeywordAssert, KeywordImport, KeywordExport, KeywordInclude, KeywordUsing, KeywordFrom, KeywordAs,
    KeywordPermission, KeywordCheats, KeywordDescription, KeywordOptional, KeywordRequired, KeywordEnum, KeywordString, KeywordInteger, KeywordFloat, KeywordBoolean, KeywordLocationType, KeywordPositionType, KeywordPlayerType, KeywordEntityType, KeywordItemType, KeywordBlockType,

    EOF
}