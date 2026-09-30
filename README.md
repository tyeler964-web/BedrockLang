# BedrockLang v1.7.2

BedrockLang is a Minecraft Bedrock development language and compiler. v1.7.2 is the first major language-expansion release after the original 1.x foundation.

## Build
```bash
npm install
npm run check
npm run build:addon
```

## 1.7.2 highlights
- 600+ lexer vocabulary/token entries.
- Source-position-aware lexer.
- Custom command declarations.
- Command permissions and cheats flags.
- Typed mandatory and optional command parameters.
- Repeating schedules using ticks, seconds or minutes.
- Expanded event syntax.
- Structured declarations for common Bedrock pack assets.
- Raw triple-quoted JSON/file escape hatches.
- Correct outer .mcaddon packaging with actual .mcpack archives.

## Custom command example
```bdl
command "myaddon:hello" {
    description "Says hello"
    permission Any
    cheats false
    execute {
        message "Hello from BedrockLang!"
    }
}
```

Bedrock custom command names are namespaced. The current Script API provides a custom command registry and typed parameter types. See Microsoft's current custom-command documentation for the API contract.

## Scheduled code
```bdl
every 5 seconds {
    broadcast "The timer fired."
}
```

## Raw Bedrock access
```bdl
item "my_item" """
{
  "format_version":"1.21.50",
  "minecraft:item": {
    "description": { "identifier": "myaddon:my_item" }
  }
}
"""
```

BedrockLang intentionally keeps this escape hatch. A vocabulary entry does not automatically mean the corresponding Bedrock API is fully implemented; unsupported high-level syntax should fail instead of silently generating invalid content.

## Repository structure
```text
src/final/lexer.ts      Lexer and 600+ word vocabulary
src/final/parser.ts     BedrockLang parser
src/final/types.ts      Compiler data model
src/final/generator.ts  Pack and .mcaddon generator
src/final/compiler.ts   Compiler entry
examples/full.bdl       Major-release example
LANGUAGE_1.7.2.md       Language reference
```
