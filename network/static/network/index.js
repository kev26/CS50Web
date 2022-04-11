function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');



// Get name of main user, and hide follow button if main user same profile user
const mainuser = document.querySelector('#main-user').textContent

// Load default when user login
load_default();

// Load default when user click on network and allpost
const elements = document.querySelectorAll('.default-page');
elements.forEach(element => {
    element.addEventListener('click', () => {
        load_default();
    });
});

// Load profile
document.querySelector('#main-user').addEventListener('click', () => {
    profile(document.querySelector('#main-user').textContent)
})

// Load following's posts
document.querySelector('#fl-posts').addEventListener('click', () => {
    document.querySelector('#postfrm-view').style.display = 'none'
    document.querySelector('#profile-view').style.display = 'none'
    load_posts('following')
})


function load_default() {

    document.querySelectorAll('div:not(.body,.navbar-div)').forEach(div => {
        div.style.display = 'none';
    })
    document.querySelector('#postfrm-view').style.display = 'block'
    document.querySelector('#posts-view').style.display = 'block'
    document.querySelector('#navpage-view').style.display = 'block'

    // Display newpost form and clear textarea
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
    document.getElementById('postfrm-view').onsubmit = newpost
    
    // Load All Posts
    load_posts('all')
}


// Set default page
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
        load_posts('all')
    })
    .catch((error) => {
        console.error('Error: ', error)
    })

    // Clear text from text-area and disable post-button
    document.querySelector('#post-content').value = ''
    document.querySelector('#submit-post').disabled = true;

    // Stop submitting from form
    return false
}


function editpost(post) {
    console.log(post)

    document.querySelectorAll('div:not(.body,.navbar-div)').forEach(div => {
        div.style.display = 'none';
    })
    document.querySelector('#edit-view').style.display = 'block'
    
    // Fill old content into textarea and focus
    content = document.querySelector('#edit-content')
    content.value = post.content
    document.querySelector('#edit-content').focus()

    content.onkeyup = () => {
        if (content.value.length === 0) {
            document.querySelector('#submit-edit').disabled = true
        }
        else {
            document.querySelector('#submit-edit').disabled = false
        }
    }

    document.querySelector('#edit-frm').onsubmit = updatepost

    function updatepost() {
        
        fetch(`/post/${post.postid}`, {
            method: 'PUT',
            headers: {'X-CSRFToken': csrftoken},
            mode: "same-origin",
            body: JSON.stringify({
                content: content.value
            })
        })
        .then(res => res.json())
        .then(data => {
            post_detail(data)
        })
        .catch(error => {
            console.error('Error:', error)
        })

        // Stop submitting from form
        return false
    }
}


