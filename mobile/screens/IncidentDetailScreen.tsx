import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchIncidentAnalysis, fetchIncidentTelemetry } from '../services/api';
import TrendChart from '../components/TrendChart';

const IncidentDetailScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  const incident = {
    unit_id: params.unit_id as string,
    severity: params.severity as string,
    primary_issue: params.primary_issue as string,
    contributing_factors: params.contributing_factors as string,
    confidence: params.confidence,
    symptoms: params.symptoms as string,
    start_time: params.start_time as string,
    end_time: params.end_time as string,
    duration_minutes: params.duration_minutes,
    risk_score: params.risk_score,
    recommendation: params.recommendation as string,
    ai_summary: params.ai_summary as string,
    ai_impact: params.ai_impact as string,
    ai_guidance: params.ai_guidance as string,
    index: parseInt(params.index as string),
  };

  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Helper to format date for backend
        const formatDate = (date: Date) => {
          const pad = (n: number) => n < 10 ? '0' + n : n;
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };

        // Expand the window to show the "Pattern of Failure" leading up to the incident
        const incidentStart = new Date(incident.start_time);
        const incidentEnd = new Date(incident.end_time || incident.start_time);
        
        // Look 3 hours before the incident starts to see the degradation trend
        // Look 1 hour after the incident ends (or current state)
        const expandedStart = formatDate(new Date(incidentStart.getTime() - 3 * 60 * 60 * 1000));
        const expandedEnd = formatDate(new Date(incidentEnd.getTime() + 1 * 60 * 60 * 1000));

        const data = await fetchIncidentTelemetry(incident.unit_id, expandedStart, expandedEnd);
        setTelemetry(data);
      } catch (err) {
        console.error("Chart data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [incident.unit_id, incident.start_time]);

  // Map data for charts with safety checks for missing telemetry fields
  const vibData = telemetry.map(d => ({ value: parseFloat((d.vibration || 0).toFixed(3)), label: d.timestamp }));
  const airData = telemetry.map(d => ({ value: Math.round(d.airflow || 0), label: d.timestamp }));
  const tempData = telemetry.map(d => ({ value: Math.round(d.temp || 0), label: d.timestamp }));
  const pressData = telemetry.map(d => ({ value: parseFloat((d.pressure || 0).toFixed(2)), label: d.timestamp }));
  const powerData = telemetry.map(d => ({ value: parseFloat((d.power || 0).toFixed(2)), label: d.timestamp }));
  const riskData = telemetry.map(d => ({ value: Math.round(d.risk_score || 0), label: d.timestamp }));


  const getStatusConfig = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return { color: '#EF4444', bg: '#FEF2F2' };
      case 'high': return { color: '#F59E0B', bg: '#FFFBEB' };
      case 'medium': return { color: '#FBBF24', bg: '#FFFBEB' };
      default: return { color: '#10B981', bg: '#F0FDF4' };
    }
  };

  const status = getStatusConfig(incident.severity);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.topSection}>
        <SafeAreaView>
          <View style={styles.navHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Icon name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Incident Detail</Text>
            <View style={{ width: 44 }} />
          </View>
          
          <View style={styles.hero}>
            <Text style={styles.unitId}>{incident.unit_id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <View style={[styles.dot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusText, { color: status.color }]}>{incident.severity?.toUpperCase()}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.diagnosisBox}>
            <Text style={styles.sectionLabel}>AI DIAGNOSIS</Text>
            <Text style={styles.likelyIssue}>{incident.primary_issue}</Text>
            <View style={styles.confRow}>
              <Icon name="brain" size={16} color="#6366F1" />
              <Text style={styles.confText}>{incident.confidence}% Prediction Confidence</Text>
            </View>
            
            {incident.contributing_factors ? (
              <View style={styles.factorsContainer}>
                <Text style={styles.factorsLabel}>Contributing Factors:</Text>
                <Text style={styles.factorsText}>{incident.contributing_factors}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>TECHNICIAN RECOMMENDATION</Text>
          <View style={styles.recommendationRow}>
            <Icon name="tools" size={20} color="#3B82F6" />
            <Text style={styles.recommendationText}>{incident.recommendation}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>DETECTED ANOMALIES</Text>
          <View style={styles.symptomsContainer}>
            {incident.symptoms?.replace(/[\[\]']/g, '').split(', ').map((s, i) => (
              <View key={i} style={styles.symptomChip}>
                <Icon name="alert-circle-outline" size={14} color="#64748B" />
                <Text style={styles.symptomText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>TIMELINE & IMPACT</Text>
          <View style={styles.infoGrid}>
            <InfoItem label="First Seen" value={new Date(incident.start_time).toLocaleTimeString()} />
            <InfoItem label="Last Update" value={new Date(incident.end_time).toLocaleTimeString()} />
            <InfoItem label="Duration" value={`${incident.duration_minutes}m`} />
            <InfoItem label="Risk Index" value={incident.risk_score} highlight color={status.color} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>AI TECHNICAL ANALYSIS</Text>
          <View style={styles.aiInsightsBox}>
            <View style={styles.aiBadge}>
              <Icon name="robot" size={14} color="#FFF" />
              <Text style={styles.aiBadgeText}>AI ENGINE INSIGHTS</Text>
            </View>
            
            <Text style={styles.aiImpactTitle}>Operational Impact</Text>
            <Text style={styles.aiImpactText}>{incident.ai_impact}</Text>

            <Text style={styles.aiGuidanceTitle}>Technician Guidance</Text>
            {incident.ai_guidance?.split(', ').map((step, i) => (
              <View key={i} style={styles.guidanceItem}>
                <Icon name="chevron-right" size={16} color="#6366F1" />
                <Text style={styles.guidanceText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>VISUAL TECHNICAL EVIDENCE</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#6366F1" style={{ marginVertical: 40 }} />
          ) : (
            <>
              <TrendChart 
                title="Vibration Trend (Mechanical Load)" 
                unit="mm/s" 
                theme="vibration" 
                data={vibData} 
              />
              <TrendChart 
                title="Airflow Stability (Efficiency)" 
                unit="CFM" 
                theme="airflow" 
                data={airData} 
              />
              <TrendChart 
                title="Thermal Signature (Temperature)" 
                unit="°C" 
                theme="temp" 
                data={tempData} 
              />
              <TrendChart 
                title="Pressure Profile (Stability)" 
                unit="Bar" 
                theme="pressure" 
                data={pressData} 
              />
              <TrendChart 
                title="Electrical Load (Power)" 
                unit="kW" 
                theme="power" 
                data={powerData} 
              />
              <TrendChart 
                title="Risk Score Escalation" 
                unit="" 
                theme="risk" 
                data={riskData} 
                maxValue={200}
              />
            </>
          )}
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>ACKNOWLEDGE & DISPATCH</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const InfoItem = ({ label, value, highlight, color }: any) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, highlight && { color, fontSize: 24, fontWeight: '900' }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topSection: {
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  navTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    marginTop: 20,
  },
  unitId: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    marginTop: -20,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  diagnosisBox: {
    alignItems: 'center',
  },
  likelyIssue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  factorsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    width: '100%',
  },
  factorsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  factorsText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    lineHeight: 18,
  },
  confRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confText: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '700',
    marginLeft: 8,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
  },
  recommendationText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '700',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  aiInsightsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  aiBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  aiImpactTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  aiImpactText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '500',
  },
  aiGuidanceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  guidanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 8,
  },
  guidanceText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '700',
    marginLeft: 8,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  symptomText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginLeft: 6,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  actionButton: {
    backgroundColor: '#1E293B',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  actionText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

export default IncidentDetailScreen;