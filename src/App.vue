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

/* Heading padding to prevent touching screen edges */
h1, h2, h3, h4, h5, h6,
.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6 {
  padding-top: 5px !important;
}

/* Ensure headings in cards and sections also have proper spacing */
.q-card-section h1,
.q-card-section h2,
.q-card-section h3,
.q-card-section h4,
.q-card-section h5,
.q-card-section h6,
.q-card-section .text-h1,
.q-card-section .text-h2,
.q-card-section .text-h3,
.q-card-section .text-h4,
.q-card-section .text-h5,
.q-card-section .text-h6 {
  padding-top: 5px !important;
}

/* Specific spacing for page headers */
.overview-title h1,
.overview-title h2,
.overview-title h3,
.overview-title h4,
.overview-title h5,
.overview-title h6,
.overview-title .text-h1,
.overview-title .text-h2,
.overview-title .text-h3,
.overview-title .text-h4,
.overview-title .text-h5,
.overview-title .text-h6 {
  padding-top: 5px !important;
}

/* Widget headers */
.widget-title h1,
.widget-title h2,
.widget-title h3,
.widget-title h4,
.widget-title h5,
.widget-title h6,
.widget-title .text-h1,
.widget-title .text-h2,
.widget-title .text-h3,
.widget-title .text-h4,
.widget-title .text-h5,
.widget-title .text-h6 {
  padding-top: 5px !important;
}

/* Calendar headers */
.calendar-title h1,
.calendar-title h2,
.calendar-title h3,
.calendar-title h4,
.calendar-title h5,
.calendar-title h6,
.calendar-title .text-h1,
.calendar-title .text-h2,
.calendar-title .text-h3,
.calendar-title .text-h4,
.calendar-title .text-h5,
.calendar-title .text-h6 {
  padding-top: 5px !important;
}

/* Greeting card headers */
.greeting-content h1,
.greeting-content h2,
.greeting-content h3,
.greeting-content h4,
.greeting-content h5,
.greeting-content h6,
.greeting-content .text-h1,
.greeting-content .text-h2,
.greeting-content .text-h3,
.greeting-content .text-h4,
.greeting-content .text-h5,
.greeting-content .text-h6 {
  padding-top: 5px !important;
}

/* Smooth transitions for all elements */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(58, 107, 140, 0.8);
}

/* Utility classes */
.cursor-pointer {
  cursor: pointer;
}

