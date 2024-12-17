# AuraVibe - SolidJS UIKit

**AuraVibe** is a modular and highly customizable UI Kit designed for use with SolidJS. It provides a consistent design language, leveraging LESS for styling and CSS Modules to ensure scoped styles.

## Project Structure

### **Components**
The `components` directory contains reusable UI components, each with its own styles and associated logic.

- **Button**
  - **`button.tsx`**: Implements the `Button` component logic and JSX structure.
  - **`button.module.less`**: Encapsulates styles specific to the `Button` component using CSS Modules.
  - **`index.ts`**: Provides an entry point for exporting the `Button` component.

- **CodeComment**
  - **`codeComment.tsx`**: Implements the `CodeComment` component, designed for inline page annotations while your application is in dev build.
  - **`codeComment.module.less`**: Contains styles scoped to the `CodeComment` component.
  - **`index.ts`**: Exports the `CodeComment` component.

### **Styles**
The `styles` directory organizes global and theme-specific LESS files for consistent styling.

#### **Themes**
- **`dark` and `light`**: Separate folders containing style definitions for respective themes.
  - **`base`**
    - **`colors.less`**: Defines the color palette for the theme.
    - **`index.less`**: Acts as the entry point for importing all theme-specific styles.
    - **`radius.less`**: Includes border-radius definitions for consistent rounded UI elements.
    - **`spacing.less`**: Establishes a spacing system for margins, paddings, and gaps.
  - **`main.less`**: Combines and organizes all base styles for the theme.
  - **`objects-properties.less`**: Contains shared object styles, such as containers or cards.
  - **`typo.less`**: Defines typography styles like font sizes, weights, and line heights.

#### **Typo**
The `typo` directory includes typography-specific LESS files.
- **`elements.less`**: Styles for typographic elements such as headers, paragraphs, and blockquotes.
- **`types`**
  - **`code.less`**: Styles for inline and block code snippets.
  - **`display.less`**: Defines styles for large, prominent text (e.g., headings).
  - **`text.less`**: Provides styles for smaller, body-level text elements.
- **`main.less`**: Central file that aggregates all typography styles.

---

## TODO

- [ ] Resolve inconsistencies in the project structure
    - [ ] Define clear themes boundaries
- [ ] Add installation instructions
- [ ] Add usage examples
    - [ ] Import component example
    - [ ] Override theme values example

---

## Contribution Guide

We welcome contributions to **AuraVibe**. To contribute:
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request with a detailed description of your changes.

---

## License

**AuraVibe** is released under the MIT License. See `LICENSE` for details.
