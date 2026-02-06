/**
 * List calculator for computing totals from list nodes
 */

import { Node as ProseMirrorNode } from "prosemirror-model";
import { parseNumericValue, formatWithUnit } from "./numeric-parser";

export interface ListTotal {
    /** The sum of all numeric values in the list */
    total: number;
    /** The sum of checked items (for checklists) */
    checkedTotal?: number;
    /** The sum of unchecked items (for checklists) */
    uncheckedTotal?: number;
    /** The display unit to use (derived from first item) */
    displayUnit: string;
    /** Position after the list node where total should be displayed */
    position: number;
    /** Whether this list has any numeric values */
    hasValues: boolean;
    /** Whether this is a checklist */
    isCheckList: boolean;
}

/**
 * Extract text content from a list item node, excluding nested lists
 * Only gets the direct paragraph/text content, not content from nested list items
 */
function getTextContent(node: ProseMirrorNode): string {
    let text = '';

    // Only look at direct children, not descendants
    node.forEach((child) => {
        // Skip nested lists
        const isNestedList = child.type.name === 'bullet_list' ||
            child.type.name === 'ordered_list' ||
            child.type.name.includes('task_list') ||
            child.type.name.includes('check_list') ||
            child.type.name.includes('checklist');

        if (!isNestedList && child.isText) {
            text += child.text;
        } else if (!isNestedList) {
            // For paragraph nodes, get their text content
            child.descendants((textNode) => {
                if (textNode.isText) {
                    text += textNode.text;
                }
                return true;
            });
        }
    });

    return text;
}


/**
 * Check if a task/checklist item is checked
 * Assumes the node has an attribute `checked` (boolean or 0/1)
 */
function isTaskChecked(node: ProseMirrorNode): boolean {
    // Check for checker attribute patterns
    if (node.attrs.checked !== undefined) {
        return !!node.attrs.checked;
    }
    if (node.attrs.done !== undefined) {
        return !!node.attrs.done;
    }
    return false;
}

/**
 * Calculate total for a single list node
 * @param listNode - The list node (bullet_list, ordered_list, or checkList)
 * @param listPos - Position of the list node in the document
 */
export function calculateListTotal(
    listNode: ProseMirrorNode,
    listPos: number
): ListTotal | null {
    const listType = listNode.type.name;
    const isCheckList = listType.includes('task') || listType.includes('check');

    let total = 0;
    let checkedTotal = 0;
    let uncheckedTotal = 0;
    let displayUnit = '';
    let hasValues = false;
    let numericItemCount = 0;

    // Iterate through direct children (list items)
    listNode.forEach((itemNode, _offset, index) => {
        // Extract text content from the item
        const text = getTextContent(itemNode);
        if (!text.trim()) {
            return;
        }

        // Parse numeric value
        const parsed = parseNumericValue(text);
        if (parsed) {
            // console.log(`Parsed value from "${text}":`, parsed);
            total += parsed.value;
            hasValues = true;
            numericItemCount++;

            if (isCheckList) {
                const checked = isTaskChecked(itemNode);
                if (checked) {
                    checkedTotal += parsed.value;
                } else {
                    uncheckedTotal += parsed.value;
                }
            }

            // Use the first item's unit as display unit
            if (index === 0 && !displayUnit) {
                displayUnit = parsed.unit;
            }
        }
    });

    // Only show total if there are 2 or more numeric items
    if (!hasValues || numericItemCount < 2) {
        return null;
    }


    // Position is after the list node ends
    const position = listPos + listNode.nodeSize;

    return {
        total,
        checkedTotal: isCheckList ? checkedTotal : undefined,
        uncheckedTotal: isCheckList ? uncheckedTotal : undefined,
        displayUnit,
        position,
        hasValues,
        isCheckList
    };
}

/**
 * Find all list nodes in the document and calculate their totals
 * @param doc - The ProseMirror document node
 */
export function findAllListTotals(doc: ProseMirrorNode): ListTotal[] {
    const totals: ListTotal[] = [];

    doc.descendants((node, pos) => {
        const nodeType = node.type.name;

        // Check if this is a list node
        const isList = nodeType === 'bullet_list' ||
            nodeType === 'ordered_list' ||
            nodeType === 'checkList' ||
            nodeType.includes('task_list') ||
            nodeType.includes('checklist');

        if (isList) {
            // console.log("Checking list node:", node.type.name);
            const total = calculateListTotal(node, pos);
            if (total) {
                // console.log("Found list total:", total);
                totals.push(total);
            }
            // Don't descend into nested lists, they'll be processed separately
            return false;
        }

        return true;
    });

    return totals;
}

/**
 * Format a list total for display
 */
export function formatListTotal(total: ListTotal): string {
    const formattedTotal = formatWithUnit(total.total, total.displayUnit);

    // Only show breakdown if it's a checklist AND there are actually checked items
    if (total.isCheckList &&
        total.checkedTotal !== undefined &&
        total.uncheckedTotal !== undefined &&
        total.checkedTotal > 0) {

        const formattedChecked = formatWithUnit(total.checkedTotal, total.displayUnit);
        const formattedUnchecked = formatWithUnit(total.uncheckedTotal, total.displayUnit);
        return `${formattedTotal}. Checked: ${formattedChecked}. Unchecked: ${formattedUnchecked}`;
    }

    return formattedTotal;
}
