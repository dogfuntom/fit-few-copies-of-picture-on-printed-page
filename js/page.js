'use strict'

const pageForm = document.querySelector('form')

/** @type {HTMLInputElement} */
const widthInput = pageForm.querySelector('input#width')
/** @type {HTMLInputElement} */
const heightInput = pageForm.querySelector('input#height')

/** @type { [string, HTMLInputElement, HTMLOutputElement][] } */
const lengthSettings = [
  ['--page-width', widthInput, pageForm.elements['width-imperial']],
  ['--page-height', heightInput, pageForm.elements['height-imperial']],
  [
    '--space',
    document.querySelector('input#space'),
    pageForm.elements['space-imperial'],
  ],
]

pageForm.addEventListener('change', updateDimensions)

const swapButton = pageForm.querySelector('#swap')
swapButton.addEventListener('click', () => {
  ;[heightInput.value, widthInput.value] = [widthInput.value, heightInput.value]
  // Programmatic changes are ignored by change/input events, so must call the handler manually.
  updateDimensions()
})

const letterButton = pageForm.querySelector('#ansi-letter')
letterButton.addEventListener('click', () => {
  widthInput.valueAsNumber = 215.9
  heightInput.valueAsNumber = 279.4
  updateDimensions()
})

const a4Button = pageForm.querySelector('#iso216-a4')
a4Button.addEventListener('click', () => {
  widthInput.valueAsNumber = 210
  heightInput.valueAsNumber = 297
  updateDimensions()
})

// Calling manually at initialization in order to support "state restoration during navigation" (i.e. normal reload as opposed to "override cache" one).
updateDimensions()

function updateDimensions() {
  for (const [cssVar, input, output] of lengthSettings) {
    document.documentElement.style.setProperty(cssVar, `${input.value}mm`)

    output.value = (input.valueAsNumber / 25.4).toLocaleString(undefined, {
      style: 'unit',
      unit: 'inch',
      maximumFractionDigits: 2,
    })
  }
}
