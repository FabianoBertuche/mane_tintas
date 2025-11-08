import React, { useContext } from 'react';
import { AppContext } from '../App';

const defaultColors = [
  '#FF0000', // Vermelho
  '#00FF00', // Verde
  '#0000FF', // Azul
  '#FFFF00', // Amarelo
  '#FF00FF', // Magenta
  '#00FFFF', // Ciano
  '#FFFFFF', // Branco
  '#000000', // Preto
  '#808080', // Cinza
  '#FFA500'  // Laranja
];

function ColorPalette() {
  const { selectedColor, setSelectedColor } = useContext(AppContext);

  return (
    <div className="color-palette">
      <h2>Paleta de Cores</h2>
      <div className="colors-grid">
        {defaultColors.map((color) => (
          <button
            key={color}
            className={`color-button ${selectedColor === color ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
            title={color}
          />
        ))}
      </div>
      <div className="custom-color">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="color-picker"
        />
        <span>Cor Personalizada</span>
      </div>
    </div>
  );
}

export default ColorPalette;
