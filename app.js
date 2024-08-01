document.addEventListener('DOMContentLoaded', () => {
    const dbName = 'TripDiaryDB'
    const storeName = 'entries'
    let db

    const request = indexedDB.open(dbName, 1)

    request.onupgradeneeded = (event) => {
        db = event.target.result
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true })
        db.createObjectStore('users', { keyPath: 'username' })
    }

    request.onsuccess = (event) => {
        db = event.target.result
        console.log('IndexedDB connected successfully')
    }

    request.onerror = (event) => {
        console.log('Error connecting to IndexedDB', event)
    }

    const showRegister = document.getElementById('show-register')
    const showLogin = document.getElementById('show-login')

    const handleShowRegister = (event) => {
        event.preventDefault()
        document.getElementById('login-form').style.display = 'none'
        document.getElementById('register-form').style.display = 'block'
    }

    const handleShowLogin = (event) => {
        event.preventDefault()
        document.getElementById('login-form').style.display = 'block'
        document.getElementById('register-form').style.display = 'none'
    }

    showRegister.addEventListener('click', handleShowRegister)
    showLogin.addEventListener('click', handleShowLogin)

    function registerUser(username, password) {
        const user = {
            username,
            password,
        }

        let request = db.transaction(['users'], 'readwrite').objectStore('users').add(user)

        request.onsuccess = (event) => {
            console.log('User registered successfully')
            alert('Registration successful. Please login to continue.')
            document.getElementById('show-login').click()
        }

        request.onerror = (event) => {
            console.error('Error registering user', request.error)
            alert('Error registering user.')
        }
    }

    function loginUser(username, password) {
        let request = db.transaction(['users'], 'readonly').objectStore('users').get(username)
        
        request.onsuccess = (event) => {
            const user = event.target.result
            if (user && user.password === password) {
                console.log('Login successful')
                document.getElementById('user-auth').style.display = 'none'
                document.getElementById('diary-entries').style.display = 'block'
                displayEntries()
            } else {
                console.error('Username or password is invalid')
                alert('Username or password is invalid. Try again.')
            }
        }

        request.onerror = (event) => {
            console.log('Error in authentication username', event)
            alert('Error in authentication username.')
        }
    }

    const loginBtn = document.getElementById('login-btn')
    const registerBtn = document.getElementById('register-btn')

    const handleRegisterUser = (event) => {
        const username = document.getElementById('register-username').value
        const password = document.getElementById('register-password').value
        registerUser(username, password)
    }

    const handleLoginUser = (event) => {
        const username = document.getElementById('login-username').value
        const password = document.getElementById('login-password').value
        loginUser(username, password)
    }

    loginBtn.addEventListener('click', handleLoginUser)
    registerBtn.addEventListener('click', handleRegisterUser)

    const addEntryBtn = document.getElementById('add-entry-btn')

    const handleAddEntry = (event) => {
        const title = document.getElementById('title')
        const description = document.getElementById('description')
        let geo = navigator.geolocation

        if (geo) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const entry = {
                        title,
                        description,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        date: new Date().toISOString(),
                    }
                    addEntry(entry)
                },
                (error) => {
                    console.error('Error getting geolocation', error)
                }
            )
        } else {
            console.error('Geolocation is not supported by your browser')
        }
    }

    addEntryBtn.addEventListener('click', handleAddEntry)

    function addEntry(entry) {
        let request = db.transaction([storeName], 'readwrite').objectStore(storeName).add(entry)

        request.onsuccess = () => {
            console.log('Entry added successfully')
            displayEntries()
        }

        request.onerror = (event) => {
            console.error('Error adding entry', event)
        }
    }

    function displayEntries() {
        let request = db.transaction([storeName], 'readonly').objectStore(storeName).getAll()

        request.onsuccess = (event) => {
            const entries = event.target.result
            const entriesList = document.getElementById('diary-entries-list')
            entriesList.innerHTML = ''

            entries.forEach((entry) => {
                const li = document.createElement('li')
                li.textContent = `${entry.title} - ${entry.date}`
                entriesList.appendChild(li)
            })
        }

        request.onerror = (event) => {
            console.log('Error fetching entries', event)
        }
    }
})
