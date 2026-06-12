/** 测量 Header 高度，用于上下半区视觉平衡补偿 */
export function useTableChromeOffset(getHeaderEl: () => HTMLElement | null | undefined) {
  const chromeOffset = ref(0)
  let observer: ResizeObserver | null = null

  function bind(el: HTMLElement | null | undefined) {
    observer?.disconnect()
    observer = null

    if (!el) {
      chromeOffset.value = 0
      return
    }

    const update = () => {
      chromeOffset.value = el.offsetHeight
    }

    update()
    observer = new ResizeObserver(update)
    observer.observe(el)
  }

  watch(getHeaderEl, (el) => bind(el ?? null), { immediate: true })

  onUnmounted(() => observer?.disconnect())

  return { chromeOffset }
}
