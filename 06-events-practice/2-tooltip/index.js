class Tooltip {
  body = document.body
  element = null
  IDENT = 10
  static onlyInstance = null;
  constructor(){
    if(!Tooltip.onlyInstance){
      Tooltip.onlyInstance = this;
    } else {
      return Tooltip.onlyInstance;
    }
  }
  initialize () {
    const element = document.createElement('div')
    element.innerHTML = this.getTemplate()
    this.element = element.firstElementChild
    this.body.addEventListener('pointerover', this.overEvent)
  }

  render (text, container = document.body) {
    this.element.textContent = text
    container.append(this.element)
  }

  overEvent = (event) => {
    const eventEl = event.target.closest('div')
    if (!eventEl.dataset.tooltip) {
      return
    }
    this.body.removeEventListener('pointerover', this.overEvent)
    this.render(eventEl.dataset.tooltip, this.body)
    this.moveEvent(event)
    this.body.addEventListener('pointermove', this.moveEvent)
    this.body.addEventListener('pointerout', this.outEvent)
  }

  moveEvent = (event) => {
    this.element.style.top = `${event.clientY + this.IDENT}px`
    this.element.style.left = `${event.clientX + this.IDENT}px`
  }

  outEvent = () => {
    this.body.removeEventListener('pointerout', this.outEvent)
    this.body.removeEventListener('pointermove', this.moveEvent)
    this.body.addEventListener('pointerover', this.overEvent)
    this.remove()
  }

  getTemplate () {
    return `<div class="tooltip"></div>`
  }

  remove () {
    if (this.element) {
      this.element.remove()
    }
  }

  destroy () {
    this.body.removeEventListener('pointerout', this.outEvent)
    this.body.removeEventListener('pointerover', this.overEvent)
    this.remove()
    this.element = null
  }
}


export default Tooltip;
