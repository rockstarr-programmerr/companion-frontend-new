export function unexpectedExc (error?: unknown): void {
  if (error === undefined) {
    return
  }
  alert('An error occurred, please try again.')
  throw error
}

export function cloneDeep (object: unknown): unknown {
  /**
   * Deep clone an object
   * IMPORTANT: only works with JSON-serializable objects!!!
   */
  return JSON.parse(JSON.stringify(object))
}

export function snakeCaseToCamelCase (text: string): string {
  let words = text.split('_')
  words = words.map((word, index) => {
    if (index === 0) return word
    return word.slice(0, 1).toUpperCase() + word.slice(1)
  })
  return words.join('')
}

export function toTitleCase (text: string | undefined, separator?: string): string {
  if (text === undefined) return ''
  if (separator === undefined) separator = ' '
  let words = text.split(separator)
  words = words.map(word => {
    word = word.toLowerCase()
    return word.slice(0, 1).toUpperCase() + word.slice(1)
  })
  return words.join(' ')
}

// NOTE: This variable is used in `debounce` function
// and it's important that it is OUTSIDE of the function
let debounceTimer: number | undefined = undefined

export function debounce (func: CallableFunction, miliseconds: number): CallableFunction {
  return (...args: unknown[]) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      // @ts-expect-error don't care
      func.apply(this, args)
    }, miliseconds)
  }
}

export function formatDatetime (datetimeStr: unknown): string {
  if (typeof datetimeStr === 'string') {
    const datetime = new Date(datetimeStr)
    return `${datetime.toLocaleDateString()} ${datetime.toLocaleTimeString()}`
  } else {
    return ''
  }
}
