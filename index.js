const express = require('express')
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash= require('express-flash')

const db = require('./connection/db')

const app = express()
const port = 5000
// const isLogin = true
let addProjects = []

app.use(flash())

app.use(session({
    secret: 'rahasia',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 60 * 60}
}))

// Testing connection database
db.connect((error,client,done) => {
  if (error) {
    return console.log(error);
  }
  console.log('Connection db success');
  done()
})

app.set('view engine', 'hbs')
app.use('/public', express.static(__dirname + '/public'))
app.use(express.urlencoded({extended: false}))



app.get('/', (req,res) => {

  
  db.connect((err,client, done) => {
    if (err) throw err

    const query = `SELECT * FROM tb_projects ORDER BY id ASC`


    client.query(query,(err,result) => {
      if (err) throw err

      const data = result.rows;

      const newProjects = data.map((project) => {
        const newProject = {
          ...project,
          Distime: getDistime(project.start_date, project.end_date),
        isLogin: req.session.isLogin
        }
        return newProject
      })
      res.render('index',{user: req.session.user, isLogin: req.session.isLogin, addProjects: newProjects})

      })
      done()
    
    })
  })

app.get('/contact-me', (req, res) => {
    res.render('contact-me')
})
app.post('/Project/add', (req, res) => {
    const {name, startDate,endDate,description,Tech} = req.body
    db.connect((err,client,done) => {
      if(err) throw err
      
      const query = `INSERT INTO tb_projects (name,start_date,end_date,description,"Tech")
      VALUES ('${name}','${startDate}','${endDate}','${description}','{${Tech}}')`;

      client.query(query, (err) =>{
        if (err) throw err
        done()

        res.redirect('/')
     })
   })
 })

app.get('/Project/add', (req, res) => {
  res.render('Project')
})

app.get('/delete-project/:id', (req,res) => {
  const id = req.params.id

  db.connect((err, client, done) => {
    if(err) throw err;

    const query =`DELETE FROM tb_projects WHERE id = ${id};`
    client.query(query, (err) => {
      
      if(err) throw err
      done()
      
      res.redirect('/')
    })
    
  }) 
})

app.post('/Project/edit/:id', (req,res) => {
  
  const {name, startDate,endDate,description,Tech} = req.body

  const id = req.params.id

  db.connect((err,client,done) => {
    if(err) throw err
    
    const query = `UPDATE public.tb_projects SET 
    name ='${name}',
    start_date = '${startDate}',
    end_date ='${endDate}',
    description = '${description}',
    "Tech" ='{${Tech}}'
    WHERE id = ${id};`

    

    client.query(query, (err) =>{
      if (err) throw err
      done()
  
    res.redirect('/');
   })
 })
})

app.get("/Project/edit/:id", (req, res) => {
  const id = req.params.id;

  db.connect((err, client, done) => {
    if (err) throw err;

    const query = `SELECT * FROM tb_projects WHERE id = ${id}`;

    client.query(query, (err, result) => {
      if (err) throw err;

      done();
      // console.log(result.rows[0]);
      res.render("Edit-project", { Data: result.rows[0] });
    });
  });
  // console.log("data menta updatep:", Data);
});


app.get('/details-project/:id', (req, res) => {
  const id = req.params.id;
  // const { title, start_date, end_date, description, technologies } = req.body;
  db.connect((err, client, done) => {
    if (err) console.log(err);
    const query = `SELECT * FROM tb_projects WHERE id = ${id}`;

    client.query(query, (err, result) => {
      done();
      if (err) throw err;

      let project = result.rows[0]

        project = {
          ...project,
          Distime: getDistime(project.start_date, project.end_date),
          start_date: new Date(project.start_date),
          end_date: new Date(project.end_date),
        }

      
      res.render("details-project", { project });
    });
  });
});

// Not found route custome

app.get('/register',(req,res) =>{
  res.render('register')
})

app.post('/register',(req,res)=>{
    const { name,email,password} = req.body;

    const hashPassword = bcrypt.hashSync(password, 10)

    db.connect((err,client,done) =>{
      if (err) throw err

      const query =`INSERT INTO tb_user(name, email, password) 
                    VALUES ('${name}','${email}','${hashPassword}');`
      client.query(query, (err)=>{
        if (err) throw err
      })
      done()
      req.flash('success', `Email: <b>${email}</b> has been registered ✅`)
      res.redirect('/login')
    })
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', (req,res) =>{
  const {email, password} = req.body

  if(email == '' || password == '') {
    req.flash('warning','Please insert all fields')
    return res.redirect('/login')
  }

   db.connect((err,client,done)=>{
    if (err) throw err

    const query =`SELECT * FROM tb_user WHERE email = '${email}'`
    client.query(query, (err, result) =>{
      if (err) throw err

      const data = result.rows


      // check email
      if (data.length == 0) {
        req.flash('error', `Email: <b>${email}</b> not found`)
        return res.redirect('/login')
      }

      // check password
      const isMatch = bcrypt.compareSync(password, data[0].password)

      if (isMatch == false) {
        req.flash('error', `Password Wrong!`)
        return res.redirect('/login')
      }

      // Store data tosession
      req.session.isLogin = true
      req.session.user = {
        id: data[0].id,
        email: data[0].email,
        name: data[0].name
      }

      res.redirect('/')
    })
   })
})

app.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

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