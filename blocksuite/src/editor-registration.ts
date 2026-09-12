/**
 * BlockSuite registration barrel — import side-effects ONLY.
 * Re-exports everything from @blocksuite/presets but forces Vite/Rollup
 * to include the files that have @customElement decorators,
 * which register web components (affine-editor-container, etc.) into the DOM.
 * Without this, the editor web component has 0×0 dimensions → blank screen.
 */

// Forces Lit decorators in @blocksuite/presets to execute via Vite pre-bundle.
// Manual customElements.define is called in main.ts for affine-editor-container.
import '@blocksuite/presets';
