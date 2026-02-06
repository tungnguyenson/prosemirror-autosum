# prosemirror-autosum

A ProseMirror plugin that automatically calculates and displays the sum of numeric values found in list items. Designed for lightweight planning and budgeting.

## Features

- **Automatic Calculation**: Sums numbers found in bullet lists, ordered lists, and checklists.
- **Unit Support**: Handles `k` (thousands), `m` (millions), and `tr` (millions - VN locale).
- **Currency aware**: Ignores currency symbols like `$` but preserves them in display if consistent.
- **Read-only Total**: Displays the calculated total as a non-editable decoration at the bottom of the list.
- **Independent Scopes**: Each list is calculated independently; nested lists do not affect the parent's total.
- **Checklist Logic**:
    - If all items are unchecked: Shows total of all items.
    - If mixed: Shows "Checked", "Unchecked", and "Total".

## Installation

```bash
npm install prosemirror-autosum
# or
pnpm add prosemirror-autosum
```

## Usage

Add the plugin to your ProseMirror state:

```typescript
import { autosum } from "prosemirror-autosum";

const state = EditorState.create({
    schema,
    plugins: [
        ...autosum()
        // ... other plugins
    ]
});
```

## Supported Formats

The plugin detects numbers in the following formats:
- **Integers**: `100`, `2500`
- **Decimals**: `1.5`, `2.75`
- **With Units**: `500k` (500,000), `1.5m` (1,500,000)
- **Currency**: `$500`, `$1.5k`

## Example

![Example usage](resources/example.jpg)

Input:
```
- Hotel 1.5m
- Food 800k
```

Output (Visual Decoration):
```
Auto total: 2.3m
```

## Attribution

This package is built on top of [ProseMirror](https://github.com/prosemirror), a robust toolkit for building rich-text editors on the web.
