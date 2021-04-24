document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //if form is submitted, send email !
  document.querySelector('form').onsubmit = send_email

  // By default, load the inbox
  load_mailbox('inbox');


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
        const bt = document.createElement("BUTTON");
        

        // Show the context for each mailbox
        if(mailbox === 'inbox') {
          element.innerHTML = `<strong>${result[email].sender}</strong> ${result[email].subject} ${result[email].timestamp}`;
          bt.innerHTML = 'archive';
        }
        else if(mailbox === 'sent') {
          element.innerHTML = `<strong>To: </strong>${result[email].recipients} ${result[email].subject} ${result[email].timestamp}`;
        }
        else if(mailbox === 'archive') {
          element.innerHTML = `<strong>${result[email].sender}</strong> ${result[email].subject} ${result[email].timestamp}`;
          bt.innerHTML = 'unarchive';
        }

        // Add element to the mailbox
        document.querySelector('#emails-view').append(element);
        if(mailbox === 'inbox') {
          document.querySelector('#emails-view').append(bt)
        }
  

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


  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(result => {
    console.log(result);
    document.querySelector('#email-details').innerHTML = `<strong>From:</strong> ${result.sender}<br><strong>To:</strong> ${result.recipients}<br><strong>Subject:</strong> ${result.subject}<br><strong>Timestamp:</strong> ${result.timestamp}<hr>${result.body}`;
  });
}

