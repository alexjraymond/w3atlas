export function downloadFile(filename: string, contents: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([contents], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function readJsonFile(file: File): Promise<unknown> {
  return JSON.parse(await file.text())
}

export function fileSafe(name: string) {
  return name.replace(/[^a-z0-9-_]+/gi, '_').replace(/^_+|_+$/g, '') || 'route'
}
