const express = require('express')

const app = express()

const port = 5000


app.set('view engine', 'hbs')

app.use('/public', express.static(__dirname + '/public'))

app.use(express.urlencoded({extended: false}))

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/contact-me', (req, res) => {
    res.render('contact-me')
})

app.get('/Add-Project', (req, res) => {
    res.render('Add-Project')
})
app.post('/Add-project', (req, res) => {
    const data = req.body
    console.log(data)
  
    res.redirect('/')
  })

app.get('/DetailProject/:id', (req, res) => {
    const  id  = req.params
    console.log(id)
    res.render('DetailProject')
  })



// Not found route custome
app.get('*', (req, res) => {
    res.render('not-found')
})

app.listen(port, () => {
    console.log(`Personal App running on port: ${port}`);
})