import React, { useMemo } from 'react';
import { 
  Users, Award, Activity, TrendingDown
} from 'lucide-react';
import { 
  PieChart as RePieChart, Pie, Cell, 
  ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

// Komponen Statistik Page
const StatistikPage = ({ students = [], darkMode = false }) => {
  
  // Perhitungan statistik
  const stats = useMemo(() => {
    const total = students.length;
    const aktif = students.filter(s => s.status === 'Aktif').length;
    const lulus = students.filter(s => s.status === 'Lulus').length;
    const tidakAktif = students.filter(s => s.status === 'Tidak Aktif').length;
    const mengundurkanDiri = students.filter(s => s.status === 'Mengundurkan Diri').length;
    const lakiLaki = students.filter(s => s.jenis_kelamin === 'Laki-laki').length;
    const perempuan = students.filter(s => s.jenis_kelamin === 'Perempuan').length;
    
    return {
      total,
      aktif,
      lulus,
      tidakAktif,
      mengundurkanDiri,
      tingkatKelulusan: total > 0 ? ((lulus / total) * 100).toFixed(1) : 0,
      siswaAktifPersen: total > 0 ? ((aktif / total) * 100).toFixed(0) : 0,
      dropoutRate: total > 0 ? ((mengundurkanDiri / total) * 100).toFixed(1) : 0,
      lakiLaki,
      perempuan
    };
  }, [students]);

  // Data untuk distribusi status (dengan progress bar)
  const statusData = useMemo(() => [
    { 
      name: 'Aktif', 
      value: stats.aktif, 
      percentage: stats.siswaAktifPersen,
      color: 'bg-green-500',
      bgColor: darkMode ? 'bg-gray-700' : 'bg-gray-200'
    },
    { 
      name: 'Lulus', 
      value: stats.lulus, 
      percentage: stats.tingkatKelulusan,
      color: 'bg-blue-500',
      bgColor: darkMode ? 'bg-gray-700' : 'bg-gray-200'
    },
    { 
      name: 'Tidak Aktif', 
      value: stats.tidakAktif, 
      percentage: stats.total > 0 ? ((stats.tidakAktif / stats.total) * 100).toFixed(1) : 0,
      color: 'bg-yellow-500',
      bgColor: darkMode ? 'bg-gray-700' : 'bg-gray-200'
    },
    { 
      name: 'Mengundurkan Diri', 
      value: stats.mengundurkanDiri, 
      percentage: stats.dropoutRate,
      color: 'bg-red-500',
      bgColor: darkMode ? 'bg-gray-700' : 'bg-gray-200'
    },
  ], [stats, darkMode]);

  // Data untuk jenis kelamin (Pie Chart)
  const genderData = useMemo(() => [
    { name: 'Laki-laki', value: stats.lakiLaki },
    { name: 'Perempuan', value: stats.perempuan }
  ], [stats]);

  // Data per kejuruan untuk bar chart
  const kejuruanStats = useMemo(() => {
    const uniqueKejuruan = [...new Set(students.map(s => s.kejuruan).filter(Boolean))];
    return uniqueKejuruan.map(kejuruan => {
      const kejuruanStudents = students.filter(s => s.kejuruan === kejuruan);
      return {
        name: kejuruan,
        total: kejuruanStudents.length,
        aktif: kejuruanStudents.filter(s => s.status === 'Aktif').length,
        lulus: kejuruanStudents.filter(s => s.status === 'Lulus').length,
        tidakAktif: kejuruanStudents.filter(s => s.status === 'Tidak Aktif').length,
        mengundurkanDiri: kejuruanStudents.filter(s => s.status === 'Mengundurkan Diri').length
      };
    });
  }, [students]);

  const PIE_COLORS = ['#3B82F6', '#EC4899']; // Blue and Pink

  // Custom label untuk pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-bold text-lg"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards - 4 Cards di atas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 - Total Siswa */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg border-l-4 border-blue-500`}>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Siswa
          </p>
          <h3 className={`text-4xl font-bold text-blue-600 mb-1`}>{stats.total}</h3>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Seluruh data siswa
          </p>
        </div>

        {/* Card 2 - Tingkat Kelulusan */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg border-l-4 border-green-500`}>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-xl">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Tingkat Kelulusan
          </p>
          <h3 className={`text-4xl font-bold text-green-600 mb-1`}>{stats.tingkatKelulusan}%</h3>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {stats.lulus} dari {stats.total} siswa
          </p>
        </div>

        {/* Card 3 - Siswa Aktif */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg border-l-4 border-blue-500`}>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Siswa Aktif
          </p>
          <h3 className={`text-4xl font-bold text-blue-600 mb-1`}>{stats.aktif}</h3>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {stats.siswaAktifPersen}% dari total
          </p>
        </div>

        {/* Card 4 - Dropout Rate */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg border-l-4 border-red-500`}>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-xl">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Dropout Rate
          </p>
          <h3 className={`text-4xl font-bold text-red-600 mb-1`}>{stats.dropoutRate}%</h3>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {stats.mengundurkanDiri} siswa mengundurkan diri
          </p>
        </div>
      </div>

      {/* Charts Section - 3 Cards besar di bawah */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Status Siswa */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg`}>
          <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Distribusi Status Siswa
          </h2>
          
          <div className="space-y-4">
            {statusData.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.name}
                  </span>
                  <span className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.value} ({item.percentage}%)
                  </span>
                </div>
                <div className={`w-full ${item.bgColor} rounded-full h-4`}>
                  <div 
                    className={`${item.color} h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2`}
                    style={{ width: `${item.percentage}%` }}
                  >
                    {parseFloat(item.percentage) > 10 && (
                      <span className="text-white text-xs font-bold">●</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribusi Jenis Kelamin - Donut Chart */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg`}>
          <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Distribusi Jenis Kelamin
          </h2>

          <div className="relative">
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: darkMode ? '#FFFFFF' : '#000000'
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>

            {/* Total di tengah donut */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {stats.total}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Siswa
              </div>
            </div>
          </div>

          {/* Legend manual di bawah */}
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Laki-laki: {stats.lakiLaki}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-500 rounded"></div>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Perempuan: {stats.perempuan}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Distribusi per Kejuruan - Full Width */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg`}>
        <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Statistik Siswa per Kejuruan
        </h2>

        {kejuruanStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kejuruanStats.map((kejuruan, index) => {
              const colors = [
                { 
                  bg: 'bg-purple-500', 
                  light: 'bg-purple-50 dark:bg-purple-900/20', 
                  text: 'text-purple-600',
                  border: 'border-purple-200 dark:border-purple-700'
                },
                { 
                  bg: 'bg-green-500', 
                  light: 'bg-green-50 dark:bg-green-900/20', 
                  text: 'text-green-600',
                  border: 'border-green-200 dark:border-green-700'
                },
                { 
                  bg: 'bg-orange-500', 
                  light: 'bg-orange-50 dark:bg-orange-900/20', 
                  text: 'text-orange-600',
                  border: 'border-orange-200 dark:border-orange-700'
                },
                { 
                  bg: 'bg-red-500', 
                  light: 'bg-red-50 dark:bg-red-900/20', 
                  text: 'text-red-600',
                  border: 'border-red-200 dark:border-red-700'
                },
                { 
                  bg: 'bg-blue-500', 
                  light: 'bg-blue-50 dark:bg-blue-900/20', 
                  text: 'text-blue-600',
                  border: 'border-blue-200 dark:border-blue-700'
                },
              ];
              const color = colors[index % colors.length];
              
              return (
                <div 
                  key={kejuruan.name}
                  className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-6 rounded-2xl border-2 ${color.border} shadow-lg hover:shadow-xl transition-all`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${color.light} p-3 rounded-xl`}>
                      <Award className={`w-6 h-6 ${color.text}`} />
                    </div>
                    <div className={`text-3xl font-bold ${color.text}`}>
                      {kejuruan.total}
                    </div>
                  </div>

                  {/* Nama Kejuruan */}
                  <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {kejuruan.name}
                  </h3>

                  {/* Stats Details */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{kejuruan.total}</span>
                      </div>
                    </div>

                    <div className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'} pt-3`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aktif</span>
                        <span className="font-semibold text-green-600">{kejuruan.aktif}</span>
                      </div>
                      <div className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${kejuruan.total > 0 ? (kejuruan.aktif / kejuruan.total * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Lulus</span>
                        <span className="font-semibold text-blue-600">{kejuruan.lulus}</span>
                      </div>
                      <div className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${kejuruan.total > 0 ? (kejuruan.lulus / kejuruan.total * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tidak Aktif</span>
                        <span className="font-semibold text-yellow-600">{kejuruan.tidakAktif}</span>
                      </div>
                      <div className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${kejuruan.total > 0 ? (kejuruan.tidakAktif / kejuruan.total * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Mengundurkan Diri</span>
                        <span className="font-semibold text-red-600">{kejuruan.mengundurkanDiri}</span>
                      </div>
                      <div className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${kejuruan.total > 0 ? (kejuruan.mengundurkanDiri / kejuruan.total * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Belum ada data kejuruan</p>
            <p className="text-sm mt-2">Tambahkan data siswa untuk melihat statistik per kejuruan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatistikPage;