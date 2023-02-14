import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru'

export default class SortableTable {
  controller = new AbortController()
  data = []
  STEP = 30
  start = this.data.length
  end = this.start + this.STEP
  noRepeat = false
  subElements = null
  constructor(headersConfig, {
    data = [],
    url = '',
    isSortLocally= false,
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    }
  } = {}) {
    this.headersConfig = headersConfig
    this.data = data
    this.url = url
    this.isSortLocally = isSortLocally
    this.sorted = sorted
    this.render()
  }

  async render () {
    const element = document.createElement('div')
    element.innerHTML = this.getTemplate()
    this.element = element.firstElementChild
    this.subElements = this.getSubElements(element.firstElementChild)
    await this.loadData()
    window.addEventListener('scroll', this.handleInfiniteScroll, { signal: this.controller.signal })
    this.sortEvents()
  }

  handleInfiniteScroll = () => {
    const endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight
    if (endOfPage && !this.noRepeat) {
      this.noRepeat = true
      this.start = this.data.length
      this.end = this.start + this.STEP
      this.loadData(this.sorted.id, this.sorted.order)
    }

    if (!endOfPage) {
      this.noRepeat = false
    }
  }

  async loadData (id = this.sorted.id, order = this.sorted.order) {
    const url = new URL(this.url, BACKEND_URL)
    url.searchParams.set('_sort', id)
    url.searchParams.set('_order', order)
    url.searchParams.set('_start', this.start)
    url.searchParams.set('_end', this.end)
    await this.getData(url.toString())
  }

  async getData (url) {
    const response = await fetch(url.toString())
    const data = await response.json()
    this.data = this.data.concat(data)
    this.update(this.data)
    return this.data
  }

  update (data) {
    this.subElements.header.innerHTML = this.renderHeader(this.headersConfig)
    this.subElements.body.innerHTML = this.renderBody(data)
  }

  getTemplate () {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.renderHeader(this.headersConfig)}
          </div>
          <div data-element="body" class="sortable-table__body">
            ${this.renderBody(this.data)}
          </div>
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        </div>
      </div>
    `
  }

  renderHeader (headersConfig) {
    return headersConfig.map(item => {
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
    return this.headersConfig.map(item => {
      return item.template
        ? `${item.template(el[item.id])}`
        : `<div class="sortable-table__cell">${el[item.id]}</div>`
    }).join('')
  }

  sortEvents () {
    this.subElements.header.addEventListener("pointerdown", (event) => {
      const eventEl = event.target.closest('.sortable-table__cell')
      if (eventEl.dataset.sortable === 'false') {
        return
      }
      this.sorted = {
        id: eventEl.dataset.id,
        order: this.sorted.order === "asc" ? "desc" : "asc",
      }
      if (this.isSortLocally) {
        this.sortOnClient(this.sorted.id, this.sorted.order)
      } else {
        this.sortOnServer(this.sorted.id, this.sorted.order)
      }
    }, { signal: this.controller.signal })
  }

  sortOnClient (id, order = 'asc') {
    const sortedArray = this.getSortedArray(id, order)
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]')
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`)

    allColumns.forEach(column => {
      column.dataset.order = ''
    })

    currentColumn.dataset.order = order
    this.subElements.body.innerHTML = this.renderBody(sortedArray)
  }

  getSortedArray (id, order) {
    const sortMethod = order === 'asc' ? 1 : -1
    const arr = [...this.data]
    const column = this.headersConfig.find(item => item.id === id)
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

  async sortOnServer (id, order ) {
    this.data = []
    await this.loadData(id, order)
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
    this.remove();
    this.element = null;
    this.subElements = {}
    this.controller.abort()
  }
}
