import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Camera, RotateCcw, Home, Building2, Shield, CheckCircle2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { clockIn, uploadPhoto, getMyToday } from '../../api/attendance.api';
import { useGeolocation } from '../../hooks/useGeolocation';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

type Step = 'locating' | 'photo' | 'review' | 'success';
type WorkMode = 'HOME' | 'OFFICE';

const STEPS: Step[] = ['locating', 'photo', 'review', 'success'];

const ClockInPage: React.FC = () => {
  const navigate = useNavigate();
  const { position, error: geoError, loading: geoLoading, request: requestGeo } = useGeolocation();
  const [step, setStep] = useState<Step>('locating');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<WorkMode>('HOME');
  const [submitting, setSubmitting] = useState(false);
  const [successTime, setSuccessTime] = useState<Date | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => { requestGeo(); }, [requestGeo]);

  // Auto-advance from locating after geo resolves (or short timeout)
  useEffect(() => {
    if (step !== 'locating') return;
    if (!geoLoading) {
      const t = setTimeout(() => setStep('photo'), 800);
      return () => clearTimeout(t);
    }
  }, [geoLoading, step]);

  // Start camera when on photo step
  useEffect(() => {
    if (step !== 'photo' || useFallback) return;
    let active = true;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setCameraReady(true);
        }
      })
      .catch(() => { if (active) setCameraError(true); });
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraReady(false);
    };
  }, [step, useFallback]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setStep('review');
    }, 'image/jpeg', 0.92);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setStep('review');
  };

  const handleRetake = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setStep('photo');
    setCameraReady(false);
  };

  const handleConfirm = async () => {
    if (!photo) { toast.error('Photo is required'); setStep('photo'); return; }
    setSubmitting(true);
    try {
      let record;
      try {
        record = await clockIn({ latitude: position?.latitude, longitude: position?.longitude, mode });
      } catch (clockInErr: unknown) {
        const status = (clockInErr as { response?: { status?: number } })?.response?.status;
        if (status === 409) {
          // Already clocked in — get the existing record to upload the photo
          record = await getMyToday();
          if (!record) throw clockInErr;
        } else {
          throw clockInErr;
        }
      }
      if (record && !record.photoUrl) {
        await uploadPhoto(record.id, photo);
      }
      setSuccessTime(new Date());
      setStep('success');
    } catch (err: unknown) {
      const errObj = err as { response?: { status?: number; data?: { message?: string } } };
      console.error('[ClockIn] error:', errObj?.response?.status, errObj?.response?.data);
      const msg = errObj?.response?.data?.message;
      toast.error(msg ?? 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const stepIdx = STEPS.indexOf(step);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      {step !== 'success' && (
        <div className="flex items-center gap-3 px-5 pt-6 pb-4">
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate('/dashboard')}
            className="flex h-9 w-9 items-center justify-center rounded-sm bg-muted text-muted-foreground hover:bg-primary-50 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="flex-1 text-base font-bold text-foreground">Clock In</h2>
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.slice(0, 3).map((s, i) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  i < stepIdx ? 'w-2 bg-primary' :
                  i === stepIdx ? 'w-5 bg-primary' :
                  'w-2 bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 px-5 pb-8">

        {/* Step 1 — Locating */}
        {step === 'locating' && (
          <div className="animate-fade-up flex flex-col items-center pt-16 gap-4 text-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute h-20 w-20 rounded-full bg-primary-100 ring-pulse" />
              <div className="absolute h-14 w-14 rounded-full bg-primary-200 ring-pulse-delayed" />
              <MapPin size={28} className="relative text-primary" />
            </div>
            <p className="text-base font-bold text-foreground">Verifying your location…</p>
            <p className="text-sm text-muted-foreground">
              {geoLoading ? 'Requesting GPS signal' : position ? 'Location confirmed' : geoError || 'Location unavailable'}
            </p>
            <p className="text-xs font-mono text-muted-foreground">{format(new Date(), 'HH:mm:ss')}</p>
          </div>
        )}

        {/* Step 2 — Photo */}
        {step === 'photo' && (
          <div className="animate-fade-up flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Take a photo</h3>
              <p className="text-sm text-muted-foreground">A selfie to verify you're working</p>
            </div>

            {!useFallback && !cameraError ? (
              <div className="relative overflow-hidden rounded-lg bg-black aspect-[4/5]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
                {/* Face oval guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-52 w-40 rounded-full border-2 border-white/60 border-dashed" />
                </div>
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Spinner size="md" />
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-primary/30 bg-primary-50 hover:bg-primary-100 transition-colors">
                <Upload size={28} className="text-primary" />
                <span className="text-sm font-semibold text-primary">Click to upload photo</span>
                <span className="text-xs text-muted-foreground">JPEG, PNG, WebP — max 5 MB</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}

            <div className="flex flex-col gap-2">
              {!useFallback && !cameraError && (
                <Button onClick={capturePhoto} disabled={!cameraReady} size="lg" variant="accent" className="w-full">
                  <Camera size={18} /> Capture
                </Button>
              )}
              <button
                type="button"
                onClick={() => setUseFallback((v) => !v)}
                className="text-sm font-semibold text-primary hover:text-primary-600 transition-colors text-center"
              >
                {useFallback ? 'Try live camera instead' : 'Upload from gallery instead'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 'review' && (
          <div className="animate-fade-up flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Review & confirm</h3>
              <p className="text-sm text-muted-foreground">Check everything before submitting</p>
            </div>

            {photoPreview && (
              <img src={photoPreview} alt="Your photo" className="w-full rounded-lg object-cover aspect-[4/3] border border-border" />
            )}

            {/* Details card */}
            <div className="rounded-sm bg-muted border border-border p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-semibold text-foreground">{format(new Date(), 'HH:mm, MMM d')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-semibold text-foreground">
                  {position ? `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}` : 'Not captured'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Work mode</span>
                <div className="flex rounded-sm bg-white border border-border overflow-hidden">
                  {(['HOME', 'OFFICE'] as WorkMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                        mode === m ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {m === 'HOME' ? <Home size={12} /> : <Building2 size={12} />}
                      {m === 'HOME' ? 'Home' : 'Office'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Locked note */}
            <div className="flex items-center gap-2 rounded-sm bg-[#FEF3DD] border border-[#FBE3AE] px-3 py-2.5">
              <Shield size={14} className="shrink-0 text-[#9A6700]" />
              <p className="text-xs font-semibold text-[#9A6700]">Locked once submitted — timestamp and photo cannot be altered</p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleRetake} className="flex-1">
                <RotateCcw size={15} /> Retake
              </Button>
              <Button onClick={handleConfirm} loading={submitting} variant="accent" className="flex-1">
                Confirm clock-in
              </Button>
            </div>
          </div>
        )}

        {/* Step 4 — Success */}
        {step === 'success' && (
          <div className="animate-fade-up flex flex-col items-center pt-12 gap-5 text-center">
            {/* Animated check */}
            <div className="relative flex h-24 w-24 items-center justify-center">
              <div className="absolute h-24 w-24 rounded-full bg-[#E7F6EC] ring-pulse" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-success">
                <svg viewBox="0 0 36 36" className="h-8 w-8" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 18l7 7 13-13" className="draw-check" />
                </svg>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-foreground">You're clocked in! 🎉</h2>
              {successTime && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {format(successTime, 'EEEE, MMM d · HH:mm')}
                </p>
              )}
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F6EC] border border-[#BFE6CC] px-4 py-1.5 text-sm font-semibold text-[#0A7A3C]">
              <CheckCircle2 size={15} /> Attendance recorded
            </span>

            <Button onClick={() => navigate('/dashboard')} variant="primary" size="lg" className="mt-2 w-full max-w-[280px]">
              Back to home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClockInPage;
