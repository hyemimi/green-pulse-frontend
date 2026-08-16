type ScaleOptions = {
  paddingRatio?: number;
  minPadding?: number;
};

function getScale(values: number[], height: number, options: ScaleOptions = {}) {
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;
  const paddingRatio = options.paddingRatio ?? 0.12;
  const minPadding = options.minPadding ?? 0;
  const padding = range === 0 ? Math.max(Math.abs(maxValue) * 0.02, minPadding, 1) : Math.max(range * paddingRatio, minPadding);
  const min = minValue - padding;
  const max = maxValue + padding;

  return { min, max, height };
}

function scaledY(value: number, scale: ReturnType<typeof getScale>) {
  return scale.height - ((value - scale.min) / (scale.max - scale.min)) * scale.height;
}

export function buildLinePath(values: number[], width: number, height: number, options?: ScaleOptions) {
  const scale = getScale(values, height, options);

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = scaledY(value, scale);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function buildPoints(values: number[], width: number, height: number, yOffset = 0, options?: ScaleOptions) {
  const scale = getScale(values, height, options);

  return values.map((value, index) => ({
    x: (index / (values.length - 1)) * width,
    y: scaledY(value, scale) + yOffset,
  }));
}
