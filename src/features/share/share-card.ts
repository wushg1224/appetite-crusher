const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function drawPixelPen(context: CanvasRenderingContext2D) {
  context.save();
  context.translate(175, 520);
  context.rotate(-Math.PI / 14);

  context.fillStyle = "rgba(88, 71, 95, 0.16)";
  context.fillRect(44, 118, 700, 74);

  context.fillStyle = "#58475f";
  context.fillRect(30, 70, 740, 98);
  context.fillStyle = "#f36f9c";
  context.fillRect(54, 86, 490, 66);
  context.fillStyle = "#fffaf1";
  context.fillRect(544, 86, 160, 66);
  context.fillStyle = "#9dd9ed";
  context.fillRect(704, 96, 108, 46);
  context.fillStyle = "#58475f";
  context.fillRect(812, 108, 78, 22);
  context.fillRect(16, 94, 38, 50);
  context.fillStyle = "#ffffff";
  context.fillRect(88, 101, 245, 14);
  context.fillStyle = "#c84570";
  context.fillRect(408, 86, 18, 66);

  context.restore();
}

export function createShareCardBlob(streakDays: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;

  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new Error("Canvas is unavailable"));

  const background = context.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  background.addColorStop(0, "#ffe7ee");
  background.addColorStop(0.5, "#fff8e8");
  background.addColorStop(1, "#cdebf7");
  context.fillStyle = background;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  context.save();
  context.globalAlpha = 0.16;
  context.fillStyle = "#58475f";
  for (let x = 0; x < CARD_WIDTH; x += 32) {
    for (let y = 0; y < CARD_HEIGHT; y += 32) {
      if ((x / 32 + y / 32) % 2 === 0) context.fillRect(x, y, 2, 2);
    }
  }
  context.restore();

  context.save();
  context.shadowColor = "rgba(88, 71, 95, 0.16)";
  context.shadowBlur = 42;
  context.shadowOffsetY = 22;
  roundedRect(context, 78, 78, 924, 1194, 84);
  context.fillStyle = "rgba(255, 253, 248, 0.9)";
  context.fill();
  context.restore();

  context.fillStyle = "#c84570";
  context.font = '900 52px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.textAlign = "center";
  context.fillText("食欲粉碎机", CARD_WIDTH / 2, 260);

  context.fillStyle = "#58475f";
  context.font = '900 88px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText("我已连续粉碎食欲", CARD_WIDTH / 2, 400);

  context.fillStyle = "#f36f9c";
  context.font = '950 190px "Arial Black", "PingFang SC", sans-serif';
  context.fillText(`${streakDays} 天`, CARD_WIDTH / 2, 885);

  drawPixelPen(context);

  context.fillStyle = "#58475f";
  context.fillRect(410, 1110, 260, 12);
  context.fillStyle = "#f36f9c";
  context.fillRect(490, 1160, 100, 12);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Share card generation failed"));
    }, "image/png");
  });
}
