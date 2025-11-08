import React, { useState, createContext } from 'react';
import ImageUploader from './components/ImageUploader';
import ColorPalette from './components/ColorPalette';
import CanvasEditor from './components/CanvasEditor';
import './assets/styles/main.css';

// 1.  **Estrutura do Componente:** Crie um componente funcional React chamado `App`.

// Criando o contexto global da aplicação// 2.  **Gerenciamento de Estado:** Precisamos gerenciar dois estados principais:

export const AppContext = createContext();//     -   `image`: Armazenará o arquivo de imagem carregado pelo usuário. O estado inicial deve ser `null`.

//     -   `selectedColor`: Armazenará o código hexadecimal da cor que o usuário selecionou na paleta. O estado inicial pode ser uma cor padrão, como preto (`'#000000'`).


function App() {
    // Estados globais da aplicação
    const [currentImage, setCurrentImage] = useState(null);
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [isProcessing, setIsProcessing] = useState(false);

    // Valores que serão compartilhados através do contexto
    const contextValue = {
        currentImage,
        setCurrentImage,
        selectedColor,
        setSelectedColor,
        isProcessing,
        setIsProcessing,
    };

// Por favor, gere o código para o componente `App.js`, incluindo os imports necessários (React, useState) e placeholders para os componentes filhos (`ImageUploader`, `ColorPalette`, `CanvasEditor`). Adicione também um CSS básico para o layout de duas colunas diretamente no arquivo usando um objeto de estilo ou crie um arquivo `App.css` e importe-o.

    return (
        <AppContext.Provider value={contextValue}>
            <div className="app-container">
                <header className="app-header">
                    <h1>ColorChanger AI</h1>
                </header>

                <main className="app-main">
                    <div className="tools-panel">
                        <ImageUploader />
                        <ColorPalette />
                    </div>

                    <div className="canvas-container">
                        {isProcessing && (
                            <div className="processing-overlay">
                                <p>Processando imagem...</p>
                            </div>
                        )}
                        <CanvasEditor />
                    </div>
                </main>

                <footer className="app-footer">
                    <p>Desenvolvido com React e MediaPipe Image Segmenter</p>
                </footer>
            </div>
        </AppContext.Provider>
    );
}

export default App;