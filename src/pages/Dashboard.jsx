import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Package, CalendarClock, Leaf, TreePine, Navigation, 
  Plus, Search, ArrowRight, ShieldCheck, Activity
} from 'lucide-react';
import ListItemModal from '../components/ListItemModal';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsRes, bookingsRes, recommendationsRes] = await Promise.all([
          api.get('/sustainability/me'),
          api.get('/bookings/my?status=Pending'),
          api.get('/ai/recommendations')
        ]);
        
        setMetrics(metricsRes.data.metrics);
        setBookings(bookingsRes.data.bookings || []);
        setRecommendations(recommendationsRes.data.recommendations || []);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleBookingAction = async (id, action) => {
    try {
      await api.put(`/bookings/${id}/${action}`);
      toast.success(`Booking ${action}ed`);
      setBookings(bookings.filter(b => b._id !== id));
    } catch (err) {
      toast.error(`Failed to ${action} booking`);
    }
  };

  const handleItemAdded = (item) => {
    // Optionally trigger a stats refresh or show it in a custom list
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ListItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onItemAdded={handleItemAdded} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your sharing loop today.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 cursor-pointer">
          <Plus size={20} /> List an Item
        </button>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<ShieldCheck className="text-blue-500" />}
          label="Trust Score"
          value={user?.trustScore}
          subtext="Top 10% in your area"
          bg="bg-blue-50"
        />
        <StatCard 
          icon={<Leaf className="text-emerald-500" />}
          label="Carbon Saved"
          value={`${metrics?.carbonSavedKg || 0} kg`}
          subtext="Equivalent to driving 100km"
          bg="bg-emerald-50"
        />
        <StatCard 
          icon={<Package className="text-purple-500" />}
          label="Items Reused"
          value={metrics?.itemsReused || 0}
          subtext="Saved from landfill"
          bg="bg-purple-50"
        />
        <StatCard 
          icon={<TreePine className="text-teal-500" />}
          label="Trees Equivalent"
          value={metrics?.treesEquivalent || 0}
          subtext="Planted through sharing"
          bg="bg-teal-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <CalendarClock className="text-emerald-500" /> Pending Requests
            </h2>
            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View All</button>
          </div>
          
          {bookings.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                <ShieldCheck className="text-slate-400" />
              </div>
              <h3 className="text-slate-700 font-medium">All caught up!</h3>
              <p className="text-sm text-slate-500 mt-1">You have no pending requests right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking._id} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-emerald-100 hover:shadow-md transition-all bg-slate-50/50 group">
                  <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-lg shrink-0 overflow-hidden">
                      {booking.item?.images?.[0] ? (
                        <img src={booking.item.images[0]} alt={booking.item.title} className="w-full h-full object-cover" />
                      ) : (
                        booking.item?.title.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{booking.item?.title}</h4>
                      <p className="text-xs text-slate-500">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {user._id === booking.owner._id ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleBookingAction(booking._id, 'approve')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleBookingAction(booking._id, 'reject')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-red-600 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                      Waiting for approval
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendations Widget */}
        <div className="col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl border border-slate-800 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
          
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-2 relative z-10">
            <Activity className="text-emerald-400" /> Smart Suggestions
          </h2>
          <p className="text-slate-400 text-sm mb-6 relative z-10">AI-curated items near your location based on your interests.</p>
          
          <div className="space-y-4 relative z-10">
            {recommendations.length === 0 ? (
              <p className="text-slate-400 text-sm italic text-center py-8">Not enough data to recommend items yet. Try completing a borrow first!</p>
            ) : (
              recommendations.map(rec => (
                <div key={rec.item._id} onClick={() => navigate('/')} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/5 hover:bg-white/20 transition-colors cursor-pointer group flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0 bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                    {rec.item.images?.[0] ? (
                      <img src={rec.item.images[0]} alt={rec.item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-emerald-300 truncate">{rec.item.title}</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 mb-1.5 truncate">{rec.reason}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded text-white">{Math.min(100, Math.round(rec.score * 2.5))}% Match</span>
                      <ArrowRight size={14} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button onClick={() => navigate('/')} className="w-full mt-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-medium transition-colors backdrop-blur-md relative z-10">
            View All in Map
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subtext, bg }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bg}`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-slate-500">{label}</h3>
    </div>
    <div className="text-2xl font-bold text-slate-800">{value}</div>
    <div className="text-xs text-slate-400 mt-1 tracking-wide">{subtext}</div>
  </div>
);

export default Dashboard;
