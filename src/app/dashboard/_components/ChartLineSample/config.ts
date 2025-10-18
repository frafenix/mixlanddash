export const chartColors = {
  default: {
    primary: "#3B82F6", // Blue-500 - più moderno
    info: "#06B6D4", // Cyan-500 - migliore contrasto
    danger: "#EF4444", // Red-500 - più leggibile
    success: "#10B981", // Emerald-500 - coerente con il design system
    warning: "#F59E0B", // Amber-500 - migliore visibilità
  },
};

const randomChartData = (n: number) => {
  const data: number[] = [];

  for (let i = 0; i < n; i++) {
    data.push(Math.round(Math.random() * 200));
  }

  return data;
};

const datasetObject = (color: keyof typeof chartColors.default, points: number) => {
  return {
    fill: false,
    borderColor: chartColors.default[color],
    backgroundColor: `${chartColors.default[color]}20`, // Aggiunge trasparenza per l'area sotto la linea
    borderWidth: 3,
    borderDash: [],
    borderDashOffset: 0.0,
    pointBackgroundColor: chartColors.default[color],
    pointBorderColor: "#ffffff",
    pointHoverBackgroundColor: chartColors.default[color],
    pointBorderWidth: 2,
    pointHoverRadius: 6,
    pointHoverBorderWidth: 3,
    pointRadius: 5,
    data: randomChartData(points),
    tension: 0.4,
    cubicInterpolationMode: "default" as const,
  };
};

export const sampleChartData = (points = 9) => {
  const labels: string[] = [];

  for (let i = 1; i <= points; i++) {
    labels.push(`${i < 10 ? '0' : ''}${i}`);
  }

  return {
    labels,
    datasets: [
      {
        ...datasetObject("primary", points),
        label: "Vendite",
      },
      {
        ...datasetObject("success", points),
        label: "Clienti",
      },
      {
        ...datasetObject("info", points),
        label: "Performance",
      },
    ],
  };
};
