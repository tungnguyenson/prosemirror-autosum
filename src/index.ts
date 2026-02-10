/**
 * ProseMirror Autosum Plugin
 * Automatically calculates and displays totals for numeric values in lists
 */

import { Plugin, PluginKey, EditorState, Transaction } from "prosemirror-state";
import { DecorationSet } from "prosemirror-view";
import { findAllListTotals } from "./list-calculator";
import { createTotalDecorations } from "./total-decoration";

interface AutosumState {
    enabled: boolean;
    decorations: DecorationSet;
}

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
// Transaction meta key
const SET_AUTOSUM_META = 'setAutosum';

/**
 * Plugin key for autosum
 */
export const autosumKey = new PluginKey("autosum");

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
    const { enabled: initialEnabled = true } = options;

    const plugin = new Plugin({
        key: autosumKey,

        state: {
            init(_, state) {
                return initialEnabled ? calculateDecorations(state) : DecorationSet.empty;
            },

            apply(tr: Transaction, oldDecorationSet: DecorationSet, _oldState: EditorState, newState: EditorState) {
                // Check for meta to toggle enabled state
                const setEnabled = tr.getMeta(autosumKey);
                if (typeof setEnabled === 'boolean') {
                    return setEnabled ? calculateDecorations(newState) : DecorationSet.empty;
                }

                // If we have an empty set (disabled), stay empty unless enabled
                // But wait, we need to know the *current* enabled state to decide whether to calculate.
                // The plugin state *is* the decoration set. Use size to guess? No, that's flaky.
                // We need to store the enabled state. 
                // Let's change the plugin state to be an object { decorations, enabled }
                // OR check if we can store state differently. 
                // Actually, for simplicity in this specific plugin structure, let's keep it simple:
                // If the decoration set is empty, it might mean disabled OR no numbers.
                // To properly support toggling, we should probably wrap the state.

                // Let's refactor the state to hold { decorations: DecorationSet, enabled: boolean }
                // But `decorations` prop expects a DecorationSet. 
                // We'll return just the DecorationSet from `decorations()` prop by accessing .decorations

                return oldDecorationSet; // Placeholder, rewriting entire apply below
            }
        },
        // ...
    });

    // RE-WRITING THE PLUGIN WITH PROPER STATE MANAGEMENT
    return [new Plugin({
        key: autosumKey,
        state: {
            init() {
                return { enabled: initialEnabled, decorations: DecorationSet.empty };
            },
            apply(tr: Transaction, value: AutosumState, oldState: EditorState, newState: EditorState): AutosumState {
                let { enabled, decorations } = value;

                // Check for toggle meta
                // We use the plugin key itself for meta
                const meta = tr.getMeta(autosumKey);
                if (meta && typeof meta.enabled === 'boolean') {
                    enabled = meta.enabled;
                }

                if (!enabled) {
                    return { enabled, decorations: DecorationSet.empty };
                }

                if (tr.docChanged || value.enabled !== enabled) {
                    decorations = calculateDecorations(newState);
                } else {
                    decorations = decorations.map(tr.mapping, tr.doc);
                }

                return { enabled, decorations };
            }
        },
        props: {
            decorations(state) {
                return (this as any).getState(state).decorations;
            }
        }
    })];
}

/**
 * Helper to create a transaction that sets the autosum enabled state
 */
export function setAutosum(state: EditorState, enabled: boolean): Transaction {
    return state.tr.setMeta(autosumKey, { enabled });
}

// Export types and utilities for advanced usage
export * from "./numeric-parser";
export * from "./list-calculator";
export * from "./total-decoration";

