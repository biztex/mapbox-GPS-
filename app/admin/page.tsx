'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Lock, Save, RotateCcw, Download, Upload, Eye, EyeOff } from 'lucide-react';

interface TierConfig {
  id: number;
  name: string;
  minTokens: number;
  maxTokens: number | null;
  baseBonus: number;
  proportionalMultiplier: number;
  minROI: number;
  maxROI: number;
  threshold: number | null;
  color: string;
  description: string | null;
}

interface USDPackage {
  usd: number;
  tokens: number;
}

interface Config {
  tiers: TierConfig[];
  usdPackages: USDPackage[];
}

interface FleetData {
  totalFleet: number;
  inLicensing: number;
  inMaintenance: number;
  activeCars: number;
  lifetimeTrips: number;
  lifetimePassengers: number;
  revenueToday: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  investorPool: number;
  lastMonthDistribution: number;
  totalDistributed: number;
  co2Saved: number;
  lastMaintenanceRotation: string;
  currentMonth: number;
  lastHourlyUpdate: string;
  last12HourUpdate: string;
  lastUpdated: string;
  fleetComposition: {
    sedan: number;
    suv: number;
    luxury: number;
    electric: number;
    van: number;
  };
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  const [importText, setImportText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fleetData, setFleetData] = useState<FleetData>({
    totalFleet: 30,
    inLicensing: 5,
    inMaintenance: 4,
    activeCars: 21,
    lifetimeTrips: 250,
    lifetimePassengers: 500,
    revenueToday: 0,
    revenueThisMonth: 0,
    revenueThisYear: 0,
    investorPool: 0,
    lastMonthDistribution: 14500,
    totalDistributed: 87000,
    co2Saved: 375,
    lastMaintenanceRotation: new Date().toISOString(),
    currentMonth: new Date().getMonth(),
    lastHourlyUpdate: new Date().toISOString(),
    last12HourUpdate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    fleetComposition: {
      sedan: 10,
      suv: 3,
      luxury: 4,
      electric: 10,
      van: 3,
    },
  });

  // Load configuration
  const loadConfig = async (authToken: string) => {
    try {
      const response = await fetch('/api/admin/config', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        toast.error('Failed to load configuration');
      }
    } catch (error) {
      toast.error('Error loading configuration');
      console.error(error);
    }
  };

  // Load fleet data
  const loadFleetData = async () => {
    try {
      const response = await fetch('/api/fleet/data');
      if (response.ok) {
        const data = await response.json();
        setFleetData(data);
      }
    } catch (error) {
      console.error('Error loading fleet data:', error);
    }
  };

  // Load video URL
  const loadVideoUrl = async () => {
    try {
      const response = await fetch('/api/fleet/video');
      if (response.ok) {
        const data = await response.json();
        setVideoUrl(data.videoUrl || '');
      }
    } catch (error) {
      console.error('Error loading video URL:', error);
    }
  };

