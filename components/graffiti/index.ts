/**
 * Graffiti design furniture — the decorative layer.
 *
 * Every component is a server component, transparent-background, pure SVG/CSS,
 * `aria-hidden`, and tinted through a `color` prop that defaults to
 * `var(--accent)`.
 *
 * IMPORTANT — `uid`: components that emit SVG `id`s (SprayMist, Overspray,
 * Splatter, Drips, MarkerStroke, Scribble, Arrow, Tag, ThrowUp, StencilText)
 * take an optional `uid` with a stable default. If you render the same
 * component more than once in a document you MUST pass distinct `uid`s —
 * `url(#…)` resolves to the first matching id in the document, so every later
 * copy silently renders through the first one's filter/mask.
 */

export { SprayMist, Overspray } from './Spray';
export { Splatter, Drips, MarkerStroke, Scribble } from './Marks';
export { Arrow } from './Arrows';
export type { ArrowVariant } from './Arrows';
export { Tag, ThrowUp } from './Tag';
export { Tape, TornEdge, Halftone, StickerFrame } from './Surfaces';
export { StencilText } from './StencilText';
