export default class ColumnChart {
  chartHeight = 50
  element = null
  subElements = {}
  value = 0
  data = []
  BASIC_URL = 'https://course-js.javascript.ru'
  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date()
    },
    label = '',
    link = '',
    formatHeading = data => data
  } = {}) {
    this.url = url
    this.range = range
    this.label = label
    this.link = link
    this.formatHeading = formatHeading
    this.render()
    this.update(this.range.from, this.range.to)
  }
  render () {
    const element = document.createElement('div')
    element.innerHTML = this.getTemplate()
    this.element = element.firstElementChild
    if (this.data.length !== 0) return this.element.classList.remove('column-chart_loading')
    this.subElements = this.getSubElements()
  }

  getTemplate () {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: 50">
        <div class="column-chart__title">${this.label}${this.getLink()}</div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
          <div data-element="body" class="column-chart__chart">
            ${this.getChartList()}
          </div>
        </div>
      </div>
    `
  }

  getLink () {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : ''
  }

  getChartList () {
    const maxValue = Math.max(...this.data)
    const scale = this.chartHeight / maxValue
    return this.data.map(item => {
      const percent = (item / maxValue * 100).toFixed(0) + '%'
      const value = String(Math.floor(item * scale))
      return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`
    }).join('')
  }

  async update (from, to) {
    try {
      const response = await fetch(`${this.BASIC_URL}/${this.url}?from=${from}&to=${to}`)
      const data = await response.json()
      this.data = Object.values(data)
      this.value = this.data.reduce((a, b) => b + a)
      if (this.data.length !== 0) {
        this.element.classList.remove('column-chart_loading')
      }
      this.subElements.header.innerHTML = this.formatHeading(this.value)
      this.subElements.body.innerHTML = this.getChartList(this.data)
      return data
    } catch(err) {
      console.error(err)
    }
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element.remove()
  }

  destroy() {
    this.remove()
  }
}

// https://course-js.javascript.ru/api/dashboard/orders?from=2023-01-11T18%3A43%3A19.402Z&to=2023-01-29T18%3A43%3A19.402Z

