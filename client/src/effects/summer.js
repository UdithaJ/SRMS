// Summer Season Effect (June, July, August)
export const summerEffect = {
  name: 'Summer Sparkles',
  icon: 'mdi-white-balance-sunny',
  particleCount: 35,
  particle: '✨',
  color: '#FFD700',
  sizes: [10, 12, 14, 16],
  durations: [7, 8, 9, 10, 11],
  delays: [0, 0.4, 0.8, 1.2, 1.6, 2, 2.4, 2.8],
  shadow: '0 0 10px rgba(255, 215, 0, 0.8)',
  animation: 'sparkle',
  customStyles: ''
}

export const summerAnimation = `
@keyframes sparkle {
  0% {
    top: -10%;
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  10% {
    opacity: 1;
    transform: scale(1) rotate(45deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
  90% {
    opacity: 1;
    transform: scale(1) rotate(315deg);
  }
  100% {
    top: 100%;
    opacity: 0;
    transform: scale(0) rotate(360deg);
  }
}
`
