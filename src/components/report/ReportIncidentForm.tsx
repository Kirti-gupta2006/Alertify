import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Camera, 
  Upload, 
  AlertTriangle, 
  Car, 
  Heart, 
  Flame, 
  Construction, 
  Shield,
  Loader2,
  CheckCircle,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useIncidentStore } from '@/stores/incidentStore';
import { IncidentType, Severity, incidentTypeLabels } from '@/types/incident';
import { toast } from 'sonner';

const incidentTypes: { value: IncidentType; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'accident', label: 'Accident', icon: Car, description: 'Vehicle collision, pedestrian incident' },
  { value: 'medical', label: 'Medical', icon: Heart, description: 'Health emergency, injury' },
  { value: 'fire', label: 'Fire', icon: Flame, description: 'Fire, smoke, explosion' },
  { value: 'infrastructure', label: 'Infrastructure', icon: Construction, description: 'Damage, hazard, utility failure' },
  { value: 'crime', label: 'Crime', icon: Shield, description: 'Theft, assault, suspicious activity' },
];

const severityOptions: { value: Severity; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'Minor incident, no immediate danger' },
  { value: 'medium', label: 'Medium', description: 'Significant incident, potential risk' },
  { value: 'high', label: 'High', description: 'Critical emergency, immediate response needed' },
];

export function ReportIncidentForm() {
  const navigate = useNavigate();
  const { addIncident } = useIncidentStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [formData, setFormData] = useState({
    type: '' as IncidentType | '',
    severity: 'medium' as Severity,
    title: '',
    description: '',
    location: {
      lat: 0,
      lng: 0,
      address: '',
    },
  });

  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)} (Auto-detected)`,
            },
          }));
          setIsLocating(false);
          toast.success('Location detected successfully');
        },
        (error) => {
          setIsLocating(false);
          toast.error('Could not get location. Please enter manually.');
        }
      );
    } else {
      setIsLocating(false);
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.type || !formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    addIncident({
      type: formData.type,
      severity: formData.severity,
      title: formData.title,
      description: formData.description,
      location: formData.location.address ? formData.location : {
        lat: 40.7128 + (Math.random() - 0.5) * 0.02,
        lng: -74.006 + (Math.random() - 0.5) * 0.02,
        address: 'New York, NY (Default)',
      },
      reportedBy: 'anonymous_user',
    });

    setIsSubmitting(false);
    toast.success('Incident reported successfully!');
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-semibold transition-colors ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
              animate={{ scale: step === s ? 1.1 : 1 }}
            >
              {step > s ? <CheckCircle className="h-5 w-5" /> : s}
            </motion.div>
            {s < 3 && (
              <div className={`w-12 h-0.5 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Incident Type */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card glass>
            <CardHeader>
              <CardTitle>What type of incident?</CardTitle>
              <CardDescription>Select the category that best describes the emergency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {incidentTypes.map((type) => (
                  <motion.div
                    key={type.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all ${
                        formData.type === type.value
                          ? 'border-primary bg-primary/10'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className={`p-3 rounded-xl ${
                          formData.type === type.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <type.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{type.label}</p>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                        {formData.type === type.value && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Button
                className="w-full mt-6"
                variant="hero"
                size="lg"
                disabled={!formData.type}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card glass>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
              <CardDescription>Provide information to help responders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the incident"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-card/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about what happened..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-card/50"
                />
              </div>

              <div className="space-y-3">
                <Label>Severity Level</Label>
                <RadioGroup
                  value={formData.severity}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as Severity }))}
                  className="grid gap-2"
                >
                  {severityOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        formData.severity === option.value
                          ? `border-severity-${option.value} bg-severity-${option.value}/10`
                          : 'border-border hover:border-border/80'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, severity: option.value }))}
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div className="flex-1">
                        <Label htmlFor={option.value} className="font-semibold cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  variant="hero"
                  onClick={() => setStep(3)}
                  disabled={!formData.title || !formData.description}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Location */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card glass>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Help us pinpoint the incident location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                variant="outline"
                className="w-full h-14 gap-3"
                onClick={handleGetLocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Navigation className="h-5 w-5" />
                )}
                {isLocating ? 'Detecting location...' : 'Use Current Location'}
              </Button>

              {formData.location.address && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-primary/10 border border-primary/30"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Location detected</p>
                      <p className="text-sm text-muted-foreground">{formData.location.address}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or enter manually</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter address or landmark"
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  className="bg-card/50"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  variant="emergency"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
