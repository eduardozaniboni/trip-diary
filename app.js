document.addEventListener('DOMContentLoaded', () => {
    const dbName = 'TripDiaryDB'
    const storeName = 'entries'
    let db

    const request = indexedDB.open(dbName, 2)

    request.onupgradeneeded = (event) => {
        db = event.target.result

        if (event.oldVersion < 1) {
            // Versão 1: Criação inicial do banco de dados
            let tripDiaryOS = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true })
            let usersOS = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true })
        }

        if (event.oldVersion < 2) {
            // Versão 2: Adicionar índice para username
            let usersOS = event.target.transaction.objectStore('users')
            usersOS.createIndex('usernameIDX', 'username', { unique: true })
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
        let request = db.transaction(['users'], 'readonly').objectStore('users').index('usernameIDX').get(username)
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

        let request = db.transaction(['users'], 'readonly').objectStore('users').index('usernameIDX').get(username)

        request.onsuccess = (event) => {
            if (event.target.result) {
                console.log('Username already in use. Choose another.')
                alert('Username already in use. Choose another.')
            } else if (password === null || password.trim() === '') {
                console.log("The password can't be empty.")
                alert("The password can't be empty.")
            } else {
                registerUser(username, password)
            }
        }

        request.onerror = (event) => {
            console.error('Error verifying username', event)
            alert('Error verifying username.')
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

        if (geo) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
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

                    const entry = {
                        title,
                        description,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        // latitude: simulatedPosition.rioDeJaneiro.latitude,
                        // longitude: simulatedPosition.rioDeJaneiro.longitude,
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
                        console.log(`Distance from last entry: ${distanceInKm} km`)

                        document.getElementById(
                            'distance-info'
                        ).textContent = `Distance from last entry: ${distanceInKm.toFixed(2)} quilometers`
                        document.getElementById('distance-display').style.display = 'block'

                        saveEntry(entry)
                    })
                    .catch((error) => {
                        console.error('Error calculating distance:', error)
                        saveEntry(entry)
                    })
            } else {
                saveEntry(entry)
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
        const request = db.transaction([storeName], 'readonly').objectStore(storeName).getAll()

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

    // Inicialize o Web Worker
    const distanceWorker = new Worker('workers.js')

    // Função para solicitar o cálculo da distância
    function calculateDistance(lat1, lon1, lat2, lon2) {
        return new Promise((resolve, reject) => {
            // Enviar os dados para o Web Worker
            distanceWorker.postMessage({ lat1, lon1, lat2, lon2 })

            // Receber a resposta do Web Worker
            distanceWorker.onmessage = (event) => {
                resolve(event.data)
            }

            distanceWorker.onerror = (error) => {
                reject(error)
            }
        })
    }

    // Encerre o Web Worker quando não for mais necessário
    window.addEventListener('unload', () => {
        distanceWorker.terminate()
    })
})
