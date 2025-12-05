<template>
  <v-container fluid class="neomorphic-container dashboard-container">
    <!-- Header Card -->
    <div class="neomorphic-card header-card mb-4">
      <div class="d-flex align-center justify-space-between pa-3">
        <div>
          <h2 class="page-title">Dashboard</h2>
          <p class="welcome-text">Welcome to your dashboard!</p>
        </div>
        <div class="action-buttons">
          <button class="neomorphic-btn neomorphic-btn-icon" @click="fetchDashboardData" title="Refresh">
            <v-icon color="#667eea">mdi-refresh</v-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-4" dense>
      <v-col cols="12" sm="4">
        <div class="neomorphic-card stat-card pa-4">
          <div class="stat-icon">
            <v-icon size="32" color="#667eea">mdi-account-group</v-icon>
          </div>
          <h3 class="stat-title">Users</h3>
          <p class="stat-value">{{ usersCount }}</p>
        </div>
      </v-col>

      <v-col cols="12" sm="4">
        <div class="neomorphic-card stat-card pa-4">
          <div class="stat-icon">
            <v-icon size="32" color="#667eea">mdi-file-document-multiple</v-icon>
          </div>
          <h3 class="stat-title">Inquiries</h3>
          <p class="stat-value">{{ inquiriesCount }}</p>
        </div>
      </v-col>

      <v-col cols="12" sm="4">
        <div class="neomorphic-card stat-card pa-4">
          <div class="stat-icon">
            <v-icon size="32" color="#667eea">mdi-folder-multiple</v-icon>
          </div>
          <h3 class="stat-title">Sections</h3>
          <p class="stat-value">{{ sectionsCount }}</p>
        </div>
      </v-col>
    </v-row>

    <!-- Chart Section -->
    <v-row dense>
      <v-col cols="12" md="4">
        <div class="neomorphic-card chart-card pa-4">
          <h3 class="chart-title">Inquiries - Monthly</h3>
          <div class="chart-wrapper">
            <canvas ref="inquiryChart"></canvas>
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="4">
        <div class="neomorphic-card chart-card pa-4">
          <h3 class="chart-title">Inquiries by Status</h3>
          <div class="chart-wrapper">
            <canvas ref="inquiryStatusPie"></canvas>
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="4">
        <div class="neomorphic-card chart-card pa-4">
          <h3 class="chart-title">Average Rating</h3>
          <div class="chart-wrapper gauge-wrapper">
            <canvas ref="ratingGauge"></canvas>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores/theme';
// Theme store for detecting theme changes
const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);
import { http } from '@/api/http';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const usersCount = ref(0);
const inquiriesCount = ref(0);
const sectionsCount = ref(0);
const monthlyCounts = ref([]);
const statusCounts = ref({});
const avgRating = ref(0);

// Map of status id -> friendly name (used for the status pie chart)
const statusOptions = {
  '1': 'Processing',
  '2': 'Work Done',
  '3': 'Can Not Done - Legal Issue',
  '4': 'Can Not Done - Document Issue'
};

const inquiryChart = ref(null);
let chartInstance = null;

// Pie chart for inquiry status
const inquiryStatusPie = ref(null);
let pieChartInstance = null;

// Rating gauge
const ratingGauge = ref(null);
let gaugeChartInstance = null;

const fetchDashboardData = async () => {
  try {
    // Add cache-busting timestamp to prevent HTTP caching
    const res = await http.get('/api/dashboard', {
      params: { _t: Date.now() }
    });
    const data = res.data;
    
    usersCount.value = data.usersCount;
    inquiriesCount.value = data.inquiriesCount;
    sectionsCount.value = data.sectionsCount;
    monthlyCounts.value = data.monthlyCounts || [];
    statusCounts.value = data.statusCounts || {};
    avgRating.value = data.avgRating || 0;
    
    buildInquiryChart();
    buildInquiryStatusPie();
    buildRatingGauge();
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err);
    usersCount.value = 0;
    inquiriesCount.value = 0;
    sectionsCount.value = 0;
  }
};

