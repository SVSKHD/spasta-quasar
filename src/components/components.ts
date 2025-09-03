import type { App, Component } from 'vue';
import Card from './card.vue';

// Add any new components here
const components: Record<string, Component> = {
  Card,
};

const PREFIX_PASCAL = 'Spasta'; // gives PascalCase like "SpastaCard"

export function registerGlobalComponents(app: App) {
  Object.entries(components).forEach(([name, cmp]) => {
    // Register as PascalCase (Vue lets you use kebab-case in templates automatically)
    const pascalName = `${PREFIX_PASCAL}${name}`; // e.g., "SpastaCard"
    app.component(pascalName, cmp);
  });
}
