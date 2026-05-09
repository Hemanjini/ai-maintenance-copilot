import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

interface SeverityDonutProps {
  distribution: {
    critical: number;
    high: number;
    medium: number;
    normal: number;
  };
}

const SeverityDonut = ({ distribution }: SeverityDonutProps) => {
  const total = distribution.critical + distribution.high + distribution.medium + distribution.normal;

  const pieData = [
    { value: distribution.critical, color: '#EF4444', text: 'C' },
    { value: distribution.high, color: '#F97316', text: 'H' },
    { value: distribution.medium, color: '#EAB308', text: 'M' },
    { value: distribution.normal, color: '#10B981', text: 'N' },
  ].filter(item => item.value > 0);

  return (
    <View style={styles.container}>
      <PieChart
        donut
        radius={70}
        innerRadius={50}
        data={pieData}
        centerLabelComponent={() => (
          <View style={styles.centerLabel}>
            <Text style={styles.totalText}>{total}</Text>
            <Text style={styles.subText}>ISSUES</Text>
          </View>
        )}
      />
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>CRITICAL ({distribution.critical})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#F97316' }]} />
          <Text style={styles.legendText}>HIGH ({distribution.high})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#EAB308' }]} />
          <Text style={styles.legendText}>MEDIUM ({distribution.medium})</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
  },
  subText: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '800',
  },
  legend: {
    marginLeft: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
});

export default SeverityDonut;
