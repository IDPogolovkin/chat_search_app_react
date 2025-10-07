import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
        },
    },
};

const barChartOptions = {
    ...chartOptions,
    indexAxis: 'y',
    scales: {
        x: {
            beginAtZero: true
        }
    }
};

function Dashboard({ stats }) {
    if (!stats) return null;

    const platformData = {
        labels: Object.keys(stats.byPlatform),
        datasets: [{
            data: Object.values(stats.byPlatform),
            backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],
        }],
    };
    
    const topChatsData = {
        labels: stats.topChats.map(c => c.subject),
        datasets: [{
            label: 'Сообщений в чате',
            data: stats.topChats.map(c => c.count),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }],
    };

    const topContactsData = {
        labels: stats.topContacts.map(c => c.name),
        datasets: [{
            label: 'Всего сообщений',
            data: stats.topContacts.map(c => c.count),
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
        }],
    };

    return (
        <div style={{ height: '600px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ flex: 1, border: '1px solid var(--line)', borderRadius: '12px', padding: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Сообщения по платформам</h4>
                <div style={{ position: 'relative', height: '80%' }}>
                    <Pie data={platformData} options={chartOptions} />
                </div>
            </div>
            <div style={{ flex: 1, border: '1px solid var(--line)', borderRadius: '12px', padding: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Топ 5 чатов</h4>
                <div style={{ position: 'relative', height: '80%' }}>
                    <Bar data={topChatsData} options={barChartOptions} />
                </div>
            </div>
             <div style={{ flex: 1, border: '1px solid var(--line)', borderRadius: '12px', padding: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Топ 5 контактов</h4>
                <div style={{ position: 'relative', height: '80%' }}>
                    <Bar data={topContactsData} options={barChartOptions} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;