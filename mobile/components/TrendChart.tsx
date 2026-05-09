import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

interface DataPoint {
  value: number;
  label?: string;
}

interface TrendChartProps {
  data: DataPoint[];
  title: string;
  unit: string;
  theme: 'vibration' | 'airflow' | 'temp' | 'risk';
  maxValue?: number;
}

const THEMES = {
  vibration: {
    color: '#F97316',
    gradient: ['#FB923C', '#F97316'],
    label: 'VIB',
  },
  airflow: {
    color: '#06B6D4',
    gradient: ['#22D3EE', '#06B6D4'],
    label: 'AIR',
  },
  temp: {
    color: '#EAB308',
    gradient: ['#FDE047', '#EAB308'],
    label: 'TMP',
  },
  risk: {
    color: '#6366F1',
    gradient: ['#818CF8', '#6366F1'],
    label: 'RSK',
  },
};

const TrendChart = ({ data, title, unit, theme, maxValue }: TrendChartProps) => {
  const currentTheme = THEMES[theme];
  const screenWidth = Dimensions.get('window').width;

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available for this range</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.badge, { backgroundColor: currentTheme.color }]}>
          <Text style={styles.badgeText}>{currentTheme.label}</Text>
        </View>
      </View>

      <LineChart
        data={data}
        width={screenWidth - 80}
        height={180}
        spacing={screenWidth / (data.length > 0 ? data.length + 2 : 10)}
        initialSpacing={10}
        color={currentTheme.color}
        thickness={3}
        startFillColor={currentTheme.color}
        endFillColor="transparent"
        startOpacity={0.4}
        endOpacity={0}
        noOfSections={3}
        yAxisColor="#CBD5E1"
        yAxisThickness={1}
        yAxisLabelContainerStyle={{ width: 40 }}
        yAxisTextStyle={{ color: '#64748B', fontSize: 10 }}
        xAxisColor="#CBD5E1"
        pointerConfig={{
          pointerStripHeight: 140,
          pointerStripColor: '#94A3B8',
          pointerStripWidth: 2,
          pointerColor: currentTheme.color,
          radius: 6,
          pointerLabelComponent: (items: any) => (
            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>{items[0].value} {unit}</Text>
            </View>
          ),
        }}
        curved
        hideDataPoints
        rulesType="solid"
        rulesColor="#E2E8F0"
        yAxisLabelSuffix={unit === '%' ? '%' : ''}
        maxValue={maxValue}
      />
      
      <View style={styles.footer}>
        <Text style={styles.timeLabel}>{data[0]?.label || ''}</Text>
        <Text style={styles.timeLabel}>{data[Math.floor(data.length / 2)]?.label || ''}</Text>
        <Text style={styles.timeLabel}>{data[data.length - 1]?.label || ''}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  emptyState: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  labelContainer: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  timeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
});

export default TrendChart;
