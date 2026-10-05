'use strict'

const places = {
  dwarka: [28.5921, 77.046], noida: [28.5355, 77.391], 'greater noida': [28.4744, 77.504],
  gurugram: [28.4595, 77.0266], gurgaon: [28.4595, 77.0266], faridabad: [28.4089, 77.3178],
  ghaziabad: [28.6692, 77.4538], indirapuram: [28.646, 77.369], 'vasant kunj': [28.52, 77.158],
  saket: [28.5245, 77.2066], rohini: [28.7495, 77.0565], janakpuri: [28.6219, 77.0878],
  'lajpat nagar': [28.5677, 77.243], 'connaught place': [28.6315, 77.2167], 'mayur vihar': [28.6082, 77.2955],
  'karol bagh': [28.6519, 77.1909], pitampura: [28.7007, 77.131], delhi: [28.6139, 77.209], meerut: [28.9845, 77.7064],
}

function locate(text) {
  const t = text.toLowerCase()
  const key = Object.keys(places).sort((a, b) => b.length - a.length).find((k) => t.includes(k))
  const base = key ? places[key] : [28.6139, 77.209]
  const j = () => (Math.random() - 0.5) * (key ? 0.02 : 0.25)
  return [base[0] + j(), base[1] + j()]
}

console.log('Dwarka:', locate('I live in Dwarka'))
console.log('Unknown:', locate('Somewhere far away'))
console.log('Noida:', locate('Noida Extension area'))
