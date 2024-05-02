export const meassureText = (text: string, reference: HTMLElement) => {
  const element = document.createElement("span")

  element.style.font = window.getComputedStyle(reference).font
  element.style.display = "inline"
  element.style.position = "absolute"
  element.style.opacity = "0"
  element.style.whiteSpace = "preserve"
  element.style
  element.innerHTML = text

  document.body.appendChild(element)

  const width = element.offsetWidth
  const height = element.offsetHeight

  document.body.removeChild(element)

  return { width, height }
}
