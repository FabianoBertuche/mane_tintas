import React, { useContext } from 'react';
import { AppContext } from '../App';

function ImageUploader() {
  const { setCurrentImage, setIsProcessing } = useContext(AppContext);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setIsProcessing(true);
        const bitmap = await createImageBitmap(file);
        setCurrentImage(bitmap);
      } catch (error) {
        console.error('Erro ao carregar a imagem:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="image-uploader">
      <h2>Carregar Imagem</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="file-input"
      />
      <p className="upload-info">Selecione uma imagem do ambiente que deseja modificar</p>
    </div>
  );
}

export default ImageUploader;
