document.addEventListener('DOMContentLoaded', () => {
    const dbName = 'TripDiaryDB'
    const storeName = 'entries'
    let db

    const request = indexedDB.open(dbName, 1)

    request.onupgradeneeded = (event) => {
        db = event.target.request
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
})
