
import React, { useState, useRef, useEffect } from 'react';
import { Visitor, VisitorStatus, AppSettings } from '../types';
import { saveVisitors, addLog, getVisitors } from '../storage';

interface VisitorEntryProps {
  visitors: Visitor[];
  onUpdate: () => void;
  settings: AppSettings;
}

const VisitorEntry: React.FC<VisitorEntryProps> = ({ visitors, onUpdate, settings }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    meetingWith: '',
    department: settings.departments[0],
    purpose: 'Meeting' as Visitor['purpose']
  });

  const [cameraActive, setCameraActive] = useState(false);
  const [photo, setPhoto] = useState<string | undefined>();
  const [otp, setOtp] = useState<string>('');
  const [showBadge, setShowBadge] = useState<Visitor | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Effect to attach stream when camera container becomes active
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.onloadedmetadata = () => {
        video.play().catch(err => console.error("Video play error:", err));
      };
    }
  }, [cameraActive]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      // Clean up existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user" 
        },
        audio: false 
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Could not access camera. Please ensure permissions are granted and you are using a secure connection.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Check for video ready state and valid dimensions
      if (context && video.readyState >= 2) {
        // Use video intrinsic size or fallback to offset size
        const width = video.videoWidth || video.offsetWidth;
        const height = video.videoHeight || video.offsetHeight;
        
        if (width > 0 && height > 0) {
          canvas.width = width;
          canvas.height = height;
          
          // Clear and draw
          context.clearRect(0, 0, width, height);
          context.drawImage(video, 0, 0, width, height);
          
          try {
            const dataUrl = canvas.toDataURL('image/png');
            setPhoto(dataUrl);
            
            // Cleanup stream
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
            setCameraActive(false);
          } catch (e) {
            console.error("Capture encoding error:", e);
            alert("Error processing the captured image.");
          }
        } else {
          alert("Camera feed is not ready. Please wait a second.");
        }
      } else {
        alert("Camera is warming up. Try again in a moment.");
      }
    }
  };

  const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.mobile.length !== 10) {
      alert("Mobile number must be 10 digits");
      return;
    }

    const existingIn = visitors.find(v => v.mobile === formData.mobile && v.status === 'IN');
    if (existingIn) {
      alert("Visitor is already inside the premises!");
      return;
    }

    const newOtp = generateOtp();
    const newVisitor: Visitor = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      ...formData,
      inTime: new Date().toLocaleTimeString(),
      otp: newOtp,
      photo: photo,
      status: 'IN'
    };

    const updated = [newVisitor, ...getVisitors()];
    saveVisitors(updated);
    addLog({
      name: newVisitor.name,
      type: 'Visitor',
      action: 'IN',
      details: `Mobile: ${newVisitor.mobile}, Meeting with ${newVisitor.meetingWith}`
    });
    
    setOtp(newOtp);
    onUpdate();
    setShowBadge(newVisitor);
    
    // Reset form
    setFormData({
      name: '',
      mobile: '',
      meetingWith: '',
      department: settings.departments[0],
      purpose: 'Meeting'
    });
    setPhoto(undefined);
  };

  const markOut = (id: string) => {
    const currentVisitors = getVisitors();
    const updated = currentVisitors.map(v => {
      if (v.id === id) {
        const outTime = new Date().toLocaleTimeString();
        addLog({
          name: v.name,
          type: 'Visitor',
          action: 'OUT',
          details: `Out time: ${outTime}`
        });
        return { ...v, status: 'OUT' as VisitorStatus, outTime: outTime };
      }
      return v;
    });
    saveVisitors(updated);
    onUpdate();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Entry Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col no-print">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
            <i className="fas fa-plus"></i>
          </div>
          <h2 className="text-lg font-bold text-slate-800">New Visitor Registration</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Visitor Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mobile Number</label>
              <input
                required
                type="tel"
                maxLength={10}
                value={formData.mobile}
                onChange={e => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="10 Digits"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Meeting With</label>
              <input
                required
                type="text"
                value={formData.meetingWith}
                onChange={e => setFormData({...formData, meetingWith: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Employee Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Department</label>
              <select
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                {settings.departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Purpose of Visit</label>
            <select
              value={formData.purpose}
              onChange={e => setFormData({...formData, purpose: e.target.value as any})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="Meeting">Meeting</option>
              <option value="Material Delivery">Material Delivery</option>
              <option value="Just Visit">Just Visit</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visitor Photo</label>
            <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 min-h-[220px] justify-center">
              {photo ? (
                <div className="relative group animate-in fade-in duration-300">
                  <img src={photo} alt="Visitor" className="w-48 h-48 object-cover rounded-xl shadow-md border-2 border-white" />
                  <button 
                    type="button"
                    onClick={() => {
                      setPhoto(undefined);
                      startCamera(); 
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  <p className="text-[10px] text-center font-bold text-slate-400 mt-2 uppercase">Photo Captured</p>
                </div>
              ) : cameraActive ? (
                <div className="flex flex-col items-center gap-4 w-full animate-in fade-in duration-300">
                  <div className="relative w-full max-w-xs aspect-video bg-black rounded-xl overflow-hidden shadow-inner border border-slate-200">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 border-2 border-blue-500/30 pointer-events-none rounded-xl"></div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={capturePhoto}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                      <i className="fas fa-camera"></i> Capture
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        if (streamRef.current) {
                          streamRef.current.getTracks().forEach(track => track.stop());
                        }
                        setCameraActive(false);
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-6 py-3 rounded-xl font-bold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
                    <i className="fas fa-camera text-xl"></i>
                  </div>
                  <button 
                    type="button" 
                    onClick={startCamera}
                    className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                    <i className="fas fa-video"></i> Start Camera
                  </button>
                  <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wider">Camera Required for Registration</p>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            Save IN Entry & Generate OTP
          </button>
        </form>
      </div>

      {/* Active Visitors List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col no-print">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white">
              <i className="fas fa-list"></i>
            </div>
            <h2 className="text-lg font-bold text-slate-800">Current Visitors (Inside)</h2>
          </div>
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            {visitors.filter(v => v.status === 'IN').length} Active
          </span>
        </div>
        
        <div className="flex-1 overflow-auto max-h-[850px]">
          <div className="divide-y divide-slate-100">
            {visitors.filter(v => v.status === 'IN').length === 0 && (
              <div className="p-12 text-center text-slate-400 italic font-medium">No visitors currently inside the facility</div>
            )}
            {visitors.filter(v => v.status === 'IN').map(v => (
              <div key={v.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex gap-4">
                  {v.photo ? (
                    <img src={v.photo} alt={v.name} className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <i className="fas fa-user text-2xl"></i>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="truncate">
                        <h3 className="font-bold text-slate-900 truncate">{v.name}</h3>
                        <p className="text-xs font-bold text-blue-600 uppercase mt-0.5 tracking-tight">{v.mobile}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">OTP: {v.otp}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">IN: {v.inTime}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button 
                        onClick={() => setShowBadge(v)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                      >
                        <i className="fas fa-print"></i> Badge
                      </button>
                      <button 
                        onClick={() => markOut(v.id)}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-red-100"
                      >
                        Mark OUT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badge Print Template */}
      {showBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 no-print bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-6 text-white text-center relative">
              <button 
                onClick={() => setShowBadge(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
              <div className="w-12 h-12 bg-blue-600 mx-auto rounded-xl flex items-center justify-center text-xl mb-3">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Visitor Badge</h2>
            </div>
            
            <div className="p-8 space-y-6 text-center">
              {showBadge.photo && (
                <img src={showBadge.photo} className="w-32 h-32 mx-auto rounded-2xl border-4 border-slate-50 object-cover shadow-lg" alt="Badge Photo" />
              )}
              
              <div>
                <div className="text-2xl font-black text-slate-900 leading-tight">{showBadge.name}</div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">ID: {showBadge.id.slice(-6)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left border-t border-b border-slate-100 py-4">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Meeting With</div>
                  <div className="text-sm font-bold text-slate-800 truncate">{showBadge.meetingWith}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Dept</div>
                  <div className="text-sm font-bold text-slate-800">{showBadge.department}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Time IN</div>
                  <div className="text-sm font-bold text-slate-800">{showBadge.inTime}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Security OTP</div>
                  <div className="text-sm font-bold text-blue-600">{showBadge.otp}</div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => window.print()}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-print"></i> Print Badge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actual Print Node - Refined for clarity */}
      <div className="print-only p-12 text-center font-sans border-[12px] border-slate-900 m-8 rounded-[40px]">
        <div className="bg-slate-900 text-white py-6 mb-8 -mx-12 -mt-12 rounded-t-[28px]">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Factory Security Badge</h1>
        </div>
        
        {showBadge?.photo && (
          <img src={showBadge.photo} className="w-80 h-80 mx-auto rounded-3xl object-cover mb-10 border-4 border-slate-100 grayscale shadow-md" alt="Badge" />
        )}
        
        <div className="text-6xl font-black mb-2 text-slate-900">{showBadge?.name}</div>
        <div className="text-3xl font-bold mb-10 text-slate-500 tracking-widest">{showBadge?.mobile}</div>
        
        <div className="grid grid-cols-2 gap-y-12 gap-x-8 text-left text-3xl border-t-4 border-slate-100 pt-10">
          <div>
            <div className="font-black uppercase text-base text-slate-400 mb-2">Meeting With</div>
            <div className="font-black text-slate-900">{showBadge?.meetingWith}</div>
          </div>
          <div>
            <div className="font-black uppercase text-base text-slate-400 mb-2">Department</div>
            <div className="font-black text-slate-900">{showBadge?.department}</div>
          </div>
          <div>
            <div className="font-black uppercase text-base text-slate-400 mb-2">Entry Date</div>
            <div className="font-black text-slate-900">{showBadge?.date}</div>
          </div>
          <div>
            <div className="font-black uppercase text-base text-slate-400 mb-2">Verification OTP</div>
            <div className="font-black text-6xl text-blue-700">{showBadge?.otp}</div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t-2 border-slate-100 italic font-black text-slate-400 uppercase tracking-widest">
          Authorized Factory Access
        </div>
      </div>
    </div>
  );
};

export default VisitorEntry;