const buildRatingGauge = () => {
  if (!ratingGauge.value) return;

  const rating = avgRating.value;

  if (gaugeChartInstance) {
    gaugeChartInstance.destroy();
    gaugeChartInstance = null;
  }

  gaugeChartInstance = new Chart(ratingGauge.value, {
    type: 'doughnut',
    data: {
      labels: ['Rating'],
      datasets: [{
        data: [rating, 4 - rating], // Store rating value (1-4 scale)
        backgroundColor: ['transparent', 'transparent'],
        borderWidth: 0
      }]
    },
    options: {
      rotation: -Math.PI,
      circumference: Math.PI,
      cutout: '75%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    },
    plugins: [{
      id: 'speedometer',
      afterDraw(chart) {
        // Get the rating value from the chart data (1-4 scale)
        const rating = chart.data.datasets[0].data[0] || 0;
        
        const { ctx, chartArea: { width, height } } = chart;
        const centerX = width / 2;
        const centerY = height - 50; // Move center up to leave space for bottom labels
        const radius = Math.min(width, (height - 20) * 2) / 2 - 20;
        

        // Draw colored arc segments (speedometer bands) for 1-4 scale
        const segments = [
          { start: 0, end: 0.25, color: '#EF5350' },    // Red: 1
          { start: 0.25, end: 0.5, color: '#FF9800' },  // Orange: 2
          { start: 0.5, end: 0.75, color: '#FFEB3B' },  // Yellow: 3
          { start: 0.75, end: 1, color: '#66BB6A' }     // Green: 4
        ];

        segments.forEach(seg => {
          const startAngle = Math.PI + (Math.PI * seg.start);
          const endAngle = Math.PI + (Math.PI * seg.end);
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, startAngle, endAngle);
          ctx.lineWidth = 15;
          ctx.strokeStyle = seg.color;
          ctx.stroke();
        });

        // Draw scale marks and labels (Poor, Fair, Good, Very Good from left to right)
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 2;
        
        const labels = ['Poor', 'Fair', 'Good', 'Very Good'];
        
               // Use CSS variable for gauge value color based on theme
        let gaugeValueColor = getComputedStyle(document.documentElement).getPropertyValue('--dashboard-gauge-value-color')?.trim();
        if (!gaugeValueColor) {
          // fallback to accent if variable not set
          gaugeValueColor = getComputedStyle(document.documentElement).getPropertyValue('--neomorphic-accent')?.trim() || '#39dde3';
        }

        for (let i = 0; i <= 3; i++) {
          const angle = Math.PI + (Math.PI * (i / 3));
          const markRadius = radius - 8;
          const labelRadius = radius - 32;
          
          const markX = centerX + Math.cos(angle) * markRadius;
          const markY = centerY + Math.sin(angle) * markRadius;
          
          // Draw tick marks
          ctx.beginPath();
          ctx.moveTo(markX, markY);
          const innerX = centerX + Math.cos(angle) * (markRadius - 10);
          const innerY = centerY + Math.sin(angle) * (markRadius - 10);
          ctx.lineTo(innerX, innerY);
          ctx.stroke();
          
          // Draw labels at each tick
          const labelX = centerX + Math.cos(angle) * labelRadius;
          const labelY = centerY + Math.sin(angle) * labelRadius;
          ctx.font = '600 10px sans-serif';
          ctx.fillStyle = gaugeValueColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labels[i], labelX, labelY);
        }

        // Draw needle - rating is on 1-4 scale, normalize to 0-1 for angle
        // Subtract 1 to convert 1-4 to 0-3, then divide by 3
        const normalizedRating = (rating - 1) / 3;
        const needleAngle = Math.PI + (Math.PI * normalizedRating);
        const needleLength = radius - 18;
        
        // Calculate needle endpoint
        const needleX = centerX + Math.cos(needleAngle) * needleLength;
        const needleY = centerY + Math.sin(needleAngle) * needleLength;
        
        // Draw the needle as a thick line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(needleX, needleY);
        ctx.strokeStyle = '#D32F2F';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw a triangle at the tip aligned with the needle
        ctx.save();
        ctx.translate(needleX, needleY);
        ctx.rotate(needleAngle + Math.PI / 2); // Rotate 90 degrees to align with needle direction
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(-6, 4);
        ctx.lineTo(6, 4);
        ctx.closePath();
        ctx.fillStyle = '#D32F2F';
        ctx.fill();
        ctx.restore();

        // Center circle (needle pivot)
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#D32F2F';
        ctx.fill();
        ctx.strokeStyle = '#B71C1C';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Display rating value
        ctx.font = '700 20px sans-serif';
        ctx.fillStyle = gaugeValueColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(rating.toFixed(1), centerX, centerY + 15);
        
        ctx.font = '400 12px sans-serif';
        ctx.fillStyle = gaugeValueColor;
        ctx.fillText('out of 4', centerX, centerY + 38);
      }
    }]
  });
};

const buildInquiryStatusPie = () => {
  if (!inquiryStatusPie.value) return;

  const labels = Object.keys(statusCounts.value).map(k => {
    if (statusOptions[k]) return statusOptions[k]
    if (k === 'unknown') return 'Unknown'
    return k
  });
  const data = Object.values(statusCounts.value);

  if (pieChartInstance) {
    pieChartInstance.destroy();
    pieChartInstance = null;
  }

  pieChartInstance = new Chart(inquiryStatusPie.value, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC', '#26C6DA'
        ],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
};

const buildInquiryChart = () => {
  if (!inquiryChart.value) return;

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  chartInstance = new Chart(inquiryChart.value, {
    type: 'bar',
    data: {
      labels: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
      datasets: [
        {
          label: 'Inquiries per Month',
          data: monthlyCounts.value,
          barThickness: 10,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });
};

onMounted(() => {
  fetchDashboardData();
  // Watch for theme changes and redraw the gauge immediately
  watch(isDark, () => {
    buildRatingGauge();
  });
});
</script>

<style scoped lang="scss">
@import '@/assets/neomorphic.scss';

.dashboard-container {
  overflow-y: auto !important;
  height: calc(100vh - 64px - 40px - 8px) !important;
}

.welcome-text {
  color: var(--neomorphic-text-light);
  font-size: 14px;
  margin: 8px 0 0 0;
}

.stat-card {
  text-align: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  .stat-icon {
    margin-bottom: 12px;
  }
  
  .stat-title {
    color: var(--neomorphic-text);
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 8px 0;
  }
  
  .stat-value {
    color: var(--neomorphic-accent);
    font-size: 32px;
    font-weight: 700;
    margin: 0;
  }
}

.chart-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .chart-title {
    color: var(--neomorphic-text);
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
    text-align: center;
  }
  
  .chart-wrapper {
    flex: 1;
    position: relative;
    min-height: 250px;
    
    canvas {
      max-width: 100%;
      height: auto;
    }
  }
  
  .gauge-wrapper {
    min-height: 240px;
    padding-bottom: 10px;
  }
}
</style>
