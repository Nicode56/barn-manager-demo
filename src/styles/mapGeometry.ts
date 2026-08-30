
// mapGeometry.ts
import { Point, ShapeType, FarmShape } from "../store/farmLayout/farmLayoutTypes";

/* -------------------------------------------------------
   Stadium Path (rounded rectangle)
------------------------------------------------------- */
export function stadiumPath(width: number, height: number): string {
  const r = height / 2;
  return `
    M ${r} 0
    H ${width - r}
    A ${r} ${r} 0 0 1 ${width - r} ${height}
    H ${r}
    A ${r} ${r} 0 0 1 ${r} 0
    Z
  `;
}

/* -------------------------------------------------------
   AVIARY — Regular Octagon (stop‑sign shape)
------------------------------------------------------- */
export function generateAviaryTentPolygon(
  width: number,
  height: number
): Point[] {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.45;

  const points: Point[] = [];
  const sides = 8; // regular octagon

  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    points.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }

  return points;
}

/* -------------------------------------------------------
   Convert preset shapes → polygon points
------------------------------------------------------- */
export function generateOutlinePoints(shape: FarmShape): Point[] {
  const { x, y, width = 160, height = 100, r } = shape;

  switch (shape.type) {
    case "rect":
      return [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height },
      ];

    case "circle": {
      const cx = x + (r ?? 60);
      const cy = y + (r ?? 60);
      const radius = r ?? 60;
      const pts: Point[] = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        pts.push({
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        });
      }
      return pts;
    }

    case "stadium": {
      const pts: Point[] = [];
      const h = height;
      const w = width;
      const rr = h / 2;

      pts.push({ x, y: y + rr });
      pts.push({ x: x + rr, y });
      pts.push({ x: x + w - rr, y });
      pts.push({ x: x + w, y: y + rr });
      pts.push({ x: x + w - rr, y: y + h });
      pts.push({ x: x + rr, y: y + h });

      return pts;
    }

    case "aviary": {
      const local = generateAviaryTentPolygon(width, height);
      return local.map((p) => ({ x: p.x + x, y: p.y + y }));
    }

    default:
      return [];
  }
}

/* -------------------------------------------------------
   Snap freeform polygon → preset shape bounding box
------------------------------------------------------- */
export function snapPointsToShape(points: Point[], baseType: ShapeType) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  const width = maxX - minX;
  const height = maxY - minY;

  if (baseType === "circle") {
    const r = Math.max(width, height) / 2;
    return { x: minX, y: minY, width, height, r };
  }

  return { x: minX, y: minY, width, height };
}





