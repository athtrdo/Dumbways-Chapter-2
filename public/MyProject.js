const form = document.getElementById('form')

function addProject() {
  try {
    let name = document.getElementById('name').value
    let startDate = document.getElementById('startDate').value
    let endDate = document.getElementById('endDate').value
    let description = document.getElementById('description').value
    let Tech = []
    let projectImage = document.getElementById('projectImage').files[0]

    document
      .getElementsByName('techStack')
      .forEach(e => (e.checked ? techStack.push(e.value) : null))

    let project = {
      name,
      startDate,
      endDate,
      description,
      Tech,
      projectImage,
    }

    console.log(project);

    fetch('http://localhost:5000/project/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      body: JSON.stringify(project),
    }).then(res => console.log(res))
  } catch (error) {
    console.log(error)
  }
}

form.addEventListener('submit', e => {
  e.preventDefault()
  addProject()
})