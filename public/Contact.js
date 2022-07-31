

function submitForm() {
    // Get data form
    let name = document.getElementById('input-name').value
    let email = document.getElementById('input-email').value
    let phone = document.getElementById('input-phone').value
    let subject = document.getElementById('input-subject').value
    let message = document.getElementById('input-message').value

    console.log(name);
    
    console.log(email);
    
    console.log(phone);
    
    console.log(subject);
    
    console.log(message);
    

    // Validation value
    if(name == ''){
        alert('Nama harus diisi ya...');
        return
    } 
    if(email == ''){
        alert('Email harus diisi ya...');
        return
    } 
    if(phone == ''){
        alert('Nomor HP harus diisi ya...');
        return
    } 
    if(subject == ''){
        alert('Subject harus diisi ya...');
        return
    } 
    if(message == ''){
        alert('Pesan harus diisi ya...');
        return
    } 

    alert('Are you sure?');

    // Display Mail Software
    console.log('Open Mail');

    const a = document.createElement('a')
    let emailReceiver = 'ajitrih7@gmail.com'
    a.href = `mailto:${emailReceiver}?subject=${subject}&body= Hallo my name ${name}, my phone number ${phone}, ${message}`
    a.click();

}