# Guia de Desenvolvimento

Este documento serve como um guia técnico para o desenvolvimento do projeto.

## Fluxo de Trabalho da Funcionalidade Principal

1.  **Carregamento da Imagem (`ImageUploader.js`):**
    -   O usuário seleciona um arquivo através de um `<input type="file">`.
    -   A imagem é convertida para um formato que o canvas possa usar (ex: `ImageBitmap`).
    -   O estado global da aplicação é atualizado com a nova imagem.

2.  **Exibição e Interação (`CanvasEditor.js`):**
    -   O componente "escuta" as mudanças no estado da imagem. Ao receber uma nova imagem, ele a desenha em um `<canvas>`.
    -   Um evento de clique (`onClick`) é adicionado ao canvas.
    -   Ao clicar, as coordenadas (x, y) do mouse são capturadas.

3.  **Processamento e Segmentação (`imageProcessor.js`):**
    -   A função de processamento é chamada, recebendo a imagem e as coordenadas do clique.
    -   **Decisão Técnica:** Usaremos o **MediaPipe Image Segmenter** por ser mais moderno e otimizado para o navegador.
    -   A biblioteca de IA processa a imagem e retorna uma "máscara de segmentação" para a área clicada. Esta máscara informa quais pixels pertencem ao objeto selecionado.

4.  **Aplicação da Cor (`CanvasEditor.js` e `canvasUtils.js`):**
    -   O usuário seleciona uma cor na `ColorPalette.js`. O estado global é atualizado com a cor ativa.
    -   Com a máscara de segmentação em mãos, uma função em `canvasUtils.js` percorre os dados do canvas.
    -   Para cada pixel que pertence à máscara, sua cor é alterada para a cor selecionada.
    -   O canvas é redesenhado para exibir o resultado.

## Decisões de Arquitetura

-   **Gerenciamento de Estado:** Para começar, o `useState` e `useContext` do React são suficientes. Se a aplicação crescer, podemos migrar para Zustand ou Redux Toolkit.
-   **Performance:** A segmentação de imagem será executada de forma assíncrona (`async/await`) para não bloquear a interface. Se o desempenho em imagens grandes for um problema, a lógica será movida para um Web Worker.
-   **Estilo:** Usaremos CSS Modules para garantir que os estilos de um componente não afetem os outros.

