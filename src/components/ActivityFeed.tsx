import { useEffect, useState } from 'react';
import { Activity, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase, ActivityLog } from '../lib/supabase';
import { shortenAddress } from '../lib/web3';

interface ActivityFeedProps {
  campaignId: string;
  limit?: number;
}

export function ActivityFeed({ campaignId, limit = 10 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();

    const subscription = supabase
      .channel(`activity:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          setActivities((prev) => [payload.new as ActivityLog, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [campaignId, limit]);

  const loadActivities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_log')
      .select('*, profiles(*)')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data) {
      setActivities(data);
    }
    setLoading(false);
  };

  const getIcon = (eventType: string) => {
    switch (eventType) {
      case 'created':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'pledged':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'withdrawn':
        return <RefreshCw className="w-4 h-4 text-purple-600" />;
      case 'refunded':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatEventMessage = (activity: ActivityLog): string => {
    const address = activity.profiles?.wallet_address || 'Someone';
    const displayName = address !== 'Someone' ? shortenAddress(address) : address;

    switch (activity.event_type) {
      case 'created':
        return `Campaign created by ${displayName}`;
      case 'pledged':
        return `${displayName} pledged ${activity.data.amount || '...'} ${activity.data.token || 'tokens'}`;
      case 'withdrawn':
        return `${displayName} withdrew funds`;
      case 'refunded':
        return `${displayName} claimed refund`;
      default:
        return `${activity.event_type} by ${displayName}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="mt-0.5">{getIcon(activity.event_type)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">{formatEventMessage(activity)}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(activity.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
