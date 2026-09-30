# BedrockLang Custom Structures

## Version

This guide describes the `%TempSshot@1,8,0%` structure-generation system.

## 1. Define a structure

Create a `structure` block. Coordinates are relative to the location where the generated function is executed.

```bdl
structure "demo_tower" {
    fill "minecraft:stone" 0 0 0 10 0 10
    box "minecraft:stone_bricks" 0 1 0 10 10 10
    hollow "minecraft:stone" 1 1 1 9 9 9 "minecraft:air"
    pillar "minecraft:oak_log" 1 1 1 9
    pillar "minecraft:oak_log" 9 1 1 9
    sphere "minecraft:glowstone" 5 12 5 2
}
```

## 2. Available structure operations

### `set`

Places one block.

```bdl
set "minecraft:diamond_block" 0 5 0
```

### `fill`

Fills a rectangular region.

```bdl
fill "minecraft:stone" 0 0 0 10 5 10
```

Optional modes are `replace`, `destroy`, `keep`, `hollow`, and `outline`.

### `box`

Creates the outside shell of a rectangular box.

```bdl
box "minecraft:stone_bricks" 0 0 0 10 10 10
```

### `hollow`

Creates a filled outer box and clears its inside.

```bdl
hollow "minecraft:stone" 0 0 0 10 10 10 "minecraft:air"
```

### `sphere`

Creates a sphere around the supplied relative center.

```bdl
sphere "minecraft:glass" 5 5 5 4
```

Add `hollow` to make a shell.

### `cylinder`

Creates a vertical cylinder.

```bdl
cylinder "minecraft:stone" 5 0 5 4 10
```

### `pillar`

Creates a vertical column.

```bdl
pillar "minecraft:oak_log" 0 0 0 10
```

### `line`

Draws a block line between two relative coordinates.

```bdl
line "minecraft:gold_block" 0 0 0 10 5 10
```

### `stairs`

Creates a simple ascending staircase.

```bdl
stairs "minecraft:stone" 0 0 0 8 north
```

Directions are `north`, `south`, `east`, and `west`.

### `clear`

Clears a rectangular region with air.

```bdl
clear 1 1 1 9 9 9
```

## 3. Enable random world generation

A structure can be configured to spawn automatically with `structure_generation`.

```bdl
structure_generation "demo_tower" {
    enabled true
    interval 6000 ticks
    chance 0.15
    attempts 8
    min_distance 32
    max_distance 128
    dimension overworld
}
```

The structure name must match a previously defined `structure` block.

## 4. Generation settings

| Setting | Meaning |
|---|---|
| `enabled` | Enables automatic generation. |
| `enable` | Shortcut for `enabled true`. |
| `disable` | Shortcut for `enabled false`. |
| `interval` | Number of ticks between generation attempts. `seconds` and `minutes` are also supported. |
| `chance` | Probability from `0.0` to `1.0` for each interval. |
| `attempts` | Number of random locations attempted during a generation cycle. |
| `min_distance` | Minimum random distance from the selected player. |
| `max_distance` | Maximum random distance from the selected player. |
| `dimension` | Selects one dimension: `overworld`, `nether`, or `end`. |
| `dimensions` | Allows a comma-separated list of dimensions. |

## 5. Multiple dimensions

```bdl
structure_generation "demo_tower" {
    enabled true
    interval 12000 ticks
    chance 0.05
    attempts 12
    min_distance 64
    max_distance 256
    dimensions overworld,nether
}
```

## 6. Disable a structure

```bdl
structure_generation "demo_tower" {
    disable
}
```

## 7. What the generator produces

BedrockLang generates a function such as:

```text
functions/structures/demo_tower.mcfunction
```

The generated script can also periodically choose a random location around an online player and execute that structure function.

## 8. Important limitation

The `%TempSshot@1,8,0%` implementation is procedural script-based generation. It behaves like random world structure spawning from the player's point of view, but it is not yet a native Bedrock terrain-feature/feature-rule generator. The structure is selected during runtime and placed through commands.

This means generation requires an online player in the selected dimension and does not create structures in completely unloaded areas. A future BedrockLang version can add native feature-rule/structure-template generation when the required Bedrock APIs and formats are implemented.
