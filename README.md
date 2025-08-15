# rollers 📦

Generate OpenGraph images from Typst templates with dynamic data.

## Installation

```bash
npm install rollers
```

## Requirements

You'll need the [Typst](https://typst.app/) binary installed on your system. Install it via:

```bash
# macOS
brew install typst

# Ubuntu/Debian
curl -fsSL https://typst.app/install.sh | sh

# Or download from https://github.com/typst/typst/releases
```

## Quick Start

```typescript
import { generate } from "rollers";

const result = await generate({
  template: `
#set page(width: 1200pt, height: 630pt, fill: rgb("#1e293b"))
#set text(fill: white, font: "Inter", size: 48pt)

#place(center + horizon)[
  #align(center)[
    #text(size: 64pt, weight: "bold")[{{title}}]
    #v(0.5em)
    #text(size: 32pt)[by {{author}}]
  ]
]
  `,
  data: {
    title: "Building Modern Web Apps",
    author: "tasky",
  },
});

if (result.success) {
  console.log("OpenGraph image created at:", result.outputPath);
} else {
  console.error("Generation failed:", result.error);
}
```

## API Reference

### `generate(options)`

Creates an OpenGraph image from a template and returns the result.

**Options:**

- `template` (string): Typst template with `{{variable}}` placeholders
- `data` (object): Values to substitute into template variables
- `outputPath` (string, optional): Where to save the image (creates temp file if not specified)
- `fontPaths` (string[], optional): Additional directories to search for fonts
- `ignoreSystemFonts` (boolean, optional): Skip system fonts when rendering
- `dpi` (number, optional): Output resolution in pixels per inch
- `typstBinaryPath` (string, optional): Custom path to typst binary

**Returns:** Promise resolving to `GenerateResult`

- `success` (boolean): Whether generation succeeded
- `outputPath` (string): Path to generated image (only on success)
- `error` (string): Error message (only on failure)

### `generateBuffer(options)`

Same as `generate()` but returns the image content as a Buffer instead of saving to disk.

**Returns:** Promise resolving to Buffer or null on failure

## Template Variables

Use double curly braces to mark variables in your templates:

```typst
#set page(width: 1200pt, height: 630pt, fill: gradient.linear(..color.map.rainbow))
#set text(fill: white, font: "Inter", size: 36pt, weight: "bold")

#place(center + horizon)[
  #align(center)[
    {{title}}
    #v(0.8em)
    #text(size: 24pt)[Published on {{date}}]
    #v(0.4em)
    #text(size: 20pt)[{{category}}]
  ]
]
```

Variables can be strings, numbers, or booleans. The library will convert them to strings for substitution.

## OpenGraph Image Dimensions

The standard OpenGraph image size is 1200x630 pixels (1.91:1 aspect ratio). This ensures your images look great when shared on social platforms like Twitter, Facebook, and LinkedIn:

```typst
#set page(width: 1200pt, height: 630pt)
```

## Working with Fonts

### Custom Font Paths

```typescript
await generate({
  template: '#set text(font: "My Custom Font")\nHello World',
  data: {},
  fontPaths: ["/path/to/fonts", "./project-fonts"],
});
```

### System Fonts

By default, Typst can access system fonts. To disable this:

```typescript
await generate({
  template: "Content here",
  data: {},
  ignoreSystemFonts: true,
  fontPaths: ["./fonts"], // Must provide custom fonts when ignoring system fonts
});
```

## Advanced Usage

### Custom DPI

Higher DPI creates sharper images but larger file sizes:

```typescript
await generate({
  template: `
    #set page(width: 1200pt, height: 630pt)
    #set text(size: 48pt)
    Sharp OpenGraph image
  `,
  data: {},
  dpi: 300, // Default is usually 144
});
```

### Custom Typst Binary

If typst isn't in your PATH or you want to use a specific version:

```typescript
await generate({
  template: "Content",
  data: {},
  typstBinaryPath: "/usr/local/bin/typst",
});
```

### Error Handling

```typescript
const result = await generate({
  template: "Hello {{missingVar}}",
  data: { name: "World" },
});

if (!result.success) {
  console.error("Failed to generate image:", result.error);
  // Error: Template variable 'missingVar' not found in data
}
```

## Class-based API

For more control, use the `Generator` class directly:

```typescript
import { Generator } from "rollers";

const result = await Generator.generate(options);
const buffer = await Generator.generateBuffer(options);
```

## License

MIT
