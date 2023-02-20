import SortableList from '../2-sortable-list/index.js'
import escapeHtml from './utils/escape-html.js'
import fetchJson from './utils/fetch-json.js'

const IMGUR_CLIENT_ID = '28aaa2e823b03b1'
const BACKEND_URL = 'https://course-js.javascript.ru'

export default class ProductForm {
  controller = new AbortController()
  element = null
  imageTemplate = null
  subElements = null
  categories = null
  product = null
  categoriesLink = 'api/rest/categories'
  productsLink = 'api/rest/products'
  SORT_PARAMS = 'weight'
  REF_PARAMS = 'subcategory'
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0,
    images: []
  }
  constructor (productId) {
    this.productId = productId
  }

  async render () {
    await this.getCategories()
    const element = document.createElement('div')
    element.innerHTML = this.getTemplate(this.product ? this.product : this.defaultFormData)
    this.element = element.firstElementChild
    this.subElements = this.getSubElements(element.firstElementChild)
    if (this.productId) {
      await this.getProducts()
    }
    this.initEventListener()
    return this.element
  }

  initEventListener () {
    const { productForm, uploadImage } = this.subElements

    productForm.addEventListener('submit', this.onSubmit, {signal: this.controller.signal})
    uploadImage.addEventListener('click', this.uploadImage, {signal: this.controller.signal})
  }

  getTemplate (data) {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
            </div>
            <button data-element="uploadImage" type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory" id="subcategory">
              ${this.categoriesData()}
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" id="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `
  }

  categoriesData () {
    return this.categories.map(category => {
      return category.subcategories.map(subcategory => {
        return `<option value="${subcategory.id}">${category.title} > ${subcategory.title}</option>`
      }).join('')
    }).join('')
  }

  async getCategories () {
    const url = new URL(this.categoriesLink, BACKEND_URL)
    url.searchParams.set('_sort', this.SORT_PARAMS)
    url.searchParams.set('_refs', this.REF_PARAMS)
    const response = await fetch(url.toString())
    this.categories = await response.json()
    return this.categories
  }

  async getProducts () {
    const url = new URL(this.productsLink, BACKEND_URL)
    url.searchParams.set('id', this.productId)
    const response = await fetch(url.toString())
    const products = await response.json()
    this.product = products[0]
    this.setProduct(this.product)
    return this.product
  }

  setProduct (product) {
    const productArr = Object.entries(product)
    const { productForm } = this.subElements
    productArr.forEach(item => {
      const [field, value] = item
      if (productForm.querySelector(`#${field}`) && field !== 'images') {
        productForm.querySelector(`#${field}`).value = value
      } else if (field === 'images' && value.length !== 0) {
        this.getImages(product.images)
      }
    })
  }
  uploadImage = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'

    fileInput.addEventListener('change', async () => {
      const [file] = fileInput.files
      if (file) {
        const formData = new FormData()
        const { uploadImage, imageListContainer } = this.subElements
        formData.append('image', file)
        uploadImage.classList.add('is-loading')
        uploadImage.disabled = true
        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
          referrer: ''
        })
        console.log(result.data.link, file.name)
        imageListContainer.firstElementChild.append(this.imageTeplate(result.data.link, file.name))
        uploadImage.classList.remove('is-loading')
        uploadImage.disabled = false

        fileInput.remove()
      }
    })
    fileInput.hidden = true
    document.body.append(fileInput)
    fileInput.click()
  }
  imageTeplate (url, source) {
    const wrapper = document.createElement('div')

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(source)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(source)}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`

    return wrapper.firstElementChild
  }

  getImages (images) {
    console.log(images)
    const { imageListContainer } = this.subElements
    const items = images.map(({ url, source }) => this.imageTeplate(url, source))
    const sortableList = new SortableList({
      items
    })
    imageListContainer.append(sortableList.element)
  }

  dispatchEvent(productId) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: productId })
      : new CustomEvent('product-saved')

    this.element.dispatchEvent(event)
  }

  async save() {
    const product = this.saveProduct()
    const url = new URL(this.productsLink, BACKEND_URL)
    try {
      const result = await fetchJson(url, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      })

      this.dispatchEvent(result.id)
    } catch (error) {
      console.error('Ошибка сохранения', error)
    }
  }

  saveProduct() {
    const product = this.productId ? this.product : this.defaultFormData
    const productArr = Object.entries(product)
    const { productForm, imageListContainer } = this.subElements
    productArr.forEach(item => {
      const [field, value] = item
      const formEl = productForm.querySelector(`#${field}`)
      if (formEl && field !== 'images') {
        product[field] = typeof value === 'number' ? parseInt(formEl.value) : formEl.value
      } else if (field === 'images') {
        const images = []

        const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img')
        for (const image of imagesHTMLCollection) {
          images.push({
            url: image.src,
            source: image.alt
          })
        }
        product[field] = images
      }
    })
    return product
  }


  onSubmit = event => {
    event.preventDefault()
    this.save()
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
    this.controller.abort()
  }
}
