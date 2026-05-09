import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Sparkles, Navigation } from 'lucide-react';
import L from 'leaflet';
import toast from 'react-hot-toast';

// Fix Leaflet icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map when location changes
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
};

const Home = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // Default NYC
  const [locationName, setLocationName] = useState('New York');

  useEffect(() => {
    // Safely get user's location if available
    const hasUserLocation = user && user.location && user.location.coordinates && user.location.coordinates[0] !== 0;

    if (hasUserLocation) {
      setLocation({ 
        lat: user.location.coordinates[1], 
        lng: user.location.coordinates[0] 
      });
      fetchNearbyItems(user.location.coordinates[0], user.location.coordinates[1]);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        fetchNearbyItems(pos.coords.longitude, pos.coords.latitude);
        setLocationName('Current Location');
      }, () => {
        fetchNearbyItems(-74.0060, 40.7128);
      });
    } else {
      fetchNearbyItems(-74.0060, 40.7128);
    }
  }, [user]);

  const fetchNearbyItems = async (lng, lat) => {
    try {
      const res = await api.get(`/items/nearby?lng=${lng}&lat=${lat}&radius=15`);
      setItems(res.data.items);
    } catch (err) {
      toast.error('Failed to load nearby items');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchNearbyItems(location.lng, location.lat);
    
    setIsSearching(true);
    try {
      // Connects to the smart-search AI route
      const res = await api.get(`/ai/search?q=${searchQuery}&lng=${location.lng}&lat=${location.lat}`);
      setItems(res.data.results);
      
      // Track search for AI recommendations
      if (user) {
        await api.post('/ai/track-search', { query: searchQuery, category: '' });
      }
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBook = async (itemId) => {
    if (!user) return toast.error('Please log in to book items');
    
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3); // Default 3 days

      await api.post('/bookings', {
        itemId,
        startDate,
        endDate,
        message: 'Hi, I would like to borrow this item!'
      });
      toast.success('Request sent to owner!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book item');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Search Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 shrink-0 z-10 relative">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Discover Local Items</h1>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Sparkles className="h-5 w-5 text-emerald-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for tools, books, electronics (AI-powered)"
              className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50 hover:bg-white text-slate-700"
            />
          </div>
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Navigation className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              disabled
              value={locationName}
              className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center min-w-[120px]"
          >
            {isSearching ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Search'}
          </button>
        </form>
      </div>

      {/* Main Content: Map & Items side by side */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Item List */}
        <div className="w-full lg:w-1/3 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className="text-lg font-semibold text-slate-700">
              {items.length} {items.length === 1 ? 'item' : 'items'} nearby
            </h2>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No items found in this area.</p>
              <p className="text-sm text-slate-400 mt-1">Try a different search term.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item._id} className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group flex gap-4">
                <div className="w-24 h-24 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {item.images && item.images[0] ? (
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                    {item.searchScore && (
                      <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
                        {item.searchScore}% Match
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-2 mt-0.5 line-clamp-2">{item.description}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1.5 opacity-80">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                        {item.owner.name.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        Top {item.owner.trustScore}% Score
                      </span>
                    </div>
                    <button 
                      onClick={() => handleBook(item._id)}
                      className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-500 transition-colors"
                    >
                      Request
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Map Container */}
        <div className="w-full lg:w-2/3 h-[400px] lg:h-full bg-slate-200 rounded-2xl border border-slate-200 overflow-hidden shadow-inner relative z-0">
          <MapContainer 
            center={[location.lat, location.lng]} 
            zoom={13} 
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap lat={location.lat} lng={location.lng} />
            
            {/* User Location Marker */}
            <Marker position={[location.lat, location.lng]}>
              <Popup>You are here</Popup>
            </Marker>

            {/* Item Markers */}
            {items.map(item => {
              // Ensure coordinates exist 
              if (item.location?.coordinates?.length === 2 && item.location.coordinates[0] !== 0) {
                return (
                  <Marker 
                    key={item._id} 
                    position={[item.location.coordinates[1], item.location.coordinates[0]]}
                  >
                    <Popup className="rounded-xl">
                      <div className="font-semibold text-sm mb-1">{item.title}</div>
                      <button onClick={() => handleBook(item._id)} className="text-xs bg-emerald-500 text-white px-2 py-1 rounded hover:bg-emerald-600 w-full">Ask to Borrow</button>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
          </MapContainer>
        </div>

      </div>
    </div>
  );
};

export default Home;
