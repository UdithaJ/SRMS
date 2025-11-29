// Autumn Season Effect (September, October, November)
export const autumnEffect = {
  name: 'Autumn Leaves',
  icon: 'mdi-leaf',
  particleCount: 45,
  particle: '🍂',
  color: '#FF8C42',
  sizes: [14, 16, 18, 20, 22],
  durations: [9, 10, 11, 12, 13, 14],
  delays: [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1, 2.4],
  shadow: '0 0 6px rgba(255, 140, 66, 0.5)',
  animation: 'leafFall',
  customStyles: ''
}

export const autumnAnimation = `
@keyframes leafFall {
  0% {
    top: -10%;
    opacity: 0;
    transform: rotate(0deg) translateX(0);
  }
  10% {
    opacity: 0.9;
  }
  25% {
    transform: rotate(-45deg) translateX(-20px);
  }
  50% {
    transform: rotate(45deg) translateX(20px);
  }
  75% {
    transform: rotate(-30deg) translateX(-15px);
  }
  90% {
    opacity: 0.9;
  }
  100% {
    top: 100%;
    opacity: 0;
    transform: rotate(90deg) translateX(10px);
  }
}
`
