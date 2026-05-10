import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
  dishId: string
  dishName: string
  price: number
  quantity: number
  shopId: string
  shopName: string
  dishPhoto: string
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadFromStorage())

  function loadFromStorage(): CartItem[] {
    try {
      const saved = localStorage.getItem('cart_items')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  function saveToStorage() {
    localStorage.setItem('cart_items', JSON.stringify(items.value))
  }

  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const groupedByShop = computed(() => {
    const groups: Record<string, { shopId: string; shopName: string; items: CartItem[]; subtotal: number }> = {}
    for (const item of items.value) {
      if (!groups[item.shopId]) {
        groups[item.shopId] = { shopId: item.shopId, shopName: item.shopName, items: [], subtotal: 0 }
      }
      groups[item.shopId].items.push(item)
      groups[item.shopId].subtotal += item.price * item.quantity
    }
    return Object.values(groups)
  })

  function addToCart(dish: {
    dishId: string
    dishName: string
    price: number
    dishPhoto?: string
  }, shopId: string, shopName: string) {
    const existing = items.value.find(i => i.dishId === dish.dishId)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({
        dishId: dish.dishId,
        dishName: dish.dishName,
        price: dish.price,
        quantity: 1,
        shopId,
        shopName,
        dishPhoto: dish.dishPhoto || ''
      })
    }
    saveToStorage()
  }

  function removeFromCart(dishId: string) {
    items.value = items.value.filter(i => i.dishId !== dishId)
    saveToStorage()
  }

  function updateQuantity(dishId: string, qty: number) {
    if (qty <= 0) {
      removeFromCart(dishId)
      return
    }
    const item = items.value.find(i => i.dishId === dishId)
    if (item) {
      item.quantity = qty
    }
    saveToStorage()
  }

  function clearShopItems(shopId: string) {
    items.value = items.value.filter(i => i.shopId !== shopId)
    saveToStorage()
  }

  function clearCart() {
    items.value = []
    saveToStorage()
  }

  function getShopItemCount(shopId: string) {
    return items.value
      .filter(i => i.shopId === shopId)
      .reduce((sum, i) => sum + i.quantity, 0)
  }

  function getDishQuantity(dishId: string) {
    const item = items.value.find(i => i.dishId === dishId)
    return item ? item.quantity : 0
  }

  return {
    items,
    totalCount,
    totalPrice,
    groupedByShop,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearShopItems,
    clearCart,
    getShopItemCount,
    getDishQuantity
  }
})
