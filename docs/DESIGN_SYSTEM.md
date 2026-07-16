# Design System

## Visual direction

ERA uses a high-contrast desktop-agent interface inspired by technical instrumentation:

- white desktop shell;
- heavy dark outlines;
- segmented titlebar controls;
- central particle voice core;
- blue transcript surface;
- cyan system accents;
- explicit status labels.

## Main layout

```text
Titlebar
├── Identity and menu
├── Dashboard / Macros / Apps
├── Gallery / Phone / Settings
└── Desktop window controls

Dashboard
├── Hologram and system rail
├── Voice core and primary action
└── Transcript and composer
```

## Typography

- Orbitron — product identity and technical headings;
- IBM Plex Mono — metadata, status, code, and controls;
- Chakra Petch — body interface copy.

Fallback system fonts must remain usable if web fonts are unavailable.

## Color meaning

- Cyan/blue — active intelligence and navigation;
- Green — verified online or completed;
- Amber — warning, adapter, or review required;
- Red — destructive, failed, or critical risk;
- Violet — research, simulation, or specialist process;
- Gray — unavailable, disabled, or metadata-only.

## Motion

Animations must respect `prefers-reduced-motion`. Motion communicates state; it must not be required to understand or operate ERA.

## Component requirements

Components should provide:

- keyboard focus;
- accessible labels;
- visible disabled state;
- loading and error state;
- responsive layout;
- truthful status copy.

## Reference artwork

Source design references are stored under `assets/design/`. Runtime brand resources are stored under `resources/public/brand/`.
