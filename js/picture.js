'use strict'

// Encapsulate under one API both button/dialog and drag&drop ways for a user to set picture file.
class PictureInput {
  #onFilesChange = () => {}

  /**
   * @callback DragEventListener
   * @param {Node} this
   * @param {DragEvent} ev
   * @returns {any}
   */

  /**
   * @param {HTMLInputElement} pictureFileInput
   * @param {HTMLElement | Document | Window | SVGElement | { addEventListener: ( (type: 'dragenter' | 'dragover' | 'drop', listener: DragEventListener) => any ) }} dropZone
   */
  constructor(pictureFileInput, dropZone) {
    this.pictureFileInput = pictureFileInput
    this.dropZone = dropZone

    // (the variable holding event-handler is mutable and therefor must be accessed each time (not read once), hence the wrapper)
    this.pictureFileInput.addEventListener('change', () =>
      this.#onFilesChange()
    )

    this.dropZone.addEventListener('dragenter', (e) => {
      e.stopPropagation()
      // Aside: why `.preventDefault()` is needed: https://devdocs.io/dom/html_drag_and_drop_api/drag_operations#specifying_drop_targets
      e.preventDefault()
    })
    this.dropZone.addEventListener('dragover', (e) => {
      e.stopPropagation()
      e.preventDefault()
      // Semantically, the relationship is 'link' because can't print it if it is moved after dropping.
      // And certainly not 'move' because there are no side effects on source side.
      // However, still not sure if this is a good idea to specify it
      // because it's simply so unusual to see non-default drop effect that it can be only more confusing.
      e.dataTransfer.dropEffect = 'link'
    })

    this.dropZone.addEventListener('drop', (e) => {
      e.stopPropagation()
      e.preventDefault()
      this.pictureFileInput.files = e.dataTransfer.files
      this.#onFilesChange()
    })
  }

  get files() {
    return this.pictureFileInput.files
  }

  // A lowercase name to mimic old event handler attributes (a.k.a. `oneventname`), which is a notion that is both nicely simple and perfectly enough in this case.
  // spell-checker:words onfileschange
  get onfileschange() {
    return this.#onFilesChange
  }
  set onfileschange(value) {
    this.#onFilesChange = value
  }
}

const pictureInput = new PictureInput(
  document.querySelector('input#picture-file'),
  document.body
)

const repetitionInput = {
  columnCount: /** @type {HTMLInputElement} */ (
    document.querySelector('input#count-of-columns')
  ),
  rowCount: /** @type {HTMLInputElement} */ (
    document.querySelector('input#count-of-rows')
  ),

  get totalCountValueAsNumber() {
    return this.columnCount.valueAsNumber * this.rowCount.valueAsNumber
  },
}

// Image output
const clones = {
  template: document.querySelector('template'),
  /** @type {Element | ParentNode} */
  container: null,

  objectURL: '',
  count: 3 * 4,

  update() {
    const clones = []

    for (let i = 0; i < this.count; i++) {
      const clone = /** @type {Element} */ (
        this.template.content.cloneNode(true)
      )

      const img = clone.querySelector('img')
      if (this.objectURL) img.src = this.objectURL

      clones.push(clone)
    }

    if (this.container == null) this.container = this.template.parentNode
    this.container.replaceChildren(...clones)
  },
}

// Calling our "event handler" manually immediately is needed to support normal reload (as opposed to version with override/ignore cache)
// (I.e. the scenario when inputs are already set to non-default values without us being notified about it via events.)
pictureInput.onfileschange = handleFiles
handleFiles()

repetitionInput.columnCount.addEventListener('change', handleCounts)
repetitionInput.rowCount.addEventListener('change', handleCounts)
handleCounts()

function handleCounts() {
  document.documentElement.style.setProperty(
    '--cells-in-row',
    repetitionInput.columnCount.value
  )

  clones.count = repetitionInput.totalCountValueAsNumber
  clones.update()
}

function handleFiles() {
  // Handle the first picture file (if any)
  for (const file of Array.from(pictureInput.files)) {
    if (file.type.startsWith('image/')) {
      // Aside: We're not following a common practice of revoking in HTMLImageElement.onload because revoked pictures can't be printed (at least in Firefox).
      //   (Hence, instead, we revoke only when replacing the picture with newer one.)
      URL.revokeObjectURL(clones.objectURL)

      clones.objectURL = URL.createObjectURL(file)
      clones.update()
      break
    }
  }
}

// spell-checker:enableCompoundWords
