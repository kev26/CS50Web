// Get csrftoken from cookie by Cookies.get() from js-cookie library 
const csrftoken = Cookies.get('csrftoken')



if (document.querySelector('#newpost-view')) {
    
    // Default, load All Post page
    load_posts()

    // Clear textarea
    document.querySelector('#post-content').value = '';

    // Enable submit button if textarea contain text
    const content = document.querySelector('#post-content')
    const submit = document.querySelector('#submit-post')
    submit.disabled = true;
    content.onkeyup = () => {
        if (content.value.length > 0) {
            submit.disabled = false
        }
        else {
            submit.disabled = true
        }
    }

    // If the form submited, run newpost function
    document.querySelector('#newpost-frm').addEventListener('submit', (event) => {
        // Run Newpost fuction
        newpost()
        // Stop form from submitting
        event.preventDefault()
    })
}


function newpost() {
        
    // Get content from text-area
    content = document.querySelector('#post-content').value

    fetch('/newpost', {
        method: 'POST',
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin',
        body: JSON.stringify({
            content: content
        })
    })
    .then(response => response.json())
    .then(result => {

        console.log(result)
        load_posts()
    })
    
    // Clear text from text-area and disable post-button
    document.querySelector('#post-content').value = ''
    document.querySelector('#submit-post').disabled = true;
}


function load_posts() {

    document.querySelector('#posts-view').innerHTML = ''

    fetch('/posts')
    .then(response => response.json())
    .then(result => {

        for (post in result) {

            postdiv =   `<div id=${result[post].postid} class="post-dv" style="border: solid 1px black">
                            <a href="#" onclick="profile('${result[post].user}')">${result[post].user}<br></a>
                            ${result[post].content}<br>
                            ${result[post].timestamp}
                        </div>`

            document.querySelector('#posts-view').innerHTML += postdiv
        }
    })
}


function profile(name) {

    // Clear page and show Page name
    document.querySelector('#profile-view').innerHTML = `<h3>Profile</h3>`

    fetch(`/profile/${name}`)
    .then(response => response.json())
    .then(data => {

        console.log(data)

        // Hide newpost-view and show profile-view
        document.querySelector('#newpost-view').style.display = 'none'
        document.querySelector('#profile-view').style.display = 'block'

        context =   `<div>
                        <strong>${data['user']} <button id=${data['user']} class="fl-btn"></button></strong><br>
                        Followers: ${data['followers'].length}<br>
                        Following: ${data['following'].length}<br>
                    </div>` 
        
        document.querySelector('#profile-view').innerHTML += context

        // Get name of main user, and hide follow button if main user same profile user
        const mainuser = document.querySelector('#main-user').textContent

        if (mainuser == data['user']) {

            document.querySelector('.fl-btn').remove()
        }
        else {

            const flbt = document.querySelector('.fl-btn')

            if (data['followers'].includes(mainuser)) {

                flbt.innerHTML = 'unfollow'
            }
            else {

                flbt.innerHTML = 'follow'
            }

            document.querySelector('.fl-btn').addEventListener('click', () => {

                fetch(`/profile/${name}`, {
                    method: "PUT",
                    headers: {'X-CSRFToken': csrftoken},
                    mode: 'same-origin',
                    body: JSON.stringify({
                        action: flbt.textContent
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    profile(name)
                })
            }) 
        }
    })
} 
