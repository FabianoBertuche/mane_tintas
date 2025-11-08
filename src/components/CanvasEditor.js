import React, { useContext, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import {
  initializeSegmenter,
  segmentImage,
  applyColorToMask
} from '../services/imageProcessor';

function CanvasEditor() {
  const {
    currentImage,
    selectedColor,
    isProcessing,
    setIsProcessing,
  } = useContext(AppContext);

  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    if (currentImage) {
      const canvas = canvasRef.current;
      canvas.width = currentImage.width;
      canvas.height = currentImage.height;

      const ctx = canvas.getContext('2d');
      contextRef.current = ctx;

      // Desenha a imagem inicial no canvas
      ctx.drawImage(currentImage, 0, 0);
    }
    // Tentar inicializar o segmenter em background (não obrigatório)
    initializeSegmenter().catch(() => {
      // fail silently: usamos fallback de máscara se necessário
    });
  }, [currentImage]);

  const handleCanvasClick = async (event) => {
    if (!currentImage || isProcessing) return;

    try {
      setIsProcessing(true);
      const ctx = contextRef.current;

      // Chama o segmenter (ou fallback) para obter máscara
      const maskObj = await segmentImage(currentImage, { width: currentImage.width, height: currentImage.height });

      // Aplica a cor apenas na região da máscara
      applyColorToMask(ctx, maskObj, selectedColor, 0.85);

    } catch (error) {
      console.error('Erro ao processar a imagem:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentImage) {
    return (
      <div className="canvas-placeholder">
        <p>Carregue uma imagem para começar a editar</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="editor-canvas"
      style={{ cursor: isProcessing ? 'wait' : 'crosshair' }}
    />
  );
}

export default CanvasEditor;
