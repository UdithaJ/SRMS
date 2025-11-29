// Spring Season Effect (March, April, May)
export const springEffect = {
  name: 'Spring Blossoms',
  icon: 'mdi-flower',
  particleCount: 40,
  particle: '🌸',
  color: '#FFB7D5',
  sizes: [12, 14, 16, 18, 20],
  durations: [10, 11, 12, 13, 14, 15],
  delays: [0, 0.5, 1, 1.5, 2, 2.5, 3],
  shadow: '0 0 8px rgba(255, 182, 193, 0.6)',
  animation: 'floatDown',
  customStyles: 'transform: rotate(var(--rotate-angle, 0deg));'
}

export const springAnimation = `
@keyframes floatDown {
  0% {
    top: -10%;
    opacity: 0;
    transform: rotate(0deg) translateX(0);
  }
  10% {
    opacity: 1;
  }
  50% {
    transform: rotate(180deg) translateX(30px);
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
    transform: rotate(360deg) translateX(0);
  }
}
`
