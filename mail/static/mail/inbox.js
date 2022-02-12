document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  //if form is submitted, send email !
  document.querySelector('form').onsubmit = send_email
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email() {

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  //send email
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
  // Stop from submitting
  return false;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Load the mailbox when visit Inbox, Sent or Archive
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(result => {
      // Print emails
      console.log(result);

      for (let email in result) {
        // Create HTML div element
        const element = document.createElement('div');
        element.style.border = "solid 1px black";

        //Change color to gray if that email has read
        if(result[email].read === true) {
          element.style.backgroundColor = "gray";
        }
        else{
          element.style.backgroundColor = "white";
        }

        // Create button
        const bt = document.createElement("button");
      
        // Show the context for each mailbox
        if(mailbox === 'inbox') {
          element.innerHTML = `<strong>${result[email].sender}</strong> ${result[email].subject} ${result[email].timestamp}`;
          bt.innerHTML = 'archive';

          document.querySelector('#emails-view').append(element,bt);
        }
        else if(mailbox === 'sent') {
          element.innerHTML = `<strong>To: </strong>${result[email].recipients} ${result[email].subject} ${result[email].timestamp}`;
          
          document.querySelector('#emails-view').append(element);
        }
        else if(mailbox === 'archive') {
          element.innerHTML = `<strong>${result[email].sender}</strong> ${result[email].subject} ${result[email].timestamp}`;
          bt.innerHTML = 'unarchive';

          document.querySelector('#emails-view').append(element,bt);
        }

        // Switch true-false when click archive button
        bt.addEventListener('click', function() {
          if (bt.innerHTML === 'archive') {
            fetch(`/emails/${result[email].id}`, {
              method:'PUT',
              body: JSON.stringify({
                archived: true
              })
            })
            .then(result => load_mailbox('inbox'));
          }
          else if (bt.innerHTML === 'unarchive') {
            fetch(`/emails/${result[email].id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: false
              })
            })
            .then(result => load_mailbox('inbox'))
          }
        });

        //Show details email when click
        element.addEventListener('click', function() {
          load_email(result[email].id);
          
          // Mark that email as read
          fetch(`/emails/${result[email].id}`, {
            method:'PUT',
            body: JSON.stringify({
              read:true
            })
          })
        });
      }
  });
}

function load_email(id) {

  //Show block details email and hide other views
  document.querySelector('#email-details').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';

  //create button reply
  const bt = document.createElement("button");
  bt.innerHTML = 'Reply';
  
  //create hre element
  const hr = document.createElement("hr");

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(result => {

    //create textarea for display body
    const txarea = document.createElement('textarea');
    txarea.setAttribute('id','email-body');
    txarea.setAttribute('class','form-control');
    txarea.setAttribute('disabled','');
    txarea.append(`${result.body}`);

    const emdt = document.querySelector('#email-details');
    emdt.innerHTML = `<strong>From:</strong> ${result.sender}<br><strong>To:</strong> ${result.recipients}<br><strong>Subject:</strong> ${result.subject}<br><strong>Timestamp:</strong> ${result.timestamp}<br>`;
    emdt.append(bt,hr,txarea);

    bt.addEventListener('click', function() {
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email-details').style.display = 'none';

    document.querySelector('#compose-recipients').value = `${result.sender}`

    if (result.subject.startsWith('Re: ')) {
      document.querySelector('#compose-subject').value = `${result.subject}`
    }
    else {
      document.querySelector('#compose-subject').value = `Re: ${result.subject}`
    }

    //pre-fill the body of the last email
    const newbd = document.querySelector('#compose-body');
    newbd.innerHTML = `\nOn ${result.timestamp} ${result.sender} wrote: ${result.body}`
    document.querySelector('#compose-body').focus();
    });
  });
}