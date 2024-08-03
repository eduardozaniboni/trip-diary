self.addEventListener('message', (event) => {
    const { lat1, lon1, lat2, lon2 } = event.data
    const distance = calculateDistance(lat1, lon1, lat2, lon2)
    self.postMessage(distance)
})

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3 // Raio da Terra em metros
    const φ1 = (lat1 * Math.PI) / 180 // Convertendo latitude 1 para radianos
    const φ2 = (lat2 * Math.PI) / 180 // Convertendo latitude 2 para radianos
    const Δφ = ((lat2 - lat1) * Math.PI) / 180 // Diferença de latitude em radianos
    const Δλ = ((lon2 - lon1) * Math.PI) / 180 // Diferença de longitude em radianos

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distância em metros
}
