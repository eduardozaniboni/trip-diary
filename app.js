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
})
