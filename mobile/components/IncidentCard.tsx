import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

interface IncidentCardProps {
  incident: {
    unit_id: string;
    severity: string;
    primary_issue: string;
    ai_summary: string;
    start_time: string;
    risk_score: number;
  };
  onPress: () => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onPress }) => {
  const getStatusConfig = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return { colors: ['#FEF2F2', '#FEE2E2'], text: '#EF4444', icon: 'alert-octagon' };
      case 'high': return { colors: ['#FFFBEB', '#FEF3C7'], text: '#F59E0B', icon: 'alert' };
      case 'medium': return { colors: ['#FFFBEB', '#FEF3C7'], text: '#D97706', icon: 'alert-circle' };
      default: return { colors: ['#F0FDF4', '#DCFCE7'], text: '#10B981', icon: 'check-circle' };
    }
  };

  const config = getStatusConfig(incident.severity);

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.unitBox}>
            <View style={[styles.indicator, { backgroundColor: config.text }]} />
            <Text style={styles.unitId}>{incident.unit_id}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: config.colors[1] }]}>
            <Text style={[styles.badgeText, { color: config.text }]}>
              {incident.severity.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.issue} numberOfLines={2}>{incident.ai_summary}</Text>

        <View style={styles.contentRow}>
          <View style={styles.metaInfo}>
            <View style={styles.timeRow}>
              <Icon name="clock-outline" size={14} color="#94A3B8" />
              <Text style={styles.timeText}>{new Date(incident.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <View style={styles.sparkline}>
              <Svg height="20" width="60">
                <Path
                  d="M0 10 L10 5 L20 15 L30 8 L40 12 L50 4 L60 10"
                  fill="none"
                  stroke={config.text}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </Svg>
            </View>
          </View>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>RISK</Text>
            <Text style={[styles.scoreValue, { color: config.text }]}>{incident.risk_score}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 0.8)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  unitBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  unitId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  issue: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 20,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  metaInfo: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 13,
    color: '#94A3B8',
    marginLeft: 6,
    fontWeight: '500',
  },
  sparkline: {
    opacity: 0.5,
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '900',
  },
});

export default IncidentCard;
