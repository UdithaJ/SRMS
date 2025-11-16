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
                <v-card-title>Average Rating</v-card-title>
                <v-card-text>
                  <v-responsive max-width="300" max-height="180">
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

const fetchUsersCount = async () => {
  try {
    const res = await http.get('/api/auth/users');
    usersCount.value = res.data.length;
  } catch (err) {
    console.error('Failed to fetch users count:', err);
    usersCount.value = 0;
  }
};

const fetchInquiriesCount = async () => {
  try {
    const res = await http.get('/api/inquiries');
    inquiriesCount.value = res.data.length;
    buildInquiryChart(res.data);
    buildInquiryStatusPie(res.data);
    buildRatingGauge(res.data);
  } catch (err) {
    console.error('Failed to fetch inquiries count:', err);
    inquiriesCount.value = 0;
  }
};

const buildRatingGauge = (inquiries) => {
  if (!ratingGauge.value) return;

  // Compute average rating ONLY for "Work Done" inquiries (status id = 2)
  // Ratings are on a 1-10 scale. Missing ratings count as 0 in the total.
  const workDone = Array.isArray(inquiries)
    ? inquiries.filter(i => Number(i?.status) === 2)
    : [];
  const totalInquiries = workDone.length || 0;
  const sumRatings = workDone.reduce((s, i) => s + (Number(i.rating) || 0), 0);
  const avg = totalInquiries ? (sumRatings / totalInquiries) : 0;

  // Convert average (0-10) to percentage 0-100
  const percent = Math.max(0, Math.min(100, (avg / 10) * 100));

  const data = [percent, 100 - percent];

  if (gaugeChartInstance) gaugeChartInstance.destroy();

  gaugeChartInstance = new Chart(ratingGauge.value, {
    type: 'doughnut',
    data: {
      labels: ['Average', 'Remaining'],
      datasets: [{
        data,
        backgroundColor: ['#66BB6A', '#e0e0e0'],
        hoverBackgroundColor: ['#66BB6A', '#e0e0e0'],
        borderWidth: 0
      }]
    },
    options: {
      rotation: Math.PI,
      circumference: Math.PI,
      cutout: '70%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      }
    },
    plugins: [{
      id: 'gauge-needle',
      afterDraw(chart) {
        const { ctx, chartArea: { width, height }, _metasets } = chart;
        const centerX = chart.getDatasetMeta(0).data[0].x;
        const centerY = chart.getDatasetMeta(0).data[0].y;

        // angle from PI to 2PI
        const angle = Math.PI + (Math.PI * (percent / 100));

        // draw needle
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(0, - (Math.min(width, height) / 2) + 20);
        ctx.lineTo(6, 0);
        ctx.fillStyle = '#424242';
        ctx.fill();
        ctx.restore();

        // center text - show avg to one decimal on 10-point scale
        ctx.font = '600 16px sans-serif';
        ctx.fillStyle = '#212121';
        ctx.textAlign = 'center';
        ctx.fillText((avg).toFixed(1) + ' / 10', centerX, centerY + 20);
      }
    }]
  });
};

const buildInquiryStatusPie = (inquiries) => {
  if (!inquiryStatusPie.value) return;

  const counts = {};
  inquiries.forEach((inq) => {
    const statusKey = String(inq.status ?? 'unknown');
    counts[statusKey] = (counts[statusKey] || 0) + 1;
  });

  const labels = Object.keys(counts).map(k => {
    if (statusOptions[k]) return statusOptions[k]
    if (k === 'unknown') return 'Unknown'
    return k
  });
  const data = Object.values(counts);

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

const fetchSectionsCount = async () => {
  try {
    const res = await http.get('/api/sections');
    sectionsCount.value = res.data.length;
  } catch (err) {
    console.error('Failed to fetch sections count:', err);
    sectionsCount.value = 0;
  }
};

const buildInquiryChart = (inquiries) => {
  if (!inquiryChart.value) return;

  const monthlyCounts = Array(12).fill(0);
  inquiries.forEach((inq) => {
    const month = new Date(inq.createdAt).getMonth();
    monthlyCounts[month]++;
  });

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
          data: monthlyCounts,
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
  fetchUsersCount();
  fetchInquiriesCount();
  fetchSectionsCount();
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
