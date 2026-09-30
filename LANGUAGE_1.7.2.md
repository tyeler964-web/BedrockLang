# BedrockLang 1.7.2

## Major release
Version 1.7.2 expands the language foundation with a real lexer, a 600+ word token vocabulary, custom commands, typed command parameters, schedules, event syntax, and the existing raw Bedrock escape hatch.

## Custom commands

```bdl
command "myaddon:hello" {
    description "Says hello"
    permission Any
    cheats false
    execute {
        message "Hello!"
    }
}
```

Custom command names are namespaced. The current Bedrock Script API exposes a custom command registry and typed parameter kinds including Boolean, Integer, Float, String, Location, PlayerSelector, EntitySelector, ItemType, BlockType, EntityType and Enum.

## Parameters

```bdl
command "myaddon:give" {
    description "Give an item"
    permission GameDirectors
    cheats false
    param item item required
    param integer amount optional
    execute {
        message "Command executed."
    }
}
```

## Schedules

```bdl
every 10 seconds {
    broadcast "Ten seconds passed."
}
```

Supported schedule units are ticks, seconds and minutes.

## Events

Existing player events remain supported:

```bdl
event player.join {
    player.message("Welcome!")
}

event player.leave {
    broadcast("Goodbye!")
}
```

## Raw escape hatch

High-level BedrockLang syntax will continue to grow. Until a feature receives a dedicated high-level form, use triple-quoted JSON or a file declaration. This prevents unsupported syntax from being silently accepted.

## Token vocabulary

The 1.7.2 lexer exposes more than 600 vocabulary entries covering project structure, control flow, data, Minecraft systems, UI, server operations, events, math, types and future feature slots. Vocabulary entries are not automatically equivalent to fully implemented APIs; the parser only accepts constructs that have compiler support.

## Build

```bash
npm install
npm run check
npm run build:addon
```
