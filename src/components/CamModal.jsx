import { useEffect, useRef } from 'react'

function CamModal({ onClose, onCapture }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })

        streamRef.current = stream
        videoRef.current.srcObject = stream
      } catch (err) {
        console.error('Erro ao acessar câmera:', err)
      }
    }

    startCamera()

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])

  const handleCapture = () => {
    const video = videoRef.current
    const canvas = document.createElement('canvas')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    const image = canvas.toDataURL('image/png')
    onCapture(image)
    onClose()
  }

  return (
    <div className="camera-modal">
      <div className="camera-content">
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }} />

        <div style={{ marginTop: '10px' }}>
          <button onClick={handleCapture}>📸 Tirar Foto</button>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

export default CamModal