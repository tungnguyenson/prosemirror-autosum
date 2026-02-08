/**
 * ProseMirror decoration for displaying auto-calculated totals
 */

import { Decoration } from "prosemirror-view";
import { ListTotal } from "./list-calculator";
import { formatWithUnit } from "./numeric-parser";

/**
 * Helper to create a label span
 */
function createLabel(text: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.textContent = text;
    span.className = "autosum-label";
    span.style.fontWeight = "normal"; // Ensure it's not bold
    span.style.color = "#64748b"; // Light text for label
    return span;
}

/**
 * Helper to create a value strong
 */
function createValue(text: string): HTMLElement {
    const strong = document.createElement("strong");
    strong.textContent = text;
    strong.className = "autosum-value";
    // strong.style.color = "#0f172a"; // Dark text for value
    return strong;
}

/**
 * Create a decoration widget for displaying a list total
 * @param total - The calculated list total
 */
export function createTotalDecoration(total: ListTotal): Decoration {
    // Create DOM element for the total
    const dom = document.createElement("div");
    dom.className = "autosum-total";
    dom.contentEditable = "false";

    // Check if we should show the breakdown
    if (total.isCheckList &&
        total.checkedTotal !== undefined &&
        total.uncheckedTotal !== undefined &&
        total.checkedTotal > 0) {

        // Total part
        dom.appendChild(createLabel("Auto total: "));
        dom.appendChild(createValue(formatWithUnit(total.total, total.displayUnit)));

        // Separator
        dom.appendChild(createLabel(". "));

        // Checked part
        dom.appendChild(createLabel("Checked: "));
        dom.appendChild(createValue(formatWithUnit(total.checkedTotal, total.displayUnit)));

        // Separator
        dom.appendChild(createLabel(". "));

        // Unchecked part
        dom.appendChild(createLabel("Unchecked: "));
        dom.appendChild(createValue(formatWithUnit(total.uncheckedTotal, total.displayUnit)));

    } else {
        // Simple total
        dom.appendChild(createLabel("Auto total: "));
        dom.appendChild(createValue(formatWithUnit(total.total, total.displayUnit)));
    }

    // Create widget decoration at the specified position
    return Decoration.widget(total.position, dom, {
        side: 1, // Place after the list
        key: `autosum-${total.position}`
    });
}

/**
 * Create a DecorationSet from a list of totals
 */
export function createTotalDecorations(totals: ListTotal[]): Decoration[] {
    return totals.map(total => createTotalDecoration(total));
}
