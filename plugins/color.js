import ColorHash from 'color-hash';

export default (data, inject) => {
  const colorHash = new ColorHash({ hue: { min: 200, max: 270 } });

  inject('color', {
    hex(text) {
      return colorHash.hex(text);
    },
    rgba(text, a) {
      const [r, g, b] = colorHash.rgb(text);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    },
  });
};