function load_posts(name) {

    document.querySelector('#posts-view').innerHTML = `<h3>Posts</h3>`

    fetch(`/posts/${name}`)
    .then(response => response.json())
    .then(result => {

        if (result.length === 0) {
            document.querySelector('.nav-pages').style.display = 'none'
            return document.querySelector('#posts-view').innerHTML = `<h4>No posts here !</h4>`;
        }

        document.querySelector('.nav-pages').style.display = 'block'
        pagination(result);
    })


    function pagination(result) {

        // Set default page is 1
        let currentPage = 1;
        // Set item per page
        let itemPerPage = 10;

        // Calculate number of pages
        let totalPage = Math.ceil(result.length/itemPerPage);
        
        function renderposts(currentPage) {

            // Calculate posts base on start and end point
            let start = (currentPage - 1) * itemPerPage;
            let end = start + itemPerPage;

            let items = result.slice(start,end)
            
            // Render posts
            document.querySelector('#posts-view').innerHTML = '';

            for (let i in items) {

                post = items[i]
                
                postdiv =   `<div id="div-${post.postid}" class="post-dv" style="border: solid 1px black">
                                <a class="prf-${post.user}" href="#">${post.user}<br></a>
                                ${post.content}<br>
                                ${post.timestamp}
                                <a id="edit-id${post.postid}" class="editpost" href="#">Edit</a><br>
                                <button id="like-${post.postid}" class="like-btn"></button> <span id="totallikes-${post.postid}">${post.likes.length}</span>
                            </div>`

                document.querySelector('#posts-view').innerHTML += postdiv
            };

            for (let i in items) {

                let post = items[i]
                
                divp = document.querySelector(`#div-${post.postid}`)
                editbtn = document.querySelector(`#edit-id${post.postid}`)
                
                // Load post detail
                divp.addEventListener('click', () => {
                    console.log(post)
                    post_detail(post)
                })

                // Load profile, use onclick for overwirite click event, this case apply for class
                divp.querySelector(`a.prf-${post.user}`).onclick = (e) => {

                    profile(post.user)
                    // Prevent further propagation of the current event, this case will prevent load post detail
                    e.stopPropagation();
                }

                // Remove edit tag if not mainuser's post, else add event click for Edit button
                if (mainuser != post.user) {
                    editbtn.remove()
                }
                else {
                    editbtn.addEventListener('click', (e) => {
                        editpost(post)
                        e.stopPropagation();
                    })
                }

                // LIKE
                const likebtn = document.querySelector(`#like-${post.postid}`)

                post['likes'].includes(mainuser)?likebtn.innerHTML = 'Unlike':likebtn.innerHTML = 'Like'

                likebtn.addEventListener('click', (event) => {
                    like(post)
                    event.stopPropagation()
                })
            }

            // RENDER NAV PAGES
            // Get ul tag in HTML
            ul = document.querySelector('.pagination')

            // Render number pages nav and set default disabled for previous and next button
            ul.innerHTML = `<li id="li-previous" class="page-item disabled">
                                <a class="btn-previous page-link" href="#">Previous</a>
                            </li>
                                <li id="li-1" class="page-item">
                                    <a id="p1" class="page-link" href="#">1</a>
                                </li>
                                <li id="li-emptyr" class="page-item">
                                    <a id="emptyr" class="page-link" href="#">...</a>
                                </li>
                                <li id="li-${currentPage}" class="page-item">
                                    <a id="p${currentPage}" class="page-link" href="#">${currentPage}</a>
                                </li>
                                <li id="li-emptyl" class="page-item">
                                    <a id="emptyl" class="page-link" href="#">...</a>
                                </li>
                                <li id="li-${totalPage}" class="page-item">
                                    <a id="p${totalPage}" class="page-link" href="#">${totalPage}</a>
                                </li>
                            <li id="li-next" class="page-item disabled">
                                <a class="btn-next page-link" href="#">Next</a>
                            </li>`
                                
            // Add active state for current page
            if (document.querySelector(`#li-${currentPage}`)) {

                document.querySelector(`#li-${currentPage}`).classList.add('active')
            }

            if (currentPage != 1) {
                document.querySelector('#li-previous').classList.remove('disabled')
            }
            if (currentPage != totalPage) {
                document.querySelector('#li-next').classList.remove('disabled')
            }

            const pFirst = document.querySelector('#li-1')
            const pEnd = document.querySelector(`#p${totalPage}`)

            pFirst.addEventListener('click', () => {
                currentPage = 1
                renderposts(currentPage)
            })

            pEnd.addEventListener('click', () => {
                currentPage = totalPage
                renderposts(currentPage)
            })


            const btnNext = document.querySelector('.btn-next');
            const btnPrevious = document.querySelector('.btn-previous');

            btnNext.addEventListener('click', () => {
                currentPage++;
                renderposts(currentPage);
            })

            btnPrevious.addEventListener('click', () => {
                currentPage--
                renderposts(currentPage);
            })
        }

        // Load page 1 default 
        renderposts(currentPage);
    }
}


