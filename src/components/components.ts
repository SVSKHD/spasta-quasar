import type { App, Component } from "vue";

export function registerGlobalComponents(app: App) {
  // include subfolders; set { eager: true } so we can register synchronously
  const modules = import.meta.glob("./**/*.vue", { eager: true });

  Object.entries(modules).forEach(([path, mod]) => {
    const file = path.split("/").pop() || "";
    const base = file.replace(/\.vue$/i, ""); // filename without extension
    if (!base) return;

    // If the filename is already prefixed, keep it; else prefix it
    const pascalBase = toPascal(base);
    const name = pascalBase.startsWith("Spasta")
      ? pascalBase
      : `Spasta${pascalBase}`;

    const component = (mod as any).default as Component | undefined;
    if (component) app.component(name, component);
  });
}

function toPascal(s: string) {
  return s
    .replace(/[-_ ]+([a-zA-Z0-9])/g, (_, c: string) => c.toUpperCase())
    .replace(/^[a-z]/, (c) => c.toUpperCase());
}
