

const express = require('express')
const app = express()
const port = 5000
const isLogin = true
let addProjects = [] 


app.set('view engine', 'hbs')
app.use('/public', express.static(__dirname + '/public'))
app.use(express.urlencoded({extended: false}))

app.get('/', (req,res) => {
    res.render('index',{addProjects});
});

app.get('/contact-me', (req, res) => {
    res.render('contact-me')
})
app.post('/Project/add', (req, res) => {
    const {name, startDate,endDate,description,Tech} = req.body
    addProjects.push({
        name,
        startDate,
        endDate,
        start: new Date(startDate).toLocaleDateString(),
        end: new Date(endDate).toLocaleDateString(),
        description,
        Distime: getDistime(startDate,endDate),
        isLogin,
        Tech,
    })

    res.redirect('/')
})

app.get('/Project/add', (req, res) => {
   if(!isLogin) {
      res.redirect('/auth')
      return
   }
  res.render('Project')
})

app.get('/delete-project/:idx', (req,res) => {
  const idx = req.params.idx // idx == index
  addProjects.splice(idx,1)
  res.redirect('/')
})

app.post('/Project/edit/:id', (req,res) => {
  const id = req.params.id
  const {name,startDate,endDate,description,Tech}= req.body

  addProjects[id] = {
    ...addProjects[id],
    name,
    startDate,
    endDate,
    description,
    Tech,
  }
  res.redirect('/')
})

app.get('/Project/edit/:id', (req, res) => {
  
    const  id  = req.params.id
    const project = addProjects[id]
    res.render('Edit-project', { project: { ...project, id } })
  
})

app.get('/details-project/:id', (req, res) => {
    const { id } = req.params
    const project = addProjects[id]
    res.render('details-project', {project: {...project, id}})
})

// Not found route custome


app.listen(port, () => {
    console.log(`Personal App running on port: ${port}`);
})



// <-------------------formatTime------------------->

const getDistancetime = (format, duration) => {
  switch (format) {
    case 'year':
      return Math.floor(duration /(1000 * 60 * 60 * 24 * 30* 365))
    case 'month':
      return Math.floor(duration / (1000 * 60 * 60 * 24 * 30))
    case 'week':
      return Math.floor(duration / (1000 * 60 * 60 * 24 * 7))
    case 'day':
      return Math.floor(duration / (1000 * 60 * 60 * 24))
  }
}

const getDistime = (startDate, endDate) => {
  let duration = new Date(endDate) - new Date(startDate)

  const distance = {
    year: getDistancetime('year', duration),
    month: getDistancetime('month', duration),
    week: getDistancetime('week', duration),
    day: getDistancetime('day', duration),
  }
 
  if (distance.year > 0 )
    return `${distance.year} month${distance.year > 1 ? 's' : ''}`

  if (distance.month > 0 && distance.year == 0)
    return `${distance.month} month${distance.month > 1 ? 's' : ''}`

  if (distance.week > 0 && distance.month == 0)
    return `${distance.week} week${distance.week > 1 ? 's' : ''}`

  if (distance.day > 0 && distance.week == 0)
    return `${distance.day} day${distance.day > 1 ? 's' : ''}`
}