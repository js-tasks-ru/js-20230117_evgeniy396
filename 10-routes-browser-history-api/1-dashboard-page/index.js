import RangePicker from './components/range-picker/src/index.js'
import SortableTable from './components/sortable-table/src/index.js'
import ColumnChart from './components/column-chart/src/index.js'
import header from './bestsellers-header.js'

import fetchJson from './utils/fetch-json.js'

const BACKEND_URL = 'https://course-js.javascript.ru/'

export default class Page {
  url = new URL('api/dashboard/bestsellers', BACKEND_URL)
  subElements = null

  render() {
    const element = document.createElement('div')
    element.innerHTML = this.getTemplate()
    this.element = element.firstElementChild
    this.subElements = this.getSubElements(element.firstElementChild)
    this.createComponents()
    this.initEventListeners()
    return this.element
  }

  getTemplate () {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>
        <h3 class="block-title">Best sellers</h3>
        <div data-element="sortableTable"></div>
      </div>
    `
  }

  createComponents() {
    const now = new Date()
    const to = new Date()
    const from = new Date(now.setMonth(now.getMonth() - 1))

    const rangePicker = new RangePicker({ from, to })

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true
    })

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from,
        to
      },
      label: 'orders',
      link: '#'
    })

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      label: 'sales',
      range: {
        from,
        to
      }
    })

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      label: 'customers',
      range: {
        from,
        to
      }
    })

    this.components = {
      sortableTable,
      ordersChart,
      salesChart,
      customersChart,
      rangePicker
    }

    Object.keys(this.components).forEach(componentKey => {
      const componentElement = this.subElements[componentKey]
      componentElement.append(this.components[componentKey].element)
    })
  }

  initEventListeners () {
    this.components.rangePicker.element.addEventListener('date-select', (event) => {
      this.onRangeChanged(event)
    })
  }

  async onRangeChanged(event) {
    const { from, to } = event.detail
    const data = await this.loadData(from, to)

    this.components.sortableTable.update(data)
    this.components.ordersChart.update(from, to)
    this.components.salesChart.update(from, to)
    this.components.customersChart.update(from, to)
  }

  loadData (from, to) {
    this.url.searchParams.set('_start', '1')
    this.url.searchParams.set('_end', '21')
    this.url.searchParams.set('_sort', 'title')
    this.url.searchParams.set('_order', 'asc')
    this.url.searchParams.set('from', from.toISOString())
    this.url.searchParams.set('to', to.toISOString())
    return fetchJson(this.url)
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

  destroy () {
    this.remove()
    this.element = null
    this.subElements = {}
    Object.values(this.components).forEach(component => component.destroy())
  }
}
