import { useState, useRef } from 'react';
import { X, Camera, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ListItemModal = ({ isOpen, onClose, onItemAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    condition: 'Good',
    description: '',
  });
  const [imageBase64, setImageBase64] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
         return toast.error("Image too large! Please select an image under 5MB.");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        condition: formData.condition,
        description: formData.description,
        images: imageBase64 ? [imageBase64] : []
      };

      const res = await api.post('/items', payload);
      toast.success('Item listed successfully!');
      if (onItemAdded) onItemAdded(res.data.item);
      onClose();
      // reset form
      setFormData({ title: '', category: 'Electronics', condition: 'Good', description: '' });
      setImageBase64('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to list item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">List an Item</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors bg-white p-1 rounded-md shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="list-item-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Image Photo Capture Section */}
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-2">Item Photo</label>
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className={`w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${imageBase64 ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}`}
               >
                 {imageBase64 ? (
                    <img src={imageBase64} alt="Preview" className="h-full w-full object-contain rounded-xl p-1" />
                 ) : (
                    <>
                      <div className="flex gap-4 mb-2">
                         <div className="bg-white p-3 rounded-full shadow-sm">
                           <Camera className="text-emerald-500" size={24} />
                         </div>
                      </div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Click to Take Photo or Upload</p>
                      <p className="text-xs text-slate-400">Supports JPG, PNG</p>
                    </>
                 )}
               </div>
               {/* Hidden file input supporting camera capture on mobile */}
               <input 
                 type="file" 
                 accept="image/*" 
                 capture="environment" 
                 ref={fileInputRef} 
                 onChange={handleImageUpload} 
                 className="hidden" 
               />
               {imageBase64 && (
                 <button type="button" onClick={() => setImageBase64('')} className="mt-2 text-xs text-red-500 font-medium hover:underline">
                   Remove Photo
                 </button>
               )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Item Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Makita Power Drill" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
                  {['Electronics', 'Tools', 'Sports', 'Books', 'Kitchen', 'Garden', 'Furniture', 'Other'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Condition</label>
                <select name="condition" value={formData.condition} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
                  {['New', 'Like New', 'Good', 'Fair', 'Worn'].map(cond => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea name="description" required value={formData.description} onChange={handleChange} rows="3" className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="Describe the item, what it includes, etc."></textarea>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
          <button type="submit" form="list-item-form" disabled={isSubmitting} className="px-5 py-2 font-medium text-white bg-emerald-500 rounded-lg shadow-md hover:bg-emerald-600 disabled:opacity-70 transition-colors">
            {isSubmitting ? 'Listing...' : 'List Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListItemModal;
