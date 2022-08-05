const express = require('express')
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash= require('express-flash')

const db = require('./connection/db')
const upload = require('./middlewares/uploadFile')

const app = express()
const port = 5000
const PATH = 'http://localhost:5000/uploads/'
const isLogin = true
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
app.use('/uploads', express.static(__dirname + '/uploads'))
app.use(express.urlencoded({extended: false}))



app.get('/', (req,res) => {
  let query = '';

  
  db.connect((err,client, done) => {
    if (err) {
      return console.log(err);
    }

    if (req.session.isLogin == true) {
      // If Login
      query = `SELECT tb_projects.*, tb_user.username, tb_user.email 
                  FROM tb_projects LEFT JOIN tb_user
                  ON tb_user.id = tb_projects.user_id 
                  WHERE tb_projects.user_id = ${req.session.user.id}
                  ORDER BY tb_projects.id DESC;`
  } else {
      // If not Login
      query = `SELECT tb_projects.*, tb_user.username, tb_user.email 
                  FROM tb_projects LEFT JOIN tb_user
                  ON tb_user.id = tb_projects.user_id
                  ORDER BY tb_projects.id DESC`;
  }
    client.query(query,(err,result) => {
      if (err) throw err

      const data = result.rows;

      const newProjects = data.map((project) => {
        const newProject = {
          ...project,
          Distime: getDistime(project.start_date, project.end_date),
          isLogin: req.session.isLogin,
          image: PATH + project.image
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
app.post('/Project/add',upload.single('image'), (req, res) => {

    const {name, startDate,endDate,description,Tech} = req.body
    const user_id = req.session.user.id
    const fileName = req.file.filename
    

    db.connect((err,client,done) => {
      if(err) throw err
      
      const query = `INSERT INTO tb_projects (name,start_date,end_date,description,"Tech",image,user_id)
      VALUES ('${name}',
      '${startDate}',
      '${endDate}',
      '${description}',
      '{${Tech}}',
      '${fileName}',
      '${user_id}')`

      client.query(query, (err) =>{
        if (err) throw err
        done()
     })
   })
   res.redirect('/')
 })

app.get('/Project/add', (req, res) => {

  if (req.session.isLogin != true) {
    req.flash('warning', `Please login!`)
    return res.redirect('/login')
  }
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

app.post('/Project/edit/:id',upload.single('image'), (req,res) => {
  
  const {name, startDate,endDate,description,Tech} = req.body

  const fileName = req.file.filename
  
  const id = req.params.id

  db.connect((err,client,done) => {
    if(err) throw err
    
    const query = `UPDATE public.tb_projects SET 
    name ='${name}',
    start_date = '${startDate}',
    end_date ='${endDate}',
    description = '${description}',
    "Tech" ='{${Tech}}',
    image = '${fileName}'
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
 
  db.connect((err, client, done) => {
    if (err) throw err

    const query = `SELECT tb_projects.*, tb_user.username, tb_user.email 
    FROM tb_projects LEFT JOIN tb_user
    ON tb_user.id = tb_projects.user_id
    WHERE tb_projects.id = ${id};`

    client.query(query, (err, result) => {
      done();
      if (err) throw err;

      let project = result.rows[0]

        project = {
          ...project,
          Distime: getDistime(project.start_date, project.end_date),
          start_date: new Date(project.start_date),
          end_date: new Date(project.end_date),
          image: PATH + project.image
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
    const { username ,email,password} = req.body;

    const hashPassword = bcrypt.hashSync(password, 10)

    db.connect((err,client,done) =>{
      if (err) throw err

      const query =`INSERT INTO tb_user(username, email, password) 
                    VALUES ('${username}','${email}','${hashPassword}');`
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
        username: data[0].username
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