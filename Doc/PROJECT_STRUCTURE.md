# Estrutura do Projeto

A estrutura de pastas foi pensada para ser escalável e organizada, seguindo as melhores práticas de desenvolvimento web moderno.

/
|-- public/
|   |-- index.html      # Arquivo HTML principal
|   |-- favicon.ico     # Ícone do site
|
|-- src/
|   |-- assets/         # Imagens, fontes e outros arquivos estáticos
|   |   |-- styles/
|   |       |-- main.css # Estilos globais
|   |
|   |-- components/     # Componentes de UI reutilizáveis
|   |   |-- ImageUploader.js
|   |   |-- ColorPalette.js
|   |   |-- CanvasEditor.js
|   |
|   |-- services/       # Lógica de negócio e comunicação com APIs
|   |   |-- imageProcessor.js # Módulo com a lógica de segmentação (OpenCV/MediaPipe)
|   |   |-- canvasUtils.js    # Funções utilitárias para o canvas
|   |
|   |-- hooks/          # (Se usar React) Hooks customizados
|   |   |-- useImageState.js
|   |
|   |-- App.js          # Componente principal que une tudo
|   |-- index.js        # Ponto de entrada da aplicação
|
|-- .gitignore          # Arquivos e pastas a serem ignorados pelo Git
|-- package.json        # Dependências e scripts do projeto
|-- README.md           # Documentação principal
|-- PROJECT_STRUCTURE.md # Este arquivo
|-- DEVELOPMENT_GUIDE.md # Guia de desenvolvimento

