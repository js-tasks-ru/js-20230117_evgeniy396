export default class NotificationMessage {
  static hasClass = {}
  constructor (message = '', {
      duration = 0,
      type = 'success'
    } = {}) {
    this.message = message
    this.duration = duration
    this.type = type
    this.render()
  }

  render () {
    const element = document.createElement('div')
    element.innerHTML = this.getTemplate()
    this.element = element.firstElementChild
  }

  getTemplate () {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `
  }

  show (container = document.body) {
    if (Object.hasOwn(NotificationMessage.hasClass, 'element')) {
      NotificationMessage.hasClass.remove()
    }
    container.append(this.element)
    NotificationMessage.hasClass = this
    setTimeout(() => {
      this.remove()
    }, this.duration)
  }


  remove () {
    this.element.remove()
    NotificationMessage.hasClass = {}
  }

  destroy () {
    this.remove()
  }
}
