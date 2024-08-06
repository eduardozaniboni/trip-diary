document.addEventListener('DOMContentLoaded', () => {
    const btnToggleLanguage = document.getElementById('btn-toggle-language')
    const logoutBtn = document.getElementById('logout-btn')
    const userAuth = document.getElementById('user-auth')
    const diaryEntries = document.getElementById('diary-entries')

    const textElements = {
        title: {
            en: 'Trip Diary',
            pt: 'Diário de Viagem',
        },
        loginTitle: {
            en: 'Login',
            pt: 'Entrar',
        },
        loginUsername: {
            en: 'Username',
            pt: 'Nome de usuário',
        },
        loginPassword: {
            en: 'Password',
            pt: 'Senha',
        },
        loginBtn: {
            en: 'Login',
            pt: 'Entrar',
        },
        loginAccount: {
            en: 'Don\'t have an account? <a href="#" id="show-register">Register</a>',
            pt: 'Não tem uma conta? <a href="#" id="show-register">Registrar</a>',
        },
        registerTitle: {
            en: 'Register',
            pt: 'Registrar',
        },
        registerUsername: {
            en: 'Username',
            pt: 'Nome de usuário',
        },
        registerPassword: {
            en: 'Password',
            pt: 'Senha',
        },
        registerBtn: {
            en: 'Register',
            pt: 'Registrar',
        },
        registerAccount: {
            en: 'Already have an account? <a href="#" id="show-login">Login</a>',
            pt: 'Já tem uma conta? <a href="#" id="show-login">Entrar</a>',
        },
        addNewEntry: {
            en: 'Add New Entry',
            pt: 'Adicionar Nova Entrada',
        },
        diaryTitle: {
            en: 'Title',
            pt: 'Título',
        },
        diaryDescription: {
            en: 'Description',
            pt: 'Descrição',
        },
        addEntryBtn: {
            en: 'Add Entry',
            pt: 'Adicionar Entrada',
        },
        distanceInfo: {
            en: 'Distance from last entry: {distance} kilometers',
            pt: 'Distância desde a última entrada: {distance} quilômetros',
        },
        journalEntries: {
            en: 'Journal Entries',
            pt: 'Entradas do Diário',
        },
    }

    const dbName = 'TripDiaryDB'
    const storeName = 'entries'
    let db
    let currentUserId = null

    const request = indexedDB.open(dbName, 3)

    request.onupgradeneeded = (event) => {
        db = event.target.result

        if (event.oldVersion < 1) {
            db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true })
            db.createObjectStore('users', { keyPath: 'id', autoIncrement: true })
        }

        if (event.oldVersion < 2) {
            let usersOS = event.target.transaction.objectStore('users')
            usersOS.createIndex('usernameIDX', 'username', { unique: true })
        }

        if (event.oldVersion < 3) {
            let entriesOS = event.target.transaction.objectStore(storeName)
            entriesOS.createIndex('userId', 'userId', { unique: false })
        }
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
        const loginForm = document.getElementById('login-form')
        const registerForm = document.getElementById('register-form')
        loginForm.classList.add('fade-out')
        registerForm.classList.add('fade-in')

        setTimeout(() => {
            loginForm.style.display = 'none'
            registerForm.style.display = 'flex'
            loginForm.classList.remove('fade-out')
            registerForm.classList.remove('fade-in')
        }, 500)
    }

    const handleShowLogin = (event) => {
        event.preventDefault()
        const loginForm = document.getElementById('login-form')
        const registerForm = document.getElementById('register-form')
        registerForm.classList.add('fade-out')
        loginForm.classList.add('fade-in')

        setTimeout(() => {
            registerForm.style.display = 'none'
            loginForm.style.display = 'flex'
            registerForm.classList.remove('fade-out')
            loginForm.classList.remove('fade-in')
        }, 500)
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
            if (getLanguage() === 'pt') {
                console.log('Registro cadastro com sucesso')
                alert('Registro cadastro com sucesso. Por favor, entre para continuar.')
            } else {
                console.log('User registered successfully')
                alert('Registration successful. Please login to continue.')
            }
            document.getElementById('show-login').click()
        }

        request.onerror = (event) => {
            if (getLanguage() === 'pt') {
                console.error('Erro ao registrar usuário', request.error)
                alert('Erro ao registrar usuário.')
            } else {
                console.error('Error registering user', request.error)
                alert('Error registering user.')
            }
        }
    }

    function loginUser(username, password) {
        let request = db.transaction(['users'], 'readonly').objectStore('users').index('usernameIDX').get(username)
        request.onsuccess = (event) => {
            const user = event.target.result
            if (user && user.password === password) {
                currentUserId = user.id
                console.log('Login successful')

                userAuth.classList.add('fade-out')
                diaryEntries.classList.add('fade-in')

                setTimeout(() => {
                    userAuth.style.display = 'none'
                    diaryEntries.style.display = 'block'
                    userAuth.classList.remove('fade-out')
                    diaryEntries.classList.remove('fade-in')
                    logoutBtn.classList.remove('hidden')
                    displayEntries()
                }, 500)
            } else {
                if (getLanguage() === 'pt') {
                    console.error('Nome de usuário ou senha inválido. Tente novamente.')
                    alert('Nome de usuário ou senha inválido. Tente novamente.')
                } else {
                    console.error('Username or password is invalid')
                    alert('Username or password is invalid. Try again.')
                }
            }
        }

        request.onerror = (event) => {
            if (getLanguage() === 'pt') {
                console.log('Erro na autenticação do nome de usuário', event)
                alert('Erro na autenticação do nome de usuário.')
            } else {
                console.log('Error in authentication username', event)
                alert('Error in authentication username.')
            }
        }
    }

    const loginBtn = document.getElementById('login-btn')
    const registerBtn = document.getElementById('register-btn')

    const handleRegisterUser = (event) => {
        const username = document.getElementById('register-username').value
        const password = document.getElementById('register-password').value

        let request = db.transaction(['users'], 'readonly').objectStore('users').index('usernameIDX').get(username)

        request.onsuccess = (event) => {
            if (event.target.result) {
                if (getLanguage() === 'pt') {
                    console.log('Nome de usuário já em uso. Escolha outro.')
                    alert('Nome de usuário já em uso. Escolha outro.')
                } else {
                    console.log('Username already in use. Choose another.')
                    alert('Username already in use. Choose another.')
                }
            } else if (password === null || password.trim() === '') {
                if (getLanguage() === 'pt') {
                    console.log('A senha não pode ser vazia.')
                    alert('A senha não pode ser vazia.')
                } else {
                    console.log("The password can't be empty.")
                    alert("The password can't be empty.")
                }
            } else {
                registerUser(username, password)
            }
        }

        request.onerror = (event) => {
            if (getLanguage() === 'pt') {
                console.error('Erro ao verificar o nome de usuário', event)
                alert('Erro ao verificar o nome de usuário.')
            } else {
                alert('Error verifying username.')
                console.error('Error verifying username', event)
            }
        }
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
        const title = document.getElementById('diary-title').value
        const description = document.getElementById('diary-description').value
        let geo = navigator.geolocation

        if (title.trim() == '') {
            if (getLanguage() === 'pt') {
                console.error('O título não pode ser vazio', event)
                alert('O título não pode ser vazio.')
            } else {
                alert("The title can't be empty.")
                console.error("The title can't be empty", event)
            }
            return null
        }

        if (geo) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords

                    const simulatedPosition = {
                        sanFrancisco: {
                            latitude: 37.7749, // Latitude de San Francisco
                            longitude: -122.4194, // Longitude de San Francisco
                        },
                        saoPaulo: {
                            latitude: -23.5505, // Latitude de São Paulo
                            longitude: -46.6333, // Longitude de São Paulo
                        },
                        rioDeJaneiro: {
                            latitude: -22.9068, // Latitude do Rio de Janeiro
                            longitude: -43.1729, // Longitude do Rio de Janeiro
                        },
                        novaIorque: {
                            latitude: 40.7128, // Latitude de Nova Iorque
                            longitude: -74.006, // Longitude de Nova Iorque
                        },
                    }

                    const localDate = new Date().toLocaleString(getLanguage(), {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: false,
                    })

                    const entry = {
                        title,
                        description,
                        latitude,
                        longitude,
                        date: localDate,
                        userId: currentUserId,
                    }

                    addEntry(entry)
                },
                (error) => {
                    console.error('Error getting geolocation', error)
                },
                { enableHighAccuracy: true }
            )
        } else {
            console.error('Geolocation is not supported by your browser')
        }
    }

    addEntryBtn.addEventListener('click', handleAddEntry)

    function addEntry(entry) {
        console.log(entry)

        const request = db.transaction([storeName], 'readonly').objectStore(storeName).getAll()

        request.onsuccess = (event) => {
            const entries = event.target.result
            if (entries.length > 0) {
                const lastEntry = entries[entries.length - 1]
                const lastLat = lastEntry.latitude
                const lastLon = lastEntry.longitude

                calculateDistance(lastLat, lastLon, entry.latitude, entry.longitude)
                    .then((distance) => {
                        const distanceInKm = distance / 1000
                        const currentLanguage = getLanguage()

                        const distanceMessage = textElements.distanceInfo[currentLanguage].replace(
                            '{distance}',
                            distanceInKm.toFixed(2)
                        )

                        console.log(distanceMessage)

                        document.getElementById('distance-info').textContent = distanceMessage
                        document.getElementById('distance-display').style.display = 'block'

                        saveEntry(entry)
                        animateNewEntry()
                    })
                    .catch((error) => {
                        console.error('Error calculating distance:', error)
                        saveEntry(entry)
                        animateNewEntry()
                    })
            } else {
                saveEntry(entry)
                animateNewEntry()
            }
        }

        request.onerror = (event) => {
            console.error('Error fetching entries', event)
        }
    }

    function saveEntry(entry) {
        const request = db.transaction([storeName], 'readwrite').objectStore(storeName).add(entry)

        request.onsuccess = () => {
            console.log('Entry added successfully')
            displayEntries()
        }

        request.onerror = (event) => {
            console.error('Error adding entry', event)
        }
    }

    function displayEntries() {
        const request = db
            .transaction([storeName], 'readonly')
            .objectStore(storeName)
            .index('userId')
            .getAll(currentUserId)

        request.onsuccess = (event) => {
            const entries = event.target.result
            const entriesList = document.getElementById('diary-entries-list')
            entriesList.innerHTML = ''

            entries.forEach((entry) => {
                const li = document.createElement('li')
                li.innerHTML = `${entry.title} - ${entry.date}<br>${entry.description}`
                entriesList.appendChild(li)
            })
        }

        request.onerror = (event) => {
            console.log('Error fetching entries', event)
        }
    }

    function animateNewEntry() {
        const newEntry = document.getElementById('diary-entries-list')
        newEntry.classList.add('bounce')
        setTimeout(() => newEntry.classList.remove('bounce'), 100)
    }

    const distanceWorker = new Worker('workers.js')

    function calculateDistance(lat1, lon1, lat2, lon2) {
        return new Promise((resolve, reject) => {
            distanceWorker.postMessage({ lat1, lon1, lat2, lon2 })

            distanceWorker.onmessage = (event) => {
                resolve(event.data)
            }

            distanceWorker.onerror = (error) => {
                reject(error)
            }
        })
    }

    function setLanguage(lang) {
        document.getElementById('title').textContent = textElements.title[lang]
        document.getElementById('login-title').textContent = textElements.loginTitle[lang]
        document.getElementById('login-username').placeholder = textElements.loginUsername[lang]
        document.getElementById('login-password').placeholder = textElements.loginPassword[lang]
        document.getElementById('login-btn').textContent = textElements.loginBtn[lang]
        document.getElementById('login-account').innerHTML = textElements.loginAccount[lang]

        document.getElementById('register-title').textContent = textElements.registerTitle[lang]
        document.getElementById('register-username').placeholder = textElements.registerUsername[lang]
        document.getElementById('register-password').placeholder = textElements.registerPassword[lang]
        document.getElementById('register-btn').textContent = textElements.registerBtn[lang]
        document.getElementById('register-account').innerHTML = textElements.registerAccount[lang]

        document.querySelector('#diary-entries h2').textContent = textElements.addNewEntry[lang]
        document.getElementById('diary-title').placeholder = textElements.diaryTitle[lang]
        document.getElementById('diary-description').placeholder = textElements.diaryDescription[lang]
        document.getElementById('add-entry-btn').textContent = textElements.addEntryBtn[lang]
        document.getElementById('distance-info').textContent = textElements.distanceInfo[lang]
        document.querySelector('#diary-entries ul').previousElementSibling.textContent =
            textElements.journalEntries[lang]

        localStorage.setItem('preferredLanguage', lang)

        btnToggleLanguage.textContent = lang === 'en' ? 'Português' : 'English'

        if (lang === 'pt') {
            btnToggleLanguage.classList.add('portuguese')
        } else {
            btnToggleLanguage.classList.remove('portuguese')
        }

        document.getElementById('show-register').addEventListener('click', handleShowRegister)
        document.getElementById('show-login').addEventListener('click', handleShowLogin)
    }

    function getLanguage() {
        return localStorage.getItem('preferredLanguage') || 'pt'
    }

    btnToggleLanguage.addEventListener('click', () => {
        const currentLanguage = getLanguage()
        const newLanguage = currentLanguage === 'en' ? 'pt' : 'en'
        setLanguage(newLanguage)
    })

    setLanguage(getLanguage())

    function handleLogout() {
        currentUserId = null

        userAuth.style.display = 'block'
        diaryEntries.style.display = 'none'
        logoutBtn.classList.add('hidden')

        document.getElementById('diary-entries-list').innerHTML = ''
    }

    logoutBtn.addEventListener('click', handleLogout)

    window.addEventListener('unload', () => {
        distanceWorker.terminate()
    })
})
