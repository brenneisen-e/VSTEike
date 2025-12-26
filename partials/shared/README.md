# Shared HTML Components

This directory contains reusable HTML component templates for the VST Dashboard application.

## Directory Structure

```
partials/
├── shared/                    # Shared components
│   ├── head.html             # Meta tags, external libs, CSS imports
│   ├── header.html           # Page header with breadcrumb & actions
│   ├── sidebar.html          # Navigation sidebar
│   ├── footer.html           # Page footer
│   ├── cards.html            # Card component templates
│   ├── modals.html           # Modal dialog templates
│   ├── forms.html            # Form element templates
│   ├── tables.html           # Data table templates
│   └── icons.html            # SVG icon library
├── banken/                    # Banken module specific partials
├── bestandsuebertragung-module.html
├── banken-module.html
└── risikoscoring-module.html
```

## Usage

### Including Partials

Since this is a static HTML application, you have several options for including partials:

#### 1. Copy/Paste Method
Copy the needed component code directly into your HTML file.

#### 2. JavaScript Fetch Method
```javascript
async function loadPartial(url, targetId) {
    const response = await fetch(url);
    const html = await response.text();
    document.getElementById(targetId).innerHTML = html;
}

// Usage
loadPartial('partials/shared/header.html', 'header-container');
```

#### 3. Server-Side Includes (if using SSI)
```html
<!--#include file="partials/shared/header.html" -->
```

#### 4. Build Tool (if using a bundler)
Many bundlers like Vite, Webpack, or Parcel support HTML partials/fragments.

## Component Guidelines

### Cards (`cards.html`)
- **Basic Card**: Simple container with header and body
- **KPI Card**: For displaying key metrics with change indicators
- **Stat Card**: Compact statistic display
- **Info Card**: Highlighted information blocks
- **List Card**: Card with list items
- **Chart Card**: Card designed for chart content

### Modals (`modals.html`)
- **Basic Modal**: Standard dialog with header, body, footer
- **Confirmation Modal**: For delete/action confirmations
- **Form Modal**: Modal containing a form
- **Slide-over Panel**: Side panel sliding in from right
- **Success Modal**: Feedback after successful action

### Forms (`forms.html`)
- Input with icons (left/right)
- Input with addons (currency, etc.)
- Checkboxes and radio buttons
- Toggle switches
- File upload zones
- Form validation states

### Tables (`tables.html`)
- Basic data table
- Table with selection checkboxes
- Sortable table headers
- Table with pagination
- Responsive table (cards on mobile)

### Icons (`icons.html`)
SVG icon paths organized by category:
- Navigation icons
- Action icons
- Status icons
- Chart/Data icons
- Communication icons
- User icons
- Finance icons
- Document icons
- Navigation arrows
- Misc icons

## Customization

### Variables
Some components use placeholder variables that should be replaced:
- `{{PAGE_TITLE}}` - Main page title
- `{{PAGE_SUBTITLE}}` - Page description
- `{{BREADCRUMB}}` - Breadcrumb items

### CSS Variables
Components use CSS custom properties defined in `css/base/_variables.css`:
```css
--color-primary: #2563EB;
--color-success: #16A34A;
--color-warning: #D97706;
--color-error: #DC2626;
--color-text-primary: #0F172A;
--color-text-secondary: #475569;
--color-border: #E2E8F0;
```

## Best Practices

1. **Keep components small and focused** - Each component should do one thing well
2. **Use semantic HTML** - Proper heading levels, ARIA attributes, etc.
3. **Mobile-first** - Components include responsive styles
4. **Accessibility** - Include proper labels, roles, and keyboard navigation
5. **Consistent naming** - Use BEM-style class naming
