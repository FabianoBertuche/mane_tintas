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

      // calcula coordenadas no sistema do canvas (em pixels da imagem)
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;
      const clickX = Math.floor((event.clientX - rect.left) * scaleX);
      const clickY = Math.floor((event.clientY - rect.top) * scaleY);

      // Chama o segmenter (ou fallback) para obter máscara
      const maskObj = await segmentImage(currentImage, { width: currentImage.width, height: currentImage.height });

      // Extrai apenas o componente conectado sob o clique
      const component = await (async () => {
        try {
          // extractComponentMask está disponível via import default ou nomeado
          if (typeof applyColorToMask === 'function' && typeof maskObj !== 'undefined') {
            // usar função exportada do serviço
          }
        } catch (e) {
          // ignore
        }
        // import direto da lib (já está no mesmo módulo) — usamos o named import
        const { extractComponentMask } = await import('../services/imageProcessor');
        return extractComponentMask(maskObj, clickX, clickY);
      })();

      // Aplica a cor apenas na região do componente
      applyColorToMask(ctx, component, selectedColor, 0.85);

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
