// Winter Season Effect (December, January, February)
export const winterEffect = {
  name: 'Winter Snow',
  icon: 'mdi-snowflake',
  particleCount: 50,
  particle: '❄',
  color: '#fff',
  sizes: [10, 11, 12, 13, 14, 15, 16],
  durations: [8, 9, 10, 11, 12, 13],
  delays: [0, 0.5, 0.8, 1, 1.2, 1.5, 1.8, 2, 2.2, 2.5, 2.7],
  shadow: '0 0 5px rgba(255, 255, 255, 0.8)',
  animation: 'fall',
  customStyles: ''
}

export const winterAnimation = `
@keyframes fall {
  0% {
    top: -10%;
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}
`
