export function imageDimensions(width: number, height: number) {
  const scale = Math.min(1, 1600 / Math.max(width, height));
  return { width: Math.floor(width * scale), height: Math.floor(height * scale) };
}

export function redimensionar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        const dimensions = imageDimensions(img.width, img.height);
        c.width = dimensions.width;
        c.height = dimensions.height;
        const ctx = c.getContext('2d');
        if (!ctx) throw new Error('Não consegui ler a foto.');
        ctx.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.85));
      } catch (error) { reject(error); }
      finally { URL.revokeObjectURL(url); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Não consegui ler a foto.')); };
    img.src = url;
  });
}