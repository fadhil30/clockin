import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { clockIn, uploadPhoto } from '../../api/attendance.api';
import { useGeolocation } from '../../hooks/useGeolocation';
import { PhotoPreview } from '../../components/shared/PhotoPreview';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

type Step = 'geo' | 'photo' | 'confirm';

const ClockInPage: React.FC = () => {
  const navigate = useNavigate();
  const { position, error: geoError, loading: geoLoading, request: requestGeo } = useGeolocation();
  const [step, setStep] = useState<Step>('geo');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { requestGeo(); }, [requestGeo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirm = async () => {
    if (!photo) { toast.error('Please upload a photo as WFH proof'); setStep('photo'); return; }
    setSubmitting(true);
    try {
      const record = await clockIn({ latitude: position?.latitude, longitude: position?.longitude });
      await uploadPhoto(record.id, photo);
      toast.success('Attendance submitted successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit attendance');
      setStep('photo');
    } finally {
      setSubmitting(false);
    }
  };

  const steps: Step[] = ['geo', 'photo', 'confirm'];

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Clock In</h2>
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</div>
            {i < steps.length - 1 ? <div className="flex-1 h-px bg-gray-200" /> : null}
          </React.Fragment>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        {step === 'geo' ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Step 1: Location</h3>
            {geoLoading ? <div className="flex items-center gap-2 text-gray-500"><Spinner size="sm" /> Detecting location...</div> : null}
            {!geoLoading && position ? (
              <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                Location detected: {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}
              </p>
            ) : null}
            {!geoLoading && !position ? (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                {geoError || 'Location not available. You can still proceed.'}
              </p>
            ) : null}
            <Button onClick={() => setStep('photo')} disabled={geoLoading} className="w-full">Next: Upload Photo</Button>
          </div>
        ) : step === 'photo' ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Step 2: Photo Proof</h3>
            <p className="text-sm text-gray-500">Upload a photo to verify you're working from home.</p>
            {!photoPreview ? (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:bg-gray-50">
                <span className="text-3xl">📷</span>
                <span className="text-sm font-medium text-blue-600">Click to upload photo</span>
                <span className="text-xs text-gray-400">JPEG, PNG, WebP — max 5 MB</span>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <PhotoPreview src={photoPreview} onRemove={handleRemovePhoto} className="w-full" />
            )}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep('geo')} className="flex-1">Back</Button>
              <Button onClick={() => photo ? setStep('confirm') : toast.error('Please upload a photo')} disabled={!photo} className="flex-1">Next: Confirm</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Step 3: Confirm Submission</h3>
            <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{new Date().toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium">{new Date().toLocaleTimeString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium">{position ? `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}` : 'Not captured'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Photo</span><span className="font-medium text-green-600">Ready</span></div>
            </div>
            {photoPreview ? <PhotoPreview src={photoPreview} className="w-full" /> : null}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep('photo')} className="flex-1">Back</Button>
              <Button onClick={handleConfirm} loading={submitting} className="flex-1">Confirm & Submit</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClockInPage;
