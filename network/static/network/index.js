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
let num = Math.floor(Math.random() * 10000);

// Load default when user login
load_default();

// Load default when user click on network and allpost
const elements = document.querySelectorAll('.default-page');
elements.forEach(element => {
    element.addEventListener('click', (event) => {
        load_default();
        event.preventDefault()
    });
});

// Load profile when clicked
document.querySelector('#main-user').addEventListener('click', (event) => {
    profile(document.querySelector('#main-user').textContent)
    document.title = mainuser
    event.preventDefault()
})

// Load following's posts when clicked
document.querySelector('#fl-posts').addEventListener('click', (event) => {
    document.querySelectorAll('div:not(.body,.navbar-div)').forEach(div => {
        div.style.display = 'none';
    })
    document.querySelector('#posts-view').style.display = 'block'
    document.querySelector('#navpage-view').style.display = 'block'
    load_posts('following')
    event.preventDefault()
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
    const form = document.querySelector('#post-frm')
    form.addEventListener('submit', newpost)
    
    // Load All Posts
    load_posts('all')
}


// Set default page
function newpost(event) {
        
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
        load_posts('all')
    })
    .catch((error) => {
        console.error('Error: ', error)
    })

    // Clear text from text-area and disable post-button
    document.querySelector('#post-content').value = ''
    document.querySelector('#submit-post').disabled = true;

    event.preventDefault()
}


function load_posts(name, page = 1) {

    document.querySelector('#posts-view').innerHTML = `<h3>Posts</h3>`

    fetch(`/posts/${name}/${page}`)
    .then(response => response.json())
    .then(result => {
        console.log(result.totalpage, result.posts)

        if (result.posts.length === 0) {
            document.querySelector('#navpage-view').style.display = 'none'
            return document.querySelector('#posts-view').innerHTML = `<h4>No posts here !</h4>`;
        }
        else {
    
            pagination(result.posts, page, result.totalpage);
        }
    })

    function pagination(posts, currentPage, totalPage) {

        renderposts(posts)
        
        function renderposts(posts) {

            for (let i in posts) {

                post = posts[i]
                
                postdiv =   `<div id="div-${post.postid}" class="post" style="border: solid 1px black">
                                <a class="prf-${post.user}" href="#">${post.user}<br></a>
                                ${post.content}<br>
                                ${post.timestamp}
                                <a id="edit-id${post.postid}" class="editpost" href="#">Edit</a><br>
                                <img id="like-${post.postid}" class="post__like-btn">
                                <span id="totallikes-${post.postid}">${post.likes.length}</span>
                            </div>`

                document.querySelector('#posts-view').innerHTML += postdiv
            };

            for (let i in posts) {

                let post = posts[i]
                
                divp = document.querySelector(`#div-${post.postid}`)
                editbtn = document.querySelector(`#edit-id${post.postid}`)
                

                // Load profile, use onclick for overwirite click event, this case apply for class
                divp.querySelector(`a.prf-${post.user}`).onclick = (e) => {

                    profile(post.user)
                    e.stopPropagation();
                    e.preventDefault()
                }

                // Remove edit tag if not mainuser's post, else add event click for Edit button
                if (mainuser != post.user) {
                    editbtn.remove()
                }
                else {
                    editbtn.addEventListener('click', () => {
                        editpost(post)
                    })
                }

                // LIKE
                const likebtn = document.querySelector(`#like-${post.postid}`)

                if (post['likes'].includes(mainuser)) {
                    likebtn.src = "static/images/like.svg"
                    likebtn.alt = 'like'
                }
                else {
                    likebtn.src = "static/images/unlike.svg"
                    likebtn.alt = 'unlike'
                }
                
                likebtn.addEventListener('click', () => {
                    like(post)
                })


                const totalLikes = document.querySelector(`#totallikes-${post.postid}`)
                if (post.likes.length == 0) {
                    totalLikes.innerHTML =''
                }
            }
        }

        // RENDER NAV PAGES
        renderpagination(currentPage, totalPage)

        function renderpagination(currentPage, totalPage) {

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
                load_posts(name, 1)
            })

            pEnd.addEventListener('click', () => {
                currentPage = totalPage
                load_posts(name, currentPage)
            })

            const btnNext = document.querySelector('.btn-next');
            const btnPrevious = document.querySelector('.btn-previous');

            btnNext.addEventListener('click', () => {
                currentPage++;
                load_posts(name, currentPage)
            })

            btnPrevious.addEventListener('click', () => {
                currentPage--
                load_posts(name, currentPage)
            })
        }
    }
}


function editpost(post) {
    console.log(post)

    document.querySelectorAll('div:not(.body,.navbar-div)').forEach(div => {
        div.style.display = 'none';
    })

    const editview = document.querySelector('#edit-view')
    editview.style.display = 'block'

    editview.innerHTML = ''

    editview.innerHTML +=   `<h3 class="h3title">Edit Post</h3>
                                <form id="edit-frm">
                                    <textarea id="edit-content" class="form-control"></textarea>
                                    <button id="submit-edit" type="submit" class="btn btn-success">Update</button>
                                    <a id="del-${post.postid}" href="#">Delete</a>
                                </form>`
    
    // Fill old content into textarea and focus
    const content = document.querySelector('#edit-content')
    const editSubmit = document.querySelector('#submit-edit')
    const editfrm = document.querySelector('#edit-frm')
    
    content.value = post.content
    content.focus()

    content.onkeyup = () => {
        if (content.value.length === 0) {
            editSubmit.disabled = true
        }
        else {
            editSubmit.disabled = false
        }
    }

    //document.querySelector('#edit-frm').onsubmit = updatepost


    editfrm.addEventListener('submit', updatepost)

    function updatepost(event) {
        
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
            profile(data.user)
        })
        .catch(error => {
            console.error('Error:', error)
        })
        event.preventDefault()
    }

    const delbtn = document.querySelector(`#del-${post.postid}`)

    delbtn.addEventListener('click', () => {
        
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
            profile(post.user)
        })
    
    })
}


function like(post) {

    const mainuserID = document.querySelector('#main-user').getAttribute('value')
    const totalLikes = document.querySelector(`#totallikes-${post.postid}`)

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
        const likebtn = document.querySelector(`#like-${post.postid}`)

        if (likebtn.alt == "like") {
            likebtn.src = "static/images/unlike.svg"
            likebtn.alt = "unlike"
        }
        else  {
            likebtn.src = "static/images/like.svg"
            likebtn.alt = "like"
        }

        result.likes.length == 0 ? totalLikes.innerHTML = '': totalLikes.innerHTML = result.likes.length
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