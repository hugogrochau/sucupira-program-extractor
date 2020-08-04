import https from 'https'

export const fetchPageHtml = (url: string): Promise<string> => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    res.setEncoding('utf8')
    let body = ''
    res.on('data', (data) => {
      body += data
    })
    res.on('end', () => resolve(body))
    res.on('error', reject)
  })
})
