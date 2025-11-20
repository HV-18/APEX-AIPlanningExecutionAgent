import { useState, useEffect } from "react";
import { Leaf, TrendingDown, DollarSign, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SustainabilityPage = () => {
  const [stats, setStats] = useState({
    totalCO2Saved: 0,
    moneySaved: 0,
    greenTrips: 0,
  });
  const [transportLog, setTransportLog] = useState({
    mode: "",
    distance_km: "",
    cost: "",
    destination: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: transports } = await supabase
        .from("transport_logs")
        .select("*")
        .eq("user_id", user.id);

      if (transports) {
        const totalCO2 = transports.reduce((sum, t) => sum + (Number(t.co2_saved) || 0), 0);
        const totalCost = transports.reduce((sum, t) => sum + (Number(t.cost) || 0), 0);
        const greenModes = transports.filter(t => ['walk', 'bike', 'bus', 'train'].includes(t.mode));

        setStats({
          totalCO2Saved: Math.round(totalCO2 * 10) / 10,
          moneySaved: Math.round((50 - totalCost) * 10) / 10,
          greenTrips: greenModes.length,
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const calculateCO2 = (mode: string, km: number) => {
    const emissions = {
      walk: 0,
      bike: 0,
      bus: 0.089,
      train: 0.041,
      car: 0.192,
      rideshare: 0.15,
      scooter: 0.05,
    };
    const carEmission = 0.192 * km;
    const modeEmission = (emissions[mode as keyof typeof emissions] || 0) * km;
    return Math.max(0, carEmission - modeEmission);
  };

  const logTransport = async () => {
    if (!transportLog.mode || !transportLog.distance_km) {
      toast({
        title: "Missing information",
        description: "Please fill in transport mode and distance",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const distance = parseFloat(transportLog.distance_km);
      const co2Saved = calculateCO2(transportLog.mode, distance);

      await supabase.from("transport_logs").insert({
        user_id: user.id,
        mode: transportLog.mode,
        distance_km: distance,
        cost: transportLog.cost ? parseFloat(transportLog.cost) : null,
        co2_saved: co2Saved,
        destination: transportLog.destination || null,
      });

      toast({
        title: "Trip logged! 🌍",
        description: `You saved ${co2Saved.toFixed(2)} kg CO₂`,
      });

      setTransportLog({ mode: "", distance_km: "", cost: "", destination: "" });
      loadStats();
    } catch (error) {
      console.error("Error logging transport:", error);
      toast({
        title: "Error",
        description: "Failed to log trip",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Leaf className="w-8 h-8 text-secondary" />
          Sustainable Living
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your eco-friendly choices and make a positive impact
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-secondary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CO₂ Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2 text-secondary">
              <TrendingDown className="w-5 h-5" />
              {stats.totalCO2Saved} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs driving everywhere
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Money Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2 text-primary">
              <DollarSign className="w-5 h-5" />
              ${stats.moneySaved}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              on transport this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Green Trips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2 text-accent">
              <Award className="w-5 h-5" />
              {stats.greenTrips}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              eco-friendly choices
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Log Your Trip</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Transport Mode</label>
              <Select value={transportLog.mode} onValueChange={(val) => setTransportLog({ ...transportLog, mode: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk">🚶 Walk (0 CO₂)</SelectItem>
                  <SelectItem value="bike">🚲 Bike (0 CO₂)</SelectItem>
                  <SelectItem value="bus">🚌 Bus (Low CO₂)</SelectItem>
                  <SelectItem value="train">🚊 Train (Very Low CO₂)</SelectItem>
                  <SelectItem value="scooter">🛴 E-Scooter (Low CO₂)</SelectItem>
                  <SelectItem value="rideshare">🚗 Rideshare (Medium CO₂)</SelectItem>
                  <SelectItem value="car">🚙 Personal Car (High CO₂)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Distance (km)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g., 5.2"
                value={transportLog.distance_km}
                onChange={(e) => setTransportLog({ ...transportLog, distance_km: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cost (optional)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g., 2.50"
                value={transportLog.cost}
                onChange={(e) => setTransportLog({ ...transportLog, cost: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Destination (optional)</label>
              <Input
                placeholder="e.g., University"
                value={transportLog.destination}
                onChange={(e) => setTransportLog({ ...transportLog, destination: e.target.value })}
              />
            </div>

            <Button onClick={logTransport} className="w-full">
              Log Trip
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-secondary" />
              Impact & Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold">🌍 Your Environmental Impact</h4>
              <p className="text-muted-foreground">
                Every kg of CO₂ saved helps fight climate change. You're making a real difference!
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <h4 className="font-semibold">💡 Sustainable Transport Tips</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Walk/bike for trips under 3km</li>
                <li>• Use public transport for longer trips</li>
                <li>• Carpool with classmates</li>
                <li>• Plan routes to combine errands</li>
                <li>• Campus shuttles are free & green</li>
              </ul>
            </div>

            <div className="space-y-2 text-sm">
              <h4 className="font-semibold">🎯 Monthly Challenge</h4>
              <p className="text-muted-foreground">
                Save 10kg CO₂ this month by choosing green transport!
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-secondary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.totalCO2Saved / 10) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalCO2Saved.toFixed(1)} / 10 kg CO₂ saved
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SustainabilityPage;
