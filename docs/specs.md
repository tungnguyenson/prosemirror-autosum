# Auto-Calculation Handling — v1 Specification & Test Cases

This document defines the behavior, scope, and test cases for automatically calculating
numeric values inside list-based content in a ProseMirror-based editor.

The feature is designed for lightweight planning and note-taking, not spreadsheet-level computation.

---

## 1. Scope & Principles

- Numeric values embedded in list items can be automatically summed.
- The feature supports:
  - Bullet lists
  - Numbered lists
  - Checklist items
- Calculations are **derived UI only** and MUST NOT modify document content.
- The editor remains text-first; users never “enter a formula”.
- Auto-calculation must not interfere with normal typing or editing.
- Results are always treated as **estimates**, not authoritative data.

---

## 2. Supported List Types

Auto-calculation applies to the following list item types:

- Bullet list items
- Ordered (numbered) list items
- Task / checklist items

Each list is evaluated independently.

---

## 3. Numeric Value Definition

### 3.1 Supported Numeric Formats

A numeric value is detected if it matches one of the following patterns:

- Integer values  
  - `100`
  - `2500`

- Decimal values  
  - `1.5`
  - `2.75`

- Unit-suffixed values (case-insensitive)  
  - `500k`
  - `1.5m`
  - `2tr`

- Currency-prefixed values  
  - `$500`
  - `$1.5k`

Currency symbols are ignored for calculation but may affect display.

---

### 3.2 Unit Normalization

#### Global Conventions
The following unit suffixes are supported globally:

| Unit | Meaning | Multiplier |
|----|----|----|
| `k` | thousand | × 1,000 |
| `m` | million | × 1,000,000 |

Examples:
- `500k` → `500,000`
- `1.5m` → `1,500,000`

#### Local Conventions (Vietnam)

The following local unit is additionally supported:

| Unit | Meaning | Multiplier |
|----|----|----|
| `tr` | million (triệu) | × 1,000,000 |

Examples:
- `2tr` → `2,000,000`
- `1.2tr` → `1,200,000`

#### Display Unit Derivation

- The **display unit of the total** is derived from the **first numeric item in the list**
- All subsequent values are normalized internally but rendered using that unit

Example:
```
- Hotel 500k
- Food 1.2m
```

Result:
- Internal total = `1,700,000`
- Displayed total = `1,700k`

---

## 4. Inclusion Rules

### 4.1 Checklist Items

- When none of items are checked, show only total
- When some of items are checked, show 3 totals of all checklist items, checked total, unchecked total and all total

Example:
```
- [x] Balo 500k
- [ ] Tent 1.2m
```

Result:
- Total: `1700k`. Checked: `500k`. Unchecked: `1200k`

---

### 4.2 Bullet & Numbered Lists

- All list items are included by default
- There is no enable/disable state

Example:
```
- Hotel 1.5m
- Food 800k
```

Result:
- Total = `2.3m`

---

## 5. Grouping & Calculation Scope

### 5.1 List-Based Grouping

- Each list is calculated independently
- Nested lists are calculated separately from their parent list

Example:
```
- Trip
  - Hotel 1.5m
  - Food 800k
```

Results:
- Inner list total = `2.3m`
- Outer list has no total unless it contains numeric values

---

### 5.2 Section Labeling (Optional)

If a list is immediately preceded by a paragraph or heading, that text is treated
as the list’s label in the UI.

Example:
```
Camping
- Tent 900k
- Stove 300k
```

UI label:
- `Camping — Auto total: 1.2m`

---

## 6. Trigger Conditions

Auto-calculation is triggered ONLY when one of the following occurs:

- Text inside a list item changes
- A checklist item is checked or unchecked
- A list item is added or removed
- List structure changes (indent / outdent)

Auto-calculation MUST NOT:
- Run on every keystroke outside lists
- Scan the entire document unnecessarily

---

## 7. Total Block Behavior

### 7.1 Readonly Nature

- The Total block is **read-only**
- Users CANNOT:
  - Edit the total value
  - Select or type inside the total block
- The total block exists purely as derived UI

---

### 7.2 Removal Conditions

The Total block MUST be removed automatically when:

- The list contains **no numeric values**
- All numeric values are removed
- The list itself is deleted
- The list type changes to a non-supported type

The Total block MUST reappear automatically if numeric values are added again.

---

## 8. UI Presentation

### 8.1 Display Rules

- The total is displayed as a derived UI element
- The value is visually emphasized
- The label remains subtle

Example:
```
Auto total: **1,700k**
```

---

### 8.2 Visual Style

- Label text (“Auto total”, “Estimated total”): muted color
- Total numeric value: **bold**
- Non-editable
- Positioned directly below the list or aligned with the list container

---

## 9. Safety & Exclusions

The following MUST NOT be treated as numeric values:

- Version numbers: `1.2.3`
- Dates: `2024-12-31`
- Times: `10:30`
- URLs
- Phone numbers
- IDs or codes

---

## 10. Test Cases

### 10.1 Basic Calculation

| ID | Description | Input | Expected |
|----|------------|-------|----------|
| C1 | Bullet list sum | `500k + 300k` | `800k` |
| C2 | Ordered list sum | `1m + 2m` | `3m` |
| C3 | Decimal value | `1.5m + 500k` | `2m` |

---

### 10.2 Checklist Behavior

| ID | Description | Expected |
|----|------------|----------|
| C4 | Checked only | Only checked values summed |
| C5 | Toggle update | Total updates immediately |
| C6 | Mixed units | Display uses first item’s unit |

---

### 10.3 Removal

| ID | Description | Expected |
|----|------------|----------|
| C7 | Remove all numbers | Total block disappears |
| C8 | Delete list | Total removed |
| C9 | Add number later | Total reappears |

---

## 11. Non-Goals

- Spreadsheet-style formulas
- Cross-list calculations
- Manual total overrides
- Currency conversion
- Quantity parsing (`2 x 500k`)
- Persisting calculated values into content

---

End of specification.
