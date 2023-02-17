export default class SortableTable {
  subElements = {}
  constructor(headerConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headerConfig
    this.data = data
    this.sorted = sorted
    this.render()
  }

  render () {
    const element = document.createElement('div')
    element.innerHTML = this.getTemplate()
    this.element = element.firstElementChild
    this.subElements = this.getSubElements(element.firstElementChild)
    this.sortEvents()
  }

  sortEvents () {
    this.sort(this.sorted)
    this.subElements.header.addEventListener("pointerdown", (event) => {
      const eventEl = event.target.closest('.sortable-table__cell')
      if (eventEl.dataset.sortable === 'false') {
        return
      }
      this.sorted = {
        id: eventEl.dataset.id,
        order: this.sorted.order === "asc" ? "desc" : "asc",
      }
      this.sort(this.sorted)
    })
  }

  sort ({id, order = 'asc'}) {
    const sortedArray = this.getSortedArray({id, order})
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]')
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`)

    allColumns.forEach(column => {
      column.dataset.order = ''
    })

    currentColumn.dataset.order = order
    this.subElements.body.innerHTML = this.renderBody(sortedArray)
  }

  getSortedArray ({id, order} = {}) {
    const sortMethod = order === 'asc' ? 1 : -1
    const arr = [...this.data]
    const column = this.headerConfig.find(item => item.id === id)
    const { sortType } = column
    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return sortMethod * (a[id] - b[id]);
      case 'string':
        return sortMethod * a[id].localeCompare(b[id], ['ru', 'en']);
      default:
        return sortMethod * (a[id] - b[id]);
      }
    })
  }

  getTemplate () {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.renderHeader(this.headerConfig)}
          </div>
          <div data-element="body" class="sortable-table__body">
            ${this.renderBody(this.data)}
          </div>
        </div>
      </div>
    `
  }

  renderHeader (headerConfig) {
    return headerConfig.map(item => {
      return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
        <span>${item.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>`
    }).join('')
  }

  renderBody (data) {
    return data.map(item => {
      return `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.renderProduct(item)}
      </a>`
    }).join('')
  }

  renderProduct (el) {
    return this.headerConfig.map(item => {
      return item.template
        ? `${item.template(el[item.id])}`
        : `<div class="sortable-table__cell">${el[item.id]}</div>`
    }).join('')
  }


  getSubElements(element) {
    const result = {}
    const elements = element.querySelectorAll('[data-element]')

    for (const subElement of elements) {
      const name = subElement.dataset.element

      result[name] = subElement
    }

    return result
  }

  remove () {
    if (this.element) {
      this.element.remove()
    }
  }

  destroy() {
    this.remove()
    this.element = null
    this.subElements = {}
  }
}