  // Save fleet data
  const saveFleetData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fleet/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fleetData),
      });

      if (response.ok) {
        toast.success('Fleet data saved successfully!');
      } else {
        toast.error('Failed to save fleet data');
      }
    } catch (error) {
      toast.error('Error saving fleet data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Save video URL
  const saveVideoUrl = async () => {
    setLoading(true);
    try {
      const authToken = sessionStorage.getItem('adminToken');
      const response = await fetch('/api/fleet/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (response.ok) {
        toast.success('Video URL saved successfully!');
      } else {
        toast.error('Failed to save video URL');
      }
    } catch (error) {
      toast.error('Error saving video URL');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle video file upload
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        // Create a local URL for the video
        const localUrl = URL.createObjectURL(file);
        setVideoUrl(localUrl);
        toast.success(`Video file selected: ${file.name}`);
      } else {
        toast.error('Please select a valid video file');
      }
    }
  };

  // Verify password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setIsAuthenticated(true);
          sessionStorage.setItem('adminToken', password);
          await loadConfig(password);
          await loadFleetData();
          await loadVideoUrl();
          toast.success('Login successful!');
        } else {
          toast.error('Invalid password');
        }
      } else {
        toast.error('Invalid password');
      }
    } catch (error) {
      toast.error('Login failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Check for existing session
  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (token) {
      fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: token })
      }).then(response => {
        if (response.ok) {
          setIsAuthenticated(true);
          setPassword(token);
          loadConfig(token);
          loadFleetData();
          loadVideoUrl();
        }
      });
    }
  }, []);

  // Save configuration
  const handleSave = async () => {
    if (!config) return;
    setLoading(true);

    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        toast.success('Configuration saved successfully!');
      } else {
        toast.error('Failed to save configuration');
      }
    } catch (error) {
      toast.error('Error saving configuration');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset to default configuration? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
        toast.success('Configuration reset to defaults!');
      } else {
        toast.error('Failed to reset configuration');
      }
    } catch (error) {
      toast.error('Error resetting configuration');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Export configuration
  const handleExport = () => {
    if (!config) return;
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `roi-calculator-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Configuration exported!');
  };

  // Import configuration
  const handleImport = () => {
    try {
      const importedConfig = JSON.parse(importText);
      if (!importedConfig.tiers || !importedConfig.usdPackages) {
        toast.error('Invalid configuration format');
        return;
      }
      setConfig(importedConfig);
      setImportText('');
      toast.success('Configuration imported! Click Save to apply.');
    } catch (error) {
      toast.error('Invalid JSON format');
      console.error(error);
    }
  };

  // Update tier field
  const updateTier = (index: number, field: keyof TierConfig, value: any) => {
    if (!config) return;
    const newConfig = { ...config };
    newConfig.tiers[index] = { ...newConfig.tiers[index], [field]: value };
    setConfig(newConfig);
  };

  // Update USD package
  const updatePackage = (index: number, field: keyof USDPackage, value: number) => {
    if (!config) return;
    const newConfig = { ...config };
    newConfig.usdPackages[index] = { ...newConfig.usdPackages[index], [field]: value };
    setConfig(newConfig);
  };

  // Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    sessionStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Admin Panel</CardTitle>
            <CardDescription className="text-center">
              Enter your password to access the configuration panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Login'}
              </Button>
            </form>
            <Alert className="mt-4">
              <AlertDescription className="text-sm">
                Default password: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code>
                <br />
                Change this in your .env file (ADMIN_PASSWORD)
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ROI Calculator Admin Panel
            </h1>
            <p className="text-gray-600 mt-1">Configure tiers, bonuses, and packages for marketing campaigns</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
          <Button onClick={handleReset} variant="destructive" disabled={loading}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
        </div>

        {config && (
          <Tabs defaultValue="tiers" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="tiers">Tier Configuration</TabsTrigger>
              <TabsTrigger value="packages">USD Packages</TabsTrigger>
              <TabsTrigger value="fleet">Fleet Data</TabsTrigger>
              <TabsTrigger value="video">Fleet Video</TabsTrigger>
              <TabsTrigger value="import">Import/Export</TabsTrigger>
            </TabsList>

            {/* Tiers Tab */}
            <TabsContent value="tiers" className="space-y-4">
              {config.tiers.map((tier, index) => (
                <Card key={tier.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tier.color }}
                      />
                      Tier {tier.id}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Tier Name</Label>
                      <Input
                        value={tier.name}
                        onChange={(e) => updateTier(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Min Tokens</Label>
                      <Input
                        type="number"
                        value={tier.minTokens}
                        onChange={(e) => updateTier(index, 'minTokens', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Max Tokens {tier.maxTokens === null && '(Infinity)'}</Label>
                      <Input
                        type="number"
                        value={tier.maxTokens || ''}
                        onChange={(e) => updateTier(index, 'maxTokens', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="Leave empty for Infinity"
                      />
                    </div>
                    <div>
                      <Label>Base Bonus (A) %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={tier.baseBonus}
                        onChange={(e) => updateTier(index, 'baseBonus', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Proportional Multiplier (B)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={tier.proportionalMultiplier}
                        onChange={(e) => updateTier(index, 'proportionalMultiplier', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Min ROI %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={tier.minROI}
                        onChange={(e) => updateTier(index, 'minROI', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Max ROI %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={tier.maxROI}
                        onChange={(e) => updateTier(index, 'maxROI', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Threshold {tier.threshold === null && '(None)'}</Label>
                      <Input
                        type="number"
                        value={tier.threshold || ''}
                        onChange={(e) => updateTier(index, 'threshold', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="Leave empty for no threshold"
                      />
                    </div>
                    <div>
                      <Label>Color (Hex)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={tier.color}
                          onChange={(e) => updateTier(index, 'color', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={tier.color}
                          onChange={(e) => updateTier(index, 'color', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <Label>Description (Optional)</Label>
                      <Textarea
                        value={tier.description || ''}
                        onChange={(e) => updateTier(index, 'description', e.target.value || null)}
                        placeholder="Special description for this tier (e.g., for Tier 5)"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* USD Packages Tab */}
            <TabsContent value="packages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>USD Investment Packages</CardTitle>
                  <CardDescription>
                    Define the token-to-USD conversion packages available to investors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {config.usdPackages.map((pkg, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6 space-y-3">
                          <div>
                            <Label className="text-xs">USD Amount</Label>
                            <Input
                              type="number"
                              value={pkg.usd}
                              onChange={(e) => updatePackage(index, 'usd', parseInt(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Tokens</Label>
                            <Input
                              type="number"
                              value={pkg.tokens}
                              onChange={(e) => updatePackage(index, 'tokens', parseInt(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                          <div className="text-xs text-gray-500 text-center pt-2 border-t">
                            ${pkg.usd} = {pkg.tokens.toLocaleString()} tokens
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fleet Data Tab */}
            <TabsContent value="fleet" className="space-y-4">
              <Alert className="bg-blue-50 border-blue-300 mb-4">
                <AlertDescription>
                  <strong>✨ Auto-Update System Active:</strong> Most metrics (trips, passengers, revenue) update automatically every hour/12 hours. Only modify starting values or marketing numbers below.
                </AlertDescription>
              </Alert>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🚗</span>
                    Fleet Configuration
                  </CardTitle>
                  <CardDescription>
                    Set initial values and marketing numbers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Total Fleet</Label>
                      <Input
                        type="number"
                        value={fleetData.totalFleet}
                        onChange={(e) => setFleetData({...fleetData, totalFleet: parseInt(e.target.value) || 30})}
                      />
                      <p className="text-xs text-gray-500">Total cars owned</p>
                    </div>

                    <div className="space-y-2">
                      <Label>In Licensing</Label>
                      <Input
                        type="number"
                        value={fleetData.inLicensing}
                        onChange={(e) => setFleetData({...fleetData, inLicensing: parseInt(e.target.value) || 5})}
                      />
                      <p className="text-xs text-gray-500">Cars awaiting licenses</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Lifetime Trips (Starting)</Label>
                      <Input
                        type="number"
                        value={fleetData.lifetimeTrips}
                        onChange={(e) => setFleetData({...fleetData, lifetimeTrips: parseInt(e.target.value) || 250})}
                      />
                      <p className="text-xs text-gray-500">Initial trip count</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Lifetime Passengers (Starting)</Label>
                      <Input
                        type="number"
                        value={fleetData.lifetimePassengers}
                        onChange={(e) => setFleetData({...fleetData, lifetimePassengers: parseInt(e.target.value) || 500})}
                      />
                      <p className="text-xs text-gray-500">Initial passenger count</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Last Month Distribution ($)</Label>
                      <Input
                        type="number"
                        value={fleetData.lastMonthDistribution}
                        onChange={(e) => setFleetData({...fleetData, lastMonthDistribution: parseInt(e.target.value) || 14500})}
                      />
                      <p className="text-xs text-gray-500">For marketing purposes</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Total Distributed ($)</Label>
                      <Input
                        type="number"
                        value={fleetData.totalDistributed}
                        onChange={(e) => setFleetData({...fleetData, totalDistributed: parseInt(e.target.value) || 87000})}
                      />
                      <p className="text-xs text-gray-500">All-time investor distributions</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button 
                      onClick={saveFleetData} 
                      disabled={loading}
                      className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Fleet Data
                    </Button>
                  </div>

                  {/* Preview Stats */}
                  <Alert className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300">
                    <AlertDescription>
                      <div className="font-semibold mb-2">📊 Current Status:</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Fleet Usage:</span>
                          <div className="font-bold text-emerald-600">
                            {Math.round((fleetData.activeCars / fleetData.totalFleet) * 100)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Active Cars:</span>
                          <div className="font-bold text-blue-600">
                            {fleetData.activeCars}/{fleetData.totalFleet}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Investor Pool:</span>
                          <div className="font-bold text-purple-600">
                            ${fleetData.investorPool.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">CO₂ Saved:</span>
                          <div className="font-bold text-green-600">
                            {fleetData.co2Saved} kg
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Video Tab */}
            <TabsContent value="video" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fleet Video Presentation</CardTitle>
                  <CardDescription>
                    Upload a video to display on the fleet dashboard. The video will auto-play in a loop.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="videoFile">Upload Video File</Label>
                    <Input
                      id="videoFile"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileUpload}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: MP4, WebM, MOV. Max recommended size: 50MB
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <Label htmlFor="videoUrl">Or Enter Video URL</Label>
                    <Input
                      id="videoUrl"
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://example.com/video.mp4"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a direct link to a video file (e.g., from cloud storage)
                    </p>
                  </div>

                  {videoUrl && (
                    <div className="border-t pt-4">
                      <Label>Video Preview</Label>
                      <div className="mt-2 bg-black rounded-lg overflow-hidden">
                        <video
                          src={videoUrl}
                          controls
                          className="w-full max-h-64"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={saveVideoUrl} 
                    disabled={loading || !videoUrl}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Video Configuration
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Import/Export Tab */}
            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Import Configuration</CardTitle>
                  <CardDescription>
                    Paste a previously exported configuration JSON to import it
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste configuration JSON here..."
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleImport} disabled={!importText}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Configuration
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Configuration (JSON)</CardTitle>
                  <CardDescription>
                    View or copy the current configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={JSON.stringify(config, null, 2)}
                    readOnly
                    rows={15}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