function post_detail(post) {

    document.querySelectorAll('div:not(.body,.navbar-div').forEach(div => {
        div.style.display = 'none'
    })
    document.querySelector('#posts-view').style.display = 'block'

    document.querySelector('#posts-view').innerHTML = `<h3>Post Detail</h3>`

    postdiv =   `<div id="div-${post.postid}" class="post-dv" style="border: solid 1px black">
                    <a class="prf-${post.user}" href="#">${post.user}<br></a>
                    ${post.content}<br>
                    ${post.timestamp}
                    <a id="edit-id${post.postid}" class="editpost" href="#">Edit</a>
                    <a id="del-id${post.postid}" class="del-post" href="#">Delete</a>
                    <button id="like-${post.postid}" class="like-btn"></button> <span id="totallikes-${post.postid}">${post.likes.length}</span>
                </div>`

    document.querySelector('#posts-view').innerHTML += postdiv

    document.querySelector(`.prf-${post.user}`).onclick = () => {
        profile(post.user)
    }

    const editbtn = document.querySelector(`#edit-id${post.postid}`)
    const delelm = document.querySelector(`#del-id${post.postid}`)

    if (mainuser != post.user) {
        editbtn.remove()
        delelm.remove()
    }

    editbtn.addEventListener('click', () => {
        editpost(post)
    })

    delelm.addEventListener('click', () => {
        delete_post(post)
    })
}

function delete_post(post) {
    fetch(`/post/${post.postid}`, {
        method: "PUT",
        headers: {'X-CSRFtoken': csrftoken},
        mode: "same-origin",
        body: JSON.stringify({
            delpost: post.postid
        })
    })
    .then(res => res.json())
    .then(result => {
        profile(mainuser)
    })
}

function like(post) {

    const likebtn = document.querySelector(`#like-${post.postid}`)
    const mainuserID = document.querySelector('#main-user').getAttribute('value')

    fetch(`/post/${post.postid}`, {
        method: "PUT",
        headers: {'X-CSRFtoken': csrftoken},
        mode: "same-origin",
        body: JSON.stringify({
            userlike: mainuserID
        })
    })
    .then(res => res.json())
    .then(result => {
        result['likes'].includes(mainuser)?likebtn.innerHTML='Unlike':likebtn.innerHTML='Like';
        document.querySelector(`#totallikes-${post.postid}`).innerHTML = result.likes.length
    })
}



function profile(name) {

    document.querySelectorAll('div:not(.body, .navbar-div)').forEach(div => {
        div.style.display = 'none'
    })
    document.querySelector('#profile-view').style.display = 'block'
    document.querySelector('#posts-view').style.display = 'block'
    document.querySelector('#navpage-view').style.display = 'block'

    // Clear page and show Page name
    document.querySelector('#profile-view').innerHTML = `<h3>Profile</h3>`

    fetch(`/profile/${name}`)
    .then(response => response.json())
    .then(data => {

        console.log(data)

        context =   `<div id="profile-div">
                        <p><strong>${data['user']} <button id=${data['user']} class="fl-btn"></button></strong></p>
                        <p id="flwer">Followers: ${data['followers'].length}</p>
                        <p id="flwing">Following: ${data['following'].length}</p>
                    </div>` 
        
        // Load profile template
        document.querySelector('#profile-view').innerHTML += context

        if (mainuser == data['user']) {

            document.querySelector('.fl-btn').remove()
        }
        else {

            const flbt = document.querySelector('.fl-btn')

            data['followers'].includes(mainuser)?flbt.innerHTML = 'unfollow':flbt.innerHTML = 'follow';

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
                .then(result => {
                    //change context profile
                    result['followers'].includes(mainuser)?flbt.innerHTML = 'unfollow':flbt.innerHTML = 'follow'
                    document.querySelector('#flwer').innerHTML = `Followers: ${result['followers'].length}`
                })
            }) 
        }
    })

    // Load posts
    load_posts(name)
} 
