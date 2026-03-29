import { useState, useEffect } from 'react'

function Gallery() {
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('photos')
    if (saved) setPhotos(JSON.parse(saved))
  }, [])

  const handleDelete = (index) => {
    const updated = photos.filter((_, i) => i !== index)
    setPhotos(updated)
    localStorage.setItem('photos', JSON.stringify(updated))
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Minhas Fotos</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {photos.map((photo, index) => (
          <div key={index}>
            <img
              src={photo}
              alt="foto"
              style={{ width: '150px', borderRadius: '8px' }}
            />
            <button onClick={() => handleDelete(index)}>
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Gallery