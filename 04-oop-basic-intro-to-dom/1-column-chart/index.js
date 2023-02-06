export default class ColumnChart {
  chartHeight = 50
  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = data => data
  } = {}) {
    this.data = data
    this.label = label
    this.link = link
    this.value = formatHeading(value)
    this.render()
  }
  render () {
    const element = document.createElement('div')
    element.innerHTML = this.getTemplate()
    this.element = element.firstElementChild
    if (this.data.length !== 0) return this.element.classList.remove('column-chart_loading')
  }

  getTemplate () {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: 50">
        <div class="column-chart__title">${this.label.trim()}${this.getLink()}</div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.value}</div>
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

  update (data) {
    this.data = data
    if (this.data.length !== 0) return this.element.classList.remove('column-chart_loading')
    this.element.innerHTML = this.getTemplate()
  }

  remove() {
    this.element.remove()
  }

  destroy() {
    this.remove()
  }
}
