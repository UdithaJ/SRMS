<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-sheet elevation="1" class="pa-4">
          <v-row>
            <v-col cols="12">
              <h1>Dashboard</h1>
              <p>Welcome to your dashboard!</p>
            </v-col>
          </v-row>

          <v-row class="mt-4" dense>
            <!-- Users Card -->
            <v-col cols="12" sm="4">
              <v-card outlined>
                <v-card-title>Users</v-card-title>
                <v-card-text>
                  Number of users: {{ usersCount }}
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Inquiries Card -->
            <v-col cols="12" sm="4">
              <v-card outlined>
                <v-card-title>Inquiries</v-card-title>
                <v-card-text>
                  Number of inquiries: {{ inquiriesCount }}
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Sections Card -->
            <v-col cols="12" sm="4">
              <v-card outlined>
                <v-card-title>Sections</v-card-title>
                <v-card-text>
                  Number of sections: {{ sectionsCount }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Chart Section -->
          <v-row class="mt-6">
            <v-col cols="12" md="4">
              <v-card elevation="2" class="pa-4">
                <v-card-title>Inquiries - Monthly</v-card-title>
                <v-card-text>
                  <v-responsive  max-width="600" max-height="400">
                    <canvas ref="inquiryChart"></canvas>
                  </v-responsive>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card elevation="2" class="pa-4">
                <v-card-title>Inquiries by Status</v-card-title>
                <v-card-text>
                  <v-responsive  max-width="400" max-height="400">
                    <canvas ref="inquiryStatusPie"></canvas>
                  </v-responsive>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card elevation="2" class="pa-4">
                <v-card-title class="pb-0">Average Rating</v-card-title>
                <v-card-text class="pt-0">
                  <v-responsive max-width="300" max-height="200">
                    <canvas ref="ratingGauge"></canvas>
                  </v-responsive>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { http } from '@/api/http';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const usersCount = ref(0);
const inquiriesCount = ref(0);
const sectionsCount = ref(0);
const monthlyCounts = ref([]);
const statusCounts = ref({});
const ratingPercent = ref(0);

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
    const res = await http.get('/api/dashboard');
    const data = res.data;
    
    usersCount.value = data.usersCount;
    inquiriesCount.value = data.inquiriesCount;
    sectionsCount.value = data.sectionsCount;
    monthlyCounts.value = data.monthlyCounts;
    statusCounts.value = data.statusCounts;
    ratingPercent.value = data.ratingPercent;
    
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

  const percent = ratingPercent.value;

  if (gaugeChartInstance) gaugeChartInstance.destroy();

  gaugeChartInstance = new Chart(ratingGauge.value, {
    type: 'doughnut',
    data: {
      labels: ['Rating'],
      datasets: [{
        data: [percent, 100 - percent], // Store rating value in data
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
        // Get the rating value from the chart data
        const ratingPercent = chart.data.datasets[0].data[0] || 0;
        
        const { ctx, chartArea: { width, height } } = chart;
        const centerX = width / 2;
        const centerY = height;
        const radius = Math.min(width, height * 2) / 2 - 20;
        

        // Draw colored arc segments (speedometer bands)
        const segments = [
          { start: 0, end: 0.33, color: '#EF5350' },   // Red: 0-33
          { start: 0.33, end: 0.66, color: '#FFA726' }, // Orange: 33-66
          { start: 0.66, end: 1, color: '#66BB6A' }     // Green: 66-100
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

        // Draw scale marks and numbers (0 to 100 from left to right)
        ctx.fillStyle = '#424242';
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 2;
        
        for (let i = 0; i <= 10; i++) {
          const angle = Math.PI + (Math.PI * (i / 10));
          const markRadius = radius - 8;
          const numberRadius = radius - 25;
          
          const markX = centerX + Math.cos(angle) * markRadius;
          const markY = centerY + Math.sin(angle) * markRadius;
          
          // Draw tick marks
          ctx.beginPath();
          ctx.moveTo(markX, markY);
          const innerX = centerX + Math.cos(angle) * (markRadius - (i % 2 === 0 ? 10 : 5));
          const innerY = centerY + Math.sin(angle) * (markRadius - (i % 2 === 0 ? 10 : 5));
          ctx.lineTo(innerX, innerY);
          ctx.stroke();
          
          // Draw numbers at major ticks (0, 20, 40, 60, 80, 100)
          if (i % 2 === 0) {
            const numX = centerX + Math.cos(angle) * numberRadius;
            const numY = centerY + Math.sin(angle) * numberRadius;
            ctx.font = '600 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((i * 10).toString(), numX, numY);
          }
        }

        // Draw needle - direct calculation (not reversed)
        const needleAngle = Math.PI + (Math.PI * (ratingPercent / 100));
        const needleLength = radius - 18;
        
        console.log('Needle drawing:', { needleAngle, needleLength, ratingPercent, radius });
        
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
        ctx.fillStyle = '#212121';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(ratingPercent.toFixed(1), centerX, centerY + 15);
        
        ctx.font = '400 12px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('out of 100', centerX, centerY + 38);
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

  if (pieChartInstance) pieChartInstance.destroy();

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

  if (chartInstance) chartInstance.destroy();

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
});
</script>

<style scoped>
h1 {
  margin: 0;
}

p {
  margin: 0 0 16px 0;
}
</style>
