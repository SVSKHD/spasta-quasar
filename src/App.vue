<template>
  <div id="app">
    <SpastaRouter />
  </div>
</template>

<script setup lang="ts">
// No imports needed - components are globally registered
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'JetBrains Mono', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #254D70;
  color: #EFE4D2;
}

#app {
  height: 100vh;
  overflow: hidden;
  background-color: #254D70;
}

/* Custom scrollbar for better aesthetics */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(239, 228, 210, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #3A6B8C;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(58, 107, 140, 0.8);
}

/* Utility classes */
.cursor-pointer {
  cursor: pointer;
}

.transition-all {
  transition: all 0.3s ease;
}

.opacity-30 {
  opacity: 0.3;
}

/* Custom Spasta theme classes */
.spasta-bg {
  background-color: #254D70 !important;
}

.spasta-card {
  background-color: #3A6B8C !important;
}

.spasta-text {
  color: #EFE4D2 !important;
}

.spasta-card-light {
  background-color: rgba(58, 107, 140, 0.3) !important;
}

.spasta-border {
  border-color: #3A6B8C !important;
}

/* Override Quasar default colors */
.q-card {
  background-color: #3A6B8C;
  color: #EFE4D2;
}

.q-header {
  background-color: #3A6B8C !important;
}

.q-drawer {
  background-color: rgba(37, 77, 112, 0.95) !important;
  color: #EFE4D2;
}

.q-item {
  color: #EFE4D2;
}

.q-item:hover {
  background-color: rgba(58, 107, 140, 0.3) !important;
}

.q-item.q-item--active {
  background-color: rgba(58, 107, 140, 0.5) !important;
  color: #EFE4D2;
}

/* Icon spacing fixes */
.q-icon {
  margin-right: 8px !important;
}

.q-btn .q-icon {
  margin-right: 4px !important;
}

.q-chip .q-icon {
  margin-right: 4px !important;
}

/* Better icon sizing */
.icon-sm {
  font-size: 16px !important;
}

.icon-md {
  font-size: 20px !important;
}

.icon-lg {
  font-size: 24px !important;
}

.icon-xl {
  font-size: 32px !important;
}

/* Enhanced Input Field Styling */
.spasta-input .q-field__control {
  background-color: rgba(239, 228, 210, 0.1) !important;
  border-color: rgba(239, 228, 210, 0.3) !important;
  border-radius: 12px !important;
  min-height: 40px !important;
}

.spasta-input .q-field__native {
  color: #EFE4D2 !important;
  padding: 8px 12px !important;
}

.spasta-input .q-field__label {
  color: #EFE4D2 !important;
}

.spasta-input.q-field--dense .q-field__control {
  min-height: 36px !important;
}

.spasta-input.q-field--dense .q-field__native {
  padding: 6px 10px !important;
}

.spasta-input .q-field__control:hover {
  border-color: rgba(239, 228, 210, 0.5) !important;
}

.spasta-input.q-field--focused .q-field__control {
  border-color: #EFE4D2 !important;
  box-shadow: 0 0 0 2px rgba(239, 228, 210, 0.2) !important;
}

/* Select dropdown styling */
.spasta-input .q-field__append {
  color: #EFE4D2 !important;
}

/* Textarea specific styling */
.spasta-input .q-field--auto-height .q-field__native {
  resize: vertical;
  min-height: 80px;
}

/* Spacing utilities */
.spacing-sm {
  gap: 8px;
}

.spacing-md {
  gap: 16px;
}

.spacing-lg {
  gap: 24px;
}

.spacing-xl {
  gap: 32px;
}

/* Padding utilities */
.p-sm {
  padding: 8px;
}

.p-md {
  padding: 16px;
}

.p-lg {
  padding: 24px;
}

.p-xl {
  padding: 32px;
}

/* Margin utilities */
.m-sm {
  margin: 8px;
}

.m-md {
  margin: 16px;
}

.m-lg {
  margin: 24px;
}

.m-xl {
  margin: 32px;
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .hide-on-mobile {
    display: none !important;
  }
}

@media (min-width: 769px) {
  .hide-on-desktop {
    display: none !important;
  }
}
</style>