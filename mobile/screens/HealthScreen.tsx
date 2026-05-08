import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import { fetchSystemHealth } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function HealthScreen() {
  const [healthData, setHealthData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    try {
      const data = await fetchSystemHealth();
      setHealthData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return { color: '#EF4444', label: 'CRITICAL' };
      case 'degraded': return { color: '#F97316', label: 'DEGRADED' };
      case 'monitor': return { color: '#F59E0B', label: 'MONITOR' };
      default: return { color: '#10B981', label: 'OPTIMAL' };
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.headerArea}>
        <SafeAreaView>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerLabel}>FLEET OVERVIEW</Text>
              <Text style={styles.headerTitle}>System Health</Text>
            </View>
            <View style={styles.headerRight}>
              <Icon name="shield-check-outline" size={32} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <StatBox label="Active Units" value={healthData.length.toString()} />
            <StatBox label="Avg Health" value={`${Math.round(healthData.reduce((acc, u) => acc + u.health_score, 0) / healthData.length)}%`} />
            <StatBox label="Warnings" value={healthData.filter(u => u.severity !== 'normal').length.toString()} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {healthData.map((unit, index) => {
          const config = getStatusConfig(unit.severity);
          return (
            <View key={index} style={styles.unitCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.unitName}>{unit.unit_id}</Text>
                  <Text style={[styles.unitTag, { color: config.color }]}>{config.label}</Text>
                </View>
                <ProgressCircle size={60} progress={unit.health_score} color={config.color} />
              </View>

              <View style={styles.divider} />

              <View style={styles.metricsContainer}>
                <MetricBox icon="thermometer" label="TEMP" value={`${unit.avg_temp?.toFixed(1) ?? 'N/A'}°C`} />
                <MetricBox icon="fan" label="AIRFLOW" value={unit.avg_airflow?.toFixed(0) ?? 'N/A'} />
                <MetricBox icon="vibrate" label="VIBRATION" value={unit.avg_vibration?.toFixed(3) ?? 'N/A'} />
                <MetricBox icon="lightning-bolt" label="POWER" value={unit.avg_power?.toFixed(1) ?? 'N/A'} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const StatBox = ({ label, value }: any) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MetricBox = ({ icon, label, value }: any) => (
  <View style={styles.metricBox}>
    <Icon name={icon} size={16} color="#6366F1" />
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const ProgressCircle = ({ size, progress, color }: any) => {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={[styles.progressText, { color }]}>{progress}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerArea: {
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 24,
  },
  headerLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
  },
  headerRight: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: (width - 68) / 3,
    paddingVertical: 12,
    borderRadius: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
  },
  unitCard: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  unitTag: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  progressText: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  metricLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
    marginLeft: 8,
    flex: 1,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
});
