<script setup>
import { defineProps, watch, ref } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement } from 'chart.js';
import { Bar, Pie } from 'vue-chartjs';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement);

// Props for the chart component
const props = defineProps({
  type: { type: String, required: true },       // 'bar' or 'pie'
  chartData: { type: Object, required: true },
  chartOptions: { type: Object, default: () => ({}) },
});

const chartRef = ref(null);

// Watch for reactive data updates
watch(
  () => props.chartData,
  (newData) => {
    if (chartRef.value) {
      chartRef.value.renderChart(newData, props.chartOptions);
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <component
    :is="props.type === 'bar' ? Bar : Pie"
    ref="chartRef"
    :chart-data="chartData"
    :chart-options="chartOptions"
  />
</template>
