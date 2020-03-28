document.addEventListener('DOMContentLoaded', () => {

    /* VARIABLES */
    const newsApiToken = '4160d975ae674967b5ae79790d0fee90';
    const newsApiUrl = 'https://newsapi.org/v2/';
    const teacherApiUrl = 'https://newsapp.dwsapp.io/api';

    // SELECT
    let select = document.querySelector('.js-select-sources');

    // USER
    let userDetails = document.querySelector('.js-user-details');

    // CONTENTS
    let contentsWrapper = document.querySelector('.js-contents-wrapper');
    let contentsList = document.querySelector('.js-contents-container');

    // BOOKMARKS
    let bookmarksWrapper = document.querySelector('.js-bookmarks-wrapper');
    let bookmarksList = document.querySelector('.js-bookmarks-list');

    // FORMS
    let formRegister = document.querySelector('.js-form-register');
    let formLogin = document.querySelector('.js-form-login');
    let formSearch = document.querySelector('.js-form-search');

    // BUTTONS
    let btnReset = document.querySelector('.js-btn-reset');
    let btnLogout = document.querySelector('.js-btn-logout')

    /* RENDER ARTICLES */
    function renderArticles(articles) {
        contentsList.innerHTML = '';

        articles.forEach(({ title, description, url, urlToImage, publishedAt }, index) => {
            if (index < 10) {
                let elmt = document.createElement('div');
                elmt.className = 'contents-container__item';

                // IMAGE
                let cntImg = document.createElement('div');
                cntImg.className = 'content-img';

                if (urlToImage) {
                    let img = document.createElement('img');
                    img.src = urlToImage;

                    cntImg.append(img);
                }

                // DETAILS
                let cntDetails = document.createElement('div');
                cntDetails.className = 'content-details';

                let dateElmt = document.createElement('span');
                let newDate = new Date(publishedAt);

                dateElmt.className = 'content-details__date';
                dateElmt.textContent = newDate.toLocaleDateString('en-GB');

                let titleElmt = document.createElement('span');
                titleElmt.className = 'content-details__title';
                titleElmt.textContent = title;

                let descriptionElmt = document.createElement('span');
                descriptionElmt.className = 'content-details__description';
                descriptionElmt.textContent = description;

                let link = document.createElement('a');
                link.href = url;
                link.textContent = 'read more';
                link.target = "_blank";

                cntDetails.append(dateElmt);
                cntDetails.append(titleElmt);
                cntDetails.append(descriptionElmt);
                cntDetails.append(link);

                // ADD IN CONTAINER
                elmt.append(cntImg);
                elmt.append(cntDetails);

                contentsList.append(elmt);
            }
        })

        let top = contentsWrapper.getBoundingClientRect().top;
        window.scrollTo(0, (window.scrollY + top) - 20);
    }

    /* GET SOURCES */
    fetch(`${newsApiUrl}/sources?apiKey=${newsApiToken}`)
        .then(res => res.json())
        .then(({ status, sources }) => {
            if (status === 'ok') {
                sources.forEach(({ id, name }) => {
                    let elmt = document.createElement('option');
                    elmt.value = id;
                    elmt.textContent = name;

                    select.append(elmt)
                })

                new Choices(select)
                bookmarksList.style.display = 'block';
            } else {
                console.log('error while fetching sources !');
            }
        })
    
    /* CHECK LOGGED USER */
    if (sessionStorage.getItem('session_token')) {
        formRegister.style.display = 'none';
        formLogin.style.display = 'none';
        bookmarksWrapper.style.display = "block";

        fetch(`${teacherApiUrl}/me`, {
            method: 'POST',
            body: JSON.stringify({ token: sessionStorage.getItem('session_token')}),
            headers: {
                'content-type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(({ err, data }) => {
                if (err) {
                    console.log(err);
                } else {
                    sessionStorage.setItem('firstname', data.user.firstname);
                    sessionStorage.setItem('lastname', data.user.lastname);

                    userDetails.textContent = `
                        user - ${sessionStorage.getItem('firstname')} ${sessionStorage.getItem('lastname')}
                    `;

                    userDetails.style.display = 'block';
                }
            })
    }

    /* GET SEARCHED SOURCES */
    formSearch.addEventListener('submit', e => {
        e.preventDefault();

        let searchIdSource = e.target.querySelector('select[name="source_search"] option').value;
        let searchKeyword = e.target.querySelector('input[name="keywords_search"]').value;

        if (searchIdSource && !searchKeyword) {
            fetch(`${newsApiUrl}/top-headlines?sources=${searchIdSource}&apiKey=${newsApiToken}`)
                .then(res => res.json())
                .then(({ status, articles }) => {
                    if (status === 'ok') {
                        renderArticles(articles);
                    } else {
                        console.log('error while fetching sources with id ' + searchIdSource);
                    }
                })
        }
        else if (!searchIdSource && searchKeyword) {
            fetch(`${newsApiUrl}/top-headlines?q=${searchKeyword}&apiKey=${newsApiToken}`)
                .then(res => res.json())
                .then(({ status, articles }) => {
                    if (status === 'ok') {
                        renderArticles(articles);
                    } else {
                        console.log('error while fetching sources with keyword ' + searchIdSource);
                    }
                })
        }
        else if (searchIdSource && searchKeyword) {
            fetch(`${newsApiUrl}/top-headlines?sources=${searchIdSource}&q=${searchKeyword}&apiKey=${newsApiToken}`)
                .then(res => res.json())
                .then(({ status, articles }) => {
                    if (status === 'ok') {
                        renderArticles(articles);
                    } else {
                        console.log(`error while fetching sources with id ${searchIdSource} and keyword ${searchKeyWord}`);
                    }
                })
        }
    })

    /* RESET FORM SEARCH */
    btnReset.addEventListener('click', e => {
        e.preventDefault();

        formSearch.reset()
    })

    /* REGISTER */
    formRegister.addEventListener('submit', e => {
        e.preventDefault();

        let form = e.target;
        let password = form.querySelector('input[name="password_register"]').value;
        let repeat_password = form.querySelector('input[name="repeat_password_register"]').value;

        if (password === repeat_password) {
            let formData = {
                email: form.querySelector('input[name="email_register"]').value,
                password,
                firstname: form.querySelector('input[name="firstname_register"]').value,
                lastname: form.querySelector('input[name="lastname_register"]').value,
            }

            fetch(`${teacherApiUrl}/register`, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'content-type': 'application/json'
                }
            })
                .then(res => res.json())
                .then(({ message, err }) => {
                    if (err) {
                        console.log(err);
                    } else {
                        alert(message + ' - you can know login with your email and password')
                        formRegister.reset()
                    }
                })
        }
        else {
            alert('Password and repeat password are different !');
        }
    })

    /* LOGIN */
    formLogin.addEventListener('submit', e => {
        e.preventDefault();

        let form = e.target;
        let formData = {
            email: form.querySelector('input[name="email_login"]').value,
            password: form.querySelector('input[name="password_login"]').value,
        };

        if (formData) {
            fetch(`${teacherApiUrl}/login`, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'content-type': 'application/json'
                }
            })
                .then(res => res.json())
                .then(({ err, data }) => {
                    if (err) {
                        console.log(err);
                    } else {
                        sessionStorage.setItem('session_token', data.token);
                        window.location.reload();
                    }
                })
        }
        else {
            console.log('no data provided !');
        }
    })

    /* LOGOUT */
    btnLogout.addEventListener('click', e => {
        e.preventDefault();

        fetch(`${teacherApiUrl}/logout`)
            .then(res => res.json())
            .then(({ err }) => {
                if (err) {
                    console.log(err);
                } else {
                    sessionStorage.removeItem('session_token');
                    sessionStorage.removeItem('firstname');
                    sessionStorage.removeItem('lastname');

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            })
    })

});