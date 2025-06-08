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
  background: linear-gradient(135deg, #254D70 0%, #1a3a52 50%, #0f2a3d 100%);
  color: #EFE4D2;
  min-height: 100vh;
}

#app {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #254D70 0%, #1a3a52 50%, #0f2a3d 100%);
}

/* Custom scrollbar for better aesthetics */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(239, 228, 210, 0.1);
  border-radius: 8px;
}

::-webkit-scrollbar-thumb {
  background: rgba(58, 107, 140, 0.6);
  border-radius: 8px;
  backdrop-filter: blur(10px);
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

/* Glass-based Spasta theme classes */
.spasta-bg {
  background: linear-gradient(135deg, #254D70 0%, #1a3a52 50%, #0f2a3d 100%) !important;
}

.spasta-card {
  background: rgba(58, 107, 140, 0.15) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

.spasta-text {
  color: #EFE4D2 !important;
}

.spasta-card-light {
  background: rgba(58, 107, 140, 0.1) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(239, 228, 210, 0.15) !important;
  border-radius: 16px !important;
}

.spasta-border {
  border-color: rgba(239, 228, 210, 0.3) !important;
  border-radius: 12px !important;
}

/* Override Quasar default colors with glass effect */
.q-card {
  background: rgba(58, 107, 140, 0.15) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
  border-radius: 20px !important;
  color: #EFE4D2;
}

.q-header {
  background: rgba(58, 107, 140, 0.2) !important;
  backdrop-filter: blur(20px) !important;
  border-radius: 20px !important;
}

.q-drawer {
  background: rgba(37, 77, 112, 0.2) !important;
  backdrop-filter: blur(25px) !important;
  border: 1px solid rgba(239, 228, 210, 0.1) !important;
  color: #EFE4D2;
}

.q-item {
  color: #EFE4D2;
  border-radius: 12px !important;
  margin: 4px 8px !important;
}

.q-item:hover {
  background: rgba(58, 107, 140, 0.3) !important;
  backdrop-filter: blur(10px) !important;
}

.q-item.q-item--active {
  background: rgba(58, 107, 140, 0.4) !important;
  backdrop-filter: blur(15px) !important;
  color: #EFE4D2;
  border: 1px solid rgba(239, 228, 210, 0.3) !important;
}

/* Tab styling with glass effect */
.q-tabs {
  background: rgba(58, 107, 140, 0.2) !important;
  backdrop-filter: blur(15px) !important;
  border-radius: 16px !important;
  border: 1px solid rgba(239, 228, 210, 0.1) !important;
}

.q-tab {
  border-radius: 12px !important;
  margin: 4px !important;
}

.q-tab--active {
  background: rgba(239, 228, 210, 0.2) !important;
  backdrop-filter: blur(10px) !important;
}

.q-tab-panels {
  background: transparent !important;
}

.q-tab-panel {
  background: rgba(58, 107, 140, 0.05) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 16px !important;
  border: 1px solid rgba(239, 228, 210, 0.1) !important;
  margin-top: 8px !important;
}

/* Button styling with glass effect */
.q-btn {
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
}

.q-btn--flat {
  background: rgba(239, 228, 210, 0.1) !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
}

.q-btn--flat:hover {
  background: rgba(239, 228, 210, 0.2) !important;
  transform: translateY(-2px) !important;
}

/* Chip styling */
.q-chip {
  border-radius: 20px !important;
  backdrop-filter: blur(10px) !important;
}

/* Menu and dialog styling */
.q-menu {
  background: rgba(58, 107, 140, 0.2) !important;
  backdrop-filter: blur(25px) !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
  border-radius: 16px !important;
}

.q-dialog .q-card {
  background: rgba(37, 77, 112, 0.3) !important;
  backdrop-filter: blur(30px) !important;
  border: 2px solid rgba(239, 228, 210, 0.3) !important;
  border-radius: 24px !important;
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

/* Enhanced Input Field Styling with glass effect */
.spasta-input .q-field__control {
  background: rgba(239, 228, 210, 0.1) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(239, 228, 210, 0.3) !important;
  border-radius: 16px !important;
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
  border-radius: 14px !important;
}

.spasta-input.q-field--dense .q-field__native {
  padding: 6px 10px !important;
}

.spasta-input .q-field__control:hover {
  border-color: rgba(239, 228, 210, 0.5) !important;
  background: rgba(239, 228, 210, 0.15) !important;
}

.spasta-input.q-field--focused .q-field__control {
  border-color: #EFE4D2 !important;
  box-shadow: 0 0 0 2px rgba(239, 228, 210, 0.2) !important;
  background: rgba(239, 228, 210, 0.2) !important;
}

/* Select dropdown styling */
.spasta-input .q-field__append {
  color: #EFE4D2 !important;
}

/* Textarea specific styling */
.spasta-input .q-field--auto-height .q-field__native {
  resize: vertical;
  min-height: 80px;
  border-radius: 16px !important;
}

/* Table styling with glass effect */
.q-table {
  background: rgba(58, 107, 140, 0.1) !important;
  backdrop-filter: blur(15px) !important;
  border-radius: 20px !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
}

.q-table thead th {
  background: rgba(58, 107, 140, 0.3) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
}

.q-table tbody tr {
  border-radius: 8px !important;
}

.q-table tbody tr:hover {
  background: rgba(58, 107, 140, 0.2) !important;
  backdrop-filter: blur(10px) !important;
}

/* Expansion item styling */
.q-expansion-item {
  background: rgba(58, 107, 140, 0.1) !important;
  backdrop-filter: blur(15px) !important;
  border-radius: 16px !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
  margin: 8px 0 !important;
}

.q-expansion-item__header {
  border-radius: 16px !important;
}

.q-expansion-item__content {
  background: rgba(58, 107, 140, 0.05) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 0 0 16px 16px !important;
}

/* Banner styling */
.q-banner {
  border-radius: 16px !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
}

/* Separator styling */
.q-separator {
  background: rgba(239, 228, 210, 0.2) !important;
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

/* Glass effect animations */
@keyframes glass-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.glass-shimmer {
  background: linear-gradient(
    90deg,
    rgba(239, 228, 210, 0.1) 0%,
    rgba(239, 228, 210, 0.3) 50%,
    rgba(239, 228, 210, 0.1) 100%
  );
  background-size: 200% 100%;
  animation: glass-shimmer 2s infinite;
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .hide-on-mobile {
    display: none !important;
  }
  
  .spasta-card {
    border-radius: 16px !important;
  }
  
  .q-card {
    border-radius: 16px !important;
  }
  
  .q-dialog .q-card {
    border-radius: 20px !important;
  }
}

@media (min-width: 769px) {
  .hide-on-desktop {
    display: none !important;
  }
}

/* Enhanced glass effects for hover states */
.spasta-card:hover {
  background: rgba(58, 107, 140, 0.25) !important;
  border-color: rgba(239, 228, 210, 0.4) !important;
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2) !important;
}

.spasta-card-light:hover {
  background: rgba(58, 107, 140, 0.2) !important;
  border-color: rgba(239, 228, 210, 0.3) !important;
}

/* Loading spinner with glass effect */
.q-spinner-dots {
  filter: drop-shadow(0 0 10px rgba(239, 228, 210, 0.5));
}

/* Progress bar styling */
.q-linear-progress {
  border-radius: 10px !important;
  backdrop-filter: blur(10px) !important;
}

.q-linear-progress__track {
  border-radius: 10px !important;
}

.q-linear-progress__model {
  border-radius: 10px !important;
}
</style>