# Test Cases for Auto-Sum

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