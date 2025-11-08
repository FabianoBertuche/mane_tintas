import React, { useContext, useEffect, useRef } from 'react';
import { AppContext } from '../App';

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
  }, [currentImage]);

  const handleCanvasClick = async (event) => {
    if (!currentImage || isProcessing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    try {
      setIsProcessing(true);

      // TODO: Integrar com MediaPipe Image Segmenter
      // Por enquanto, vamos apenas simular a segmentação preenchendo
      // uma área circular ao redor do clique
      const ctx = contextRef.current;
      ctx.fillStyle = selectedColor;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

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
