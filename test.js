// const opn = require('opn')

// opn('https://google.com').then(()=> {
//   console.log('closed')
// })

const Browser = require('node-browser')
const browser = new Browser({name:'chrome'})

browser.open('https://google.com').then(() => {
  console.log('here')
})