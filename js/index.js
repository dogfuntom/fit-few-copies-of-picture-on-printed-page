'use strict'

// Handle the print button.
/** @type { HTMLFormElement } */
const printForm = document.querySelector('form#main-form')
printForm.addEventListener('submit', (event) => {
  if (printForm.reportValidity()) {
    event.preventDefault()
    window.print()
  }
})

// When the viewport is shallow (short) and the page simulator "jumps down" (flexbox overflow)
// the latter "disappears" by ending up "out of bounds" of the former.
// This probably can be confusing (at least the first time it happens).
const intersectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) continue

      // Find a picture copy or the watermark-like text
      // (both are fine, the former is more relevant but the latter is the only option after reset button is clicked)
      // by finding a sibling-less childless descendant.
      const loneDescendant = entry.target.querySelector(
        '*:only-child:not(:has(*))'
      )

      // Hint: the (first) parameter is "alignToTop".
      loneDescendant.scrollIntoView(false)

      // After this is happened/done once, the potential annoyance probably outweighs potential confusion, so now dispose of all this completely.
      intersectionObserver.disconnect()
      return
    }
  },
  {
    rootMargin: '-4%',
  }
)
const pageRoot = document.querySelector('#page')
console.assert(pageRoot != null, pageRoot)
intersectionObserver.observe(pageRoot)
