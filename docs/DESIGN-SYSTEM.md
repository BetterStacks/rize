# Rize design system

Calm, content-first, editorial. The person's work and words are the loudest thing on the page. The UI should stay out of the way.

Tokens are defined once in `src/styles/tokens.css`: light values under `:root`, dark under `.dark` (next-themes puts the class on `<html>`). `tailwind.config.ts` maps them to classes. Use the classes. Don't add new hex values.

## Tokens

### Colour

| Class | Light | Dark | Use for |
| --- | --- | --- | --- |
| `bg-ground` | `#FFFFFF` | `#141210` | Page background (`bg-light-bg` / `dark:bg-dark-bg` are the same thing) |
| `bg-surface` | `#FFFFFF` | `#1C1916` | Floating layers: dialogs, popovers, menus, toasts, cards |
| `bg-subtle` | `#F5F2EC` | `#25211D` | Hover and selected fills, quiet wells, the tab track |
| `text-ink` / `bg-ink` | `#1F1B16` | `#F3EEE6` | Body text, titles, ink buttons |
| `text-ink-secondary` | `#5A5248` | `#B3A999` | Descriptions, meta, placeholders |
| `border-hairline` | `#E7E2D8` | `#2E2923` | Every border and divider (`dark-border` is the same as dark hairline) |
| `bg-brand` / `text-brand-ink` | `#FFD936` / ink | same | The one primary action, a small active indicator (`main-yellow` still works) |
| `text-on-ink` | white | `#141210` | Text on an ink or danger fill |
| `text-danger` / `bg-danger` | `#B42318` | `#F97066` | Errors, destructive actions |
| `text-success` | `#16803D` | `#4ADE80` | Success icons only |
| `bg-paper`, `border-paper-border`, `bg-highlight` | `#FFFDF8`, `#E3DACB`, `#F1DFA8` | `#1E1B17`, `#3A332B`, `#5A4A1F` | Long passages of a person's own words (drafts, journal) |

All colours take opacity modifiers (`bg-ink/5`, `ring-brand/50`). In plain CSS, write `rgb(var(--ink))`. The shadcn variables (`--background`, `--foreground`, `--border`, `--muted-foreground`, `--ring` …) in `globals.css` point at the same palette, so `bg-background`, `text-muted-foreground` and `border-border` match too. The old `--rize-*` variables in `src/styles/rize-tokens.css` are aliases.

Contrast: ink on ground is 17:1, ink-secondary on ground 7.7:1, ink on brand 12.4:1. Dark mode: 16:1 and 8:1.

### Type

| Class | Face | Use for |
| --- | --- | --- |
| `font-instrument` | Instrument Serif (400 only) | Page titles, names, section headings, dialog titles. Don't bold it. |
| `font-inter` (default) | Inter | All UI text |
| `.rize-display` | Newsreader (`src/lib/fonts.ts`) | Long passages of a person's own words only |

No other fonts.

### Radius, shadow, motion

| Token | Class | Value | Use for |
| --- | --- | --- | --- |
| `--radius-sm` | `rounded-lg` | 8px | Buttons, menu items, small controls |
| `--radius-md` | `rounded-xl` | 12px | Inputs, selects, popovers, menus, toasts |
| `--radius-lg` | `rounded-2xl` | 20px | Dialogs, cards, large media |
| `--shadow-float` | `shadow-float` | soft and wide | Floating layers only: dialogs, popovers, menus, toasts |
| `--shadow-raised` | `shadow-raised` | barely there | The active tab, a dragged item |
| `--ease-calm` | `ease-calm` | `cubic-bezier(.2,.8,.2,1)` | Every transition |
| `--duration-fast` / `--duration-base` | `duration-fast` / `duration-base` | 150ms / 200ms | Hover/press, open/close |

`rounded-md` (6px) and `rounded-sm` (4px) still exist for older code. Don't use them in new work. `prefers-reduced-motion` turns animation off globally (`globals.css`).

## Which component, which variant

**Button** (`@/components/ui/button`)
- `brand`: the single most important action on a screen (Save on the profile editor, Continue in onboarding). At most one per view.
- `default` (ink fill): the main action inside a form or dialog when yellow would be too loud.
- `outline`: secondary actions next to a primary one (Cancel, Skip, Back).
- `ghost`: toolbars, icon buttons, tertiary actions, anything that repeats in a list.
- `destructive`: delete or remove, normally inside an `AlertDialog`.
- `link`: an inline text action.
- Sizes: `sm` (32px) for dense rows, `default` (40px), `lg` (48px) for primary actions on phones, `icon` (40px box). `icon` and `smallIcon` get a 44px hit area on touch screens through the `touch-target` utility, without changing the box, and you can add `touch-target` to any other small control. Give icon-only buttons an `aria-label`.
- `loading` shows a spinner and disables the button.
- Legacy names still work: `secondary` and `success` render as `default`, `primary` and `warning` render as `brand`. Don't use them in new code.

**Dialog** (`@/components/ui/dialog`): forms and anything a person can back out of. It is a bottom sheet on phones and a centred card from `sm` up. It has a close button (top-right, 44px, labelled "Close") by default. Pass `showCloseButton={false}` only if the dialog draws its own close control. `DialogTitle` is set in Instrument Serif and `DialogDescription` in ink-secondary. Put actions in `DialogFooter`.

**AlertDialog**: confirmations that need an explicit answer (delete, discard). It has no close X. Use `AlertDialogCancel` (outline) and `AlertDialogAction` (ink; add `buttonVariants({ variant: 'destructive' })` for deletes).

**Toasts**: `import { toast } from 'react-hot-toast'`, then `toast.success`, `toast.error`, `toast.loading` followed by `toast.success(msg, { id })`, or `toast.promise`. The look lives in `src/components/ui/toaster.tsx`: bottom-centre above the nav on phones, bottom-right on desktop, and a click dismisses. Keep messages short and plain ("Saved", "Couldn't upload that image"). Don't add a second Toaster, and don't use sonner.

**Inputs / Textarea / Select**: hairline border with a 12px radius. On focus they get an ink border and a yellow halo. Always pair them with a `Label`.

**Tabs**: a quiet track (`bg-subtle`), and the active tab lifts onto `surface`.

**Badge**: `secondary` (subtle) is the default choice. Use `outline` for neutral tags, `brand` sparingly for "new" or "yours", and `destructive` for errors.

**Card**: hairline border, 20px radius, no shadow. Prefer hairline dividers over cards inside cards.

**Popover / DropdownMenu**: surface, hairline, 12px radius, `shadow-float`.

## Taste rules

- Brand yellow `#FFD936` is used sparingly and with intent: the primary action on a screen, highlights of the person's own words, a small active indicator. Never put large yellow fills behind body text. Text on yellow is always ink.
- Leave generous whitespace. Use hairline dividers instead of boxes inside boxes. Use one radius scale (8 / 12 / 20). Shadows go only on floating layers.
- No gradients, no glows, no dashboard widgets, no "insight" cards.
- No sparkle, wand or ✨ icons. Pick lucide icons for their meaning. No emoji in UI chrome.
- Copy is short, plain, specific and a bit warm. Never hype ("stunning", "supercharge") and never surveillance ("who viewed you").
- Motion is quick and quiet: 150–220ms with `ease-calm`, and it respects `prefers-reduced-motion`.
- Accessibility: use real buttons and links, 44px touch targets, visible focus rings (ink, or a yellow halo on fields), and labels on inputs. Text contrast is 4.5:1 or better. Everything works at 375px wide, in light and dark.
