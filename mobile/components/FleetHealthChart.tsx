import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HealthData {
  unit_id: string;
  health_score: number;
}

interface FleetHealthChartProps {
  data: HealthData[];
}

const FleetHealthChart = ({ data }: FleetHealthChartProps) => {
  const sortedData = [...data].sort((a, b) => a.health_score - b.health_score);

  return (
    <View style={styles.container}>
      {sortedData.map((item, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.unitInfo}>
            <Text style={styles.unitId}>{item.unit_id}</Text>
            <Text style={styles.scoreText}>{item.health_score}%</Text>
          </View>
          <View style={styles.barContainer}>
            <View 
              style={[
                styles.bar, 
                { 
                  width: `${item.health_score}%`,
                  backgroundColor: item.health_score < 40 ? '#EF4444' : item.health_score < 70 ? '#F97316' : '#10B981'
                }
              ]} 
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    marginBottom: 16,
  },
  unitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  unitId: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
});

export default FleetHealthChart;
