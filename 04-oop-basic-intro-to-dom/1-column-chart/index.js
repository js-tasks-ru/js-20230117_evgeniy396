export default class ColumnChart {
  chartHeight = 50
  data = {
    data: [],
    label: '',
    link: '',
    value: 0,
    formatHeading: data => data
  }
  constructor(obj) {
    Object.assign(this.data, obj)
    this.render()
  }
  render () {
    this.element = document.createElement('div')
    this.element.className = 'column-chart'
    this.element.style = `--chart-height: ${this.chartHeight}`
    this.element.innerHTML = this.getTemplate()
  }

  getTemplate () {
    return `
      <div class="column-chart__title">${this.data.label.trim()}${this.getLink()}</div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.data.formatHeading(this.data.value)}</div>
        <div data-element="body" class="column-chart__chart">
          ${this.getChartList()}
        </div>
      </div>
    `
  }

  getLink () {
    return this.data.link ? `<a class="column-chart__link" href="${this.data.link}">View all</a>` : ''
  }

  getChartList () {
    if (this.data.data.length === 0) return this.element.classList.add('column-chart_loading')
    const maxValue = Math.max(...this.data.data)
    const scale = 50 / maxValue
    return this.data.data.map(item => {
      const percent = (item / maxValue * 100).toFixed(0) + '%'
      const value = String(Math.floor(item * scale))
      return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`
    }).join('')
  }

  update (data) {
    Object.assign(this.data.data, data)
    this.element.innerHTML = this.getTemplate()
  }

  remove() {
    this.element.remove()
  }

  destroy() {
    this.remove()
  }
}
