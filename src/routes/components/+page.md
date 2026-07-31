<script lang="ts">
	import ButtonsDemo from './ButtonsDemo.svelte';
	import BadgesDemo from './BadgesDemo.svelte';
	import AvatarsDemo from './AvatarsDemo.svelte';
	import IconsDemo from './IconsDemo.svelte';
	import CardsDemo from './CardsDemo.svelte';
	import StatsDemo from './StatsDemo.svelte';
	import FeedbackDemo from './FeedbackDemo.svelte';
	import FormsDemo from './FormsDemo.svelte';
	import NavigationDemo from './NavigationDemo.svelte';
	import TableDemo from './TableDemo.svelte';
	import ToastDemo from './ToastDemo.svelte';
</script>

<svelte:head><title>Components · tstack</title></svelte:head>

# Components

The elements from `src/lib/components/elements`, each shown with the prop that produces the
variant. Everything here works in both themes — the toggle in the header is the quickest way to
check.

## Buttons

<ButtonsDemo />

## Badges

<BadgesDemo />

## Cards

`Card` is the surface almost every page section sits on: an optional header with icon, title,
description and actions, a body, and a footer for the buttons that act on it. `tone="error"`
turns it into a danger zone without any per-page classes.

<CardsDemo />

## Tables

Every list in the app goes through `DataTable`: the dashboard activity log, the members, the
invoices and the task list. It owns the chrome — scrolling, header row, sort links, row hover,
anchor targets — while the page supplies the cells through a `row` snippet. That is what keeps
four unrelated lists looking like one product.

<TableDemo />

## Stats

<StatsDemo />

## Forms

`Field` renders a labelled input with its hint and its validation errors. Pass a `children`
snippet and it keeps the label, hint and error styling but lets you supply the control — that is
how selects, textareas and input groups avoid becoming components of their own.

<FormsDemo />

## Feedback

<FeedbackDemo />

## Toasts

`toast.success('…')` from anywhere — a remote function callback, an error handler, a keyboard
shortcut. The single `<Toaster />` in the root layout renders them through `Alert`, so a toast
and an inline message never drift apart. They disappear after five seconds unless
`timeout: 0` keeps them.

<ToastDemo />

## Navigation and overlays

<NavigationDemo />

## Avatars

Without a `src`, `Avatar` derives a deterministic gradient from the name — same name, same
image.

<AvatarsDemo />

## Icons

`Icon` resolves names against `src/lib/components/elements/icons.ts`, a hand-kept list of
re-exports. That keeps the icon bundle at a few kilobytes instead of the 5.5 MB the full
Hugeicons package weighs — and it means a new icon needs one line added there first.

<IconsDemo />

## Layout

Page chrome lives in `src/lib/components/layout` and is easier to look at in place than in a
demo box:

| Component                                   | Where to see it                                                             |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| `AppShell`, `Sidebar`, `Topbar`, `UserMenu` | [/dashboard](/dashboard) — collapse the sidebar with the button at its foot |
| `PageHeader`                                | Top of every [app page](/team)                                              |
| `BrandPanel`                                | Right-hand side of [/login](/login)                                         |
| `Footer`, `Logo`                            | Bottom of this page                                                         |
| `ThemeToggle`                               | Header of this page                                                         |

`navigation.ts` in the same folder holds the sidebar and footer entries as data, so the desktop
sidebar and the mobile drawer cannot drift apart.
