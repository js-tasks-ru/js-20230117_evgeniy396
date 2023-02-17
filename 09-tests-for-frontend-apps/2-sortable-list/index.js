export default class SortableList {
  element = null
  tappedEl = null
  placeholder = null
  current = null
  startX = null
  startY = null
  controller = new AbortController()
  constructor( elements = { items: [] } = {} ) {
    this.items = elements.items
    this.render()
  }

  render() {
    const element = document.createElement("div")
    element.innerHTML = this.getTemplate()
    this.element = element.firstElementChild
    this.initEventsListener()
  }

  initEventsListener () {
    this.element.addEventListener('pointerdown', this.tapElem, { signal: this.controller.signal })
  }

  getTemplate() {
    return `
      <ul class="sortable-list">
        ${this.getItems()}
      </ul>
    `
  }

  getItems () {
    return this.items.map(item => {
      item.classList.add("sortable-list__item")
      return item.outerHTML
    }).join("")
  }

  tapElem = (event) => {
    this.tappedEl = event.target.closest('.sortable-list__item')
    if (!this.tappedEl) return
    event.preventDefault()
    if (event.target.closest('[data-delete-handle]')) {
      this.tappedEl.remove()
      return
    }

    if (event.target.closest('[data-grab-handle]')) {
      this.startX = event.clientX - this.tappedEl.getBoundingClientRect().left
      this.startY = event.clientY - this.tappedEl.getBoundingClientRect().top
      this.moveElement()
    }
  }

  moveElement = () => {
    this.placeholder = document.createElement('div')
    this.placeholder.classList.add('sortable-list__placeholder')
    this.placeholder.style.height = this.tappedEl.offsetHeight +'px'
    this.placeholder.style.width = this.element.offsetWidth + 'px'
    this.tappedEl.after(this.placeholder)
    this.tappedEl.classList.add('sortable-list__item_dragging')
    console.log(this.element.offsetWidth)
    this.tappedEl.style.width = this.element.offsetWidth + 'px'
    document.addEventListener('pointermove', this.eventsMove, { signal: this.controller.signal })
    document.addEventListener('pointerup', this.eventsUp, { signal: this.controller.signal })
  }

  eventsMove = (event) => {
    this.tappedEl.style.left = event.pageX - this.startX + 'px'
    this.tappedEl.style.top = event.pageY - this.startY + 'px'
    const elem = document.elementFromPoint(this.startX, event.clientY)
    console.log(elem, 'elem')
    if (elem) {
      this.current = document.elementFromPoint(this.startX, event.clientY).closest('.sortable-list__item')
    }
    if (this.current) {
      const currentRect = this.current.getBoundingClientRect()
      if (event.clientY > currentRect.top - currentRect.height / 2) {
        this.current.after(this.placeholder)
      } else if (event.clientY < currentRect.top + currentRect.height / 2) {
        this.current.before(this.placeholder)
      }
    }
  }

  eventsUp = () =>{
    document.removeEventListener('pointermove', this.eventsMove, { signal: this.controller.signal })
    this.placeholder.replaceWith(this.tappedEl)
    this.tappedEl.classList.remove('sortable-list__item_dragging')
    this.tappedEl.style.top = ''
    this.tappedEl.style.left = ''
    this.placeholder.remove()
  }

  remove () {
    if (this.element) {
      this.element.remove()
    }
  }

  destroy () {
    this.remove()
    this.controller.abort()
  }
}
