/**
 * ProseMirror Autosum Plugin
 * Automatically calculates and displays totals for numeric values in lists
 */

import { Plugin, PluginKey, EditorState, Transaction } from "prosemirror-state";
import { DecorationSet } from "prosemirror-view";
import { findAllListTotals } from "./list-calculator";
import { createTotalDecorations } from "./total-decoration";

export interface AutosumOptions {
    /**
     * Enable or disable the autosum feature
     * @default true
     */
    enabled?: boolean;
}

/**
 * Plugin key for autosum
 */
const autosumKey = new PluginKey("autosum");

/**
 * Calculate decorations for the current document state
 */
function calculateDecorations(state: EditorState): DecorationSet {
    const totals = findAllListTotals(state.doc);
    const decorations = createTotalDecorations(totals);
    return DecorationSet.create(state.doc, decorations);
}

/**
 * Create the autosum plugin
 */
export function autosum(options: AutosumOptions = {}): Plugin[] {
    const { enabled = true } = options;

    if (!enabled) {
        return [];
    }

    const plugin = new Plugin({
        key: autosumKey,

        state: {
            init(_, state) {
                return calculateDecorations(state);
            },

            apply(tr: Transaction, oldDecorationSet: DecorationSet, _oldState: EditorState, newState: EditorState) {
                // If document didn't change, keep existing decorations
                if (!tr.docChanged) {
                    // Map decorations through the transaction
                    return oldDecorationSet.map(tr.mapping, tr.doc);
                }

                // Document changed, recalculate decorations
                return calculateDecorations(newState);
            }
        },

        props: {
            decorations(state) {
                return this.getState(state);
            }
        }
    });

    return [plugin];
}

// Export types and utilities for advanced usage
export * from "./numeric-parser";
export * from "./list-calculator";
export * from "./total-decoration";