.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-fast {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-slow {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.opacity-30 {
  opacity: 0.3;
}

/* Glass-based Spasta theme classes with smooth animations */
.spasta-bg {
  background: linear-gradient(135deg, #254D70 0%, #1a3a52 50%, #0f2a3d 100%) !important;
}

.spasta-card {
  background: rgba(58, 107, 140, 0.15) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.spasta-text {
  color: #EFE4D2 !important;
}

.spasta-card-light {
  background: rgba(58, 107, 140, 0.1) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(239, 228, 210, 0.15) !important;
  border-radius: 16px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.spasta-border {
  border-color: rgba(239, 228, 210, 0.3) !important;
  border-radius: 12px !important;
}

/* Override Quasar default colors with glass effect and smooth animations */
.q-card {
  background: rgba(58, 107, 140, 0.15) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
  border-radius: 20px !important;
  color: #EFE4D2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-header {
  background: rgba(58, 107, 140, 0.2) !important;
  backdrop-filter: blur(20px) !important;
  border-radius: 20px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-drawer {
  background: rgba(37, 77, 112, 0.2) !important;
  backdrop-filter: blur(25px) !important;
  border: 1px solid rgba(239, 228, 210, 0.1) !important;
  color: #EFE4D2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-item {
  color: #EFE4D2;
  border-radius: 12px !important;
  margin: 4px 8px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-item:hover {
  background: rgba(58, 107, 140, 0.3) !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
}

.q-item.q-item--active {
  background: rgba(58, 107, 140, 0.4) !important;
  backdrop-filter: blur(15px) !important;
  color: #EFE4D2;
  border: 1px solid rgba(239, 228, 210, 0.3) !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3) !important;
}

/* Tab styling with glass effect and animations */
.q-tabs {
  background: rgba(58, 107, 140, 0.2) !important;
  backdrop-filter: blur(15px) !important;
  border-radius: 16px !important;
  border: 1px solid rgba(239, 228, 210, 0.1) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-tab {
  border-radius: 12px !important;
  margin: 4px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-tab:hover {
  background: rgba(239, 228, 210, 0.1) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
}

.q-tab--active {
  background: rgba(239, 228, 210, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3) !important;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Button styling with glass effect and smooth animations */
.q-btn {
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-btn--flat {
  background: rgba(239, 228, 210, 0.1) !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
}

.q-btn--flat:hover {
  background: rgba(239, 228, 210, 0.2) !important;
  box-shadow: 0 4px 16px rgba(239, 228, 210, 0.2) !important;
}

.q-btn:active {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

/* Chip styling with animations */
.q-chip {
  border-radius: 20px !important;
  backdrop-filter: blur(10px) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-chip:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
}

/* Menu and dialog styling with animations */
.q-menu {
  background: rgba(58, 107, 140, 0.2) !important;
  backdrop-filter: blur(25px) !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
  border-radius: 16px !important;
  animation: menuSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

@keyframes menuSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.q-dialog .q-card {
  background: rgba(37, 77, 112, 0.3) !important;
  backdrop-filter: blur(30px) !important;
  border: 2px solid rgba(239, 228, 210, 0.3) !important;
  border-radius: 24px !important;
  animation: dialogSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Icon spacing fixes */
.q-icon {
  margin-right: 8px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-btn .q-icon {
  margin-right: 4px !important;
}

.q-chip .q-icon {
  margin-right: 4px !important;
}

/* Better icon sizing with hover effects */
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

.q-icon:hover {
  filter: brightness(1.2) !important;
}

/* Enhanced Input Field Styling with glass effect and animations */
.spasta-input .q-field__control {
  background: rgba(239, 228, 210, 0.1) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(239, 228, 210, 0.3) !important;
  border-radius: 16px !important;
  min-height: 40px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.spasta-input .q-field__native {
  color: #EFE4D2 !important;
  padding: 8px 12px !important;
}

.spasta-input .q-field__label {
  color: #EFE4D2 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
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
  box-shadow: 0 4px 16px rgba(239, 228, 210, 0.1) !important;
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

/* Table styling with glass effect and animations */
.q-table {
  background: rgba(58, 107, 140, 0.1) !important;
  backdrop-filter: blur(15px) !important;
  border-radius: 20px !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-table thead th {
  background: rgba(58, 107, 140, 0.3) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-table tbody tr {
  border-radius: 8px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-table tbody tr:hover {
  background: rgba(58, 107, 140, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 0 4px 16px rgba(58, 107, 140, 0.2) !important;
}

/* Expansion item styling with animations */
.q-expansion-item {
  background: rgba(58, 107, 140, 0.1) !important;
  backdrop-filter: blur(15px) !important;
  border-radius: 16px !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
  margin: 8px 0 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-expansion-item:hover {
  box-shadow: 0 4px 16px rgba(58, 107, 140, 0.2) !important;
}

.q-expansion-item__header {
  border-radius: 16px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-expansion-item__content {
  background: rgba(58, 107, 140, 0.05) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 0 0 16px 16px !important;
  animation: expandContent 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

@keyframes expandContent {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Banner styling with animations */
.q-banner {
  border-radius: 16px !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-banner:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}

/* Separator styling */
.q-separator {
  background: rgba(239, 228, 210, 0.2) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
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

/* Floating animation for cards */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

.float-animation {
  animation: float 6s ease-in-out infinite;
}

/* Pulse animation for important elements */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}

/* Slide in animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in-left {
  animation: slideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-in-right {
  animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-in-up {
  animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
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

/* Enhanced glass effects for hover states with shadow instead of zoom */
.spasta-card:hover {
  background: rgba(58, 107, 140, 0.25) !important;
  border-color: rgba(239, 228, 210, 0.4) !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3) !important;
}

.spasta-card-light:hover {
  background: rgba(58, 107, 140, 0.2) !important;
  border-color: rgba(239, 228, 210, 0.3) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
}

/* Loading spinner with glass effect and animation */
.q-spinner-dots {
  filter: drop-shadow(0 0 10px rgba(239, 228, 210, 0.5));
  animation: pulse 2s ease-in-out infinite;
}

/* Progress bar styling with smooth animations */
.q-linear-progress {
  border-radius: 10px !important;
  backdrop-filter: blur(10px) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.q-linear-progress__track {
  border-radius: 10px !important;
}

.q-linear-progress__model {
  border-radius: 10px !important;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Calendar specific animations */
.calendar-event {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.calendar-event:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
}

/* Task card animations */
.task-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.task-card:hover {
  box-shadow: 0 8px 24px rgba(114, 92, 173, 0.4) !important;
}

/* Drag and drop animations */
.task-ghost {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.task-chosen {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.task-drag {
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Stagger animation for lists */
.stagger-item {
  animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.stagger-item:nth-child(1) { animation-delay: 0.1s; }
.stagger-item:nth-child(2) { animation-delay: 0.2s; }
.stagger-item:nth-child(3) { animation-delay: 0.3s; }
.stagger-item:nth-child(4) { animation-delay: 0.4s; }
.stagger-item:nth-child(5) { animation-delay: 0.5s; }

/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Notification animations */
.q-notification {
  animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Focus animations */
*:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(239, 228, 210, 0.3) !important;
  transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>