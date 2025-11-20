import { useState, useEffect } from "react";
import { Users, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface StudyPartner {
  user_id: string;
  user_name: string;
  last_seen: string;
  room_count: number;
}

export const RecentStudyPartners = () => {
  const [partners, setPartners] = useState<StudyPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentPartners();
  }, []);

  const loadRecentPartners = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get rooms the current user has joined
      const { data: myRooms } = await supabase
        .from("room_participants")
        .select("room_id")
        .eq("user_id", user.id);

      if (!myRooms || myRooms.length === 0) {
        setLoading(false);
        return;
      }

      const roomIds = myRooms.map(r => r.room_id);

      // Get other participants from those rooms
      const { data: participants } = await supabase
        .from("room_participants")
        .select("user_id, user_name, joined_at")
        .in("room_id", roomIds)
        .neq("user_id", user.id)
        .order("joined_at", { ascending: false });

      if (participants) {
        // Group by user and get their most recent activity
        const partnerMap = new Map<string, StudyPartner>();
        
        participants.forEach(p => {
          const existing = partnerMap.get(p.user_id);
          if (!existing) {
            partnerMap.set(p.user_id, {
              user_id: p.user_id,
              user_name: p.user_name,
              last_seen: p.joined_at!,
              room_count: 1
            });
          } else {
            existing.room_count += 1;
            if (new Date(p.joined_at!) > new Date(existing.last_seen)) {
              existing.last_seen = p.joined_at!;
            }
          }
        });

        const uniquePartners = Array.from(partnerMap.values())
          .sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime())
          .slice(0, 10);

        setPartners(uniquePartners);
      }
    } catch (error) {
      console.error("Error loading study partners:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recent Study Partners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading partners...</div>
        </CardContent>
      </Card>
    );
  }

  if (partners.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recent Study Partners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Join study rooms to connect with study partners!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Recent Study Partners
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {partners.map((partner) => (
            <Link
              key={partner.user_id}
              to={`/profile/${partner.user_id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {partner.user_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {partner.user_name}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last seen {formatDistanceToNow(new Date(partner.last_seen), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                {partner.room_count} {partner.room_count === 1 ? 'room' : 'rooms'}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
