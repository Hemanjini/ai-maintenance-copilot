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
  theme: 'vibration' | 'airflow' | 'temp' | 'risk' | 'pressure' | 'power';
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
  pressure: {
    color: '#10B981',
    gradient: ['#34D399', '#10B981'],
    label: 'PRS',
  },
  power: {
    color: '#8B5CF6',
    gradient: ['#A78BFA', '#8B5CF6'],
    label: 'PWR',
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
  
  const chartWidth = screenWidth - 130;
  // Calculate dynamic spacing to ensure the chart fills the available width
  const dynamicSpacing = (chartWidth - 20) / (data.length > 1 ? data.length - 1 : 1);
  const spacing = Math.max(2, dynamicSpacing);

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

  // Generate 5 clean labels for the footer
  const getFooterLabels = () => {
    if (data.length < 2) return [data[0]?.label?.split(' ')[1]?.substring(0, 5) || ''];
    
    const indices = [
      0, 
      Math.floor(data.length * 0.25),
      Math.floor(data.length * 0.5),
      Math.floor(data.length * 0.75),
      data.length - 1
    ];
    
    return indices.map(idx => {
      const label = data[idx]?.label || '';
      return label.includes(' ') ? label.split(' ')[1].substring(0, 5) : label.substring(0, 5);
    });
  };

  const footerLabels = getFooterLabels();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.badge, { backgroundColor: currentTheme.color }]}>
          <Text style={styles.badgeText}>{currentTheme.label}</Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <LineChart
          data={data.map(d => ({ value: d.value }))}
          width={chartWidth}
          height={200}
          spacing={spacing}
          initialSpacing={10}
          color={currentTheme.color}
          thickness={3}
          startFillColor={currentTheme.color}
          endFillColor="transparent"
          startOpacity={0.4}
          endOpacity={0}
          noOfSections={4}
          yAxisColor="#CBD5E1"
          yAxisThickness={1}
          yAxisLabelWidth={30}
          yAxisTextStyle={{ color: '#64748B', fontSize: 10 }}
          xAxisColor="rgba(226, 232, 240, 0.4)"
          hideRules={false}
          rulesLength={chartWidth}
          xAxisLabelTextStyle={{ fontSize: 0 }}
          pointerConfig={{
            pointerStripHeight: 160,
            pointerStripColor: '#94A3B8',
            pointerStripWidth: 2,
            pointerColor: currentTheme.color,
            radius: 6,
            pointerLabelComponent: (items: any) => (
              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>{items[0].value.toFixed(1)} {unit}</Text>
              </View>
            ),
          }}
          curved
          hideDataPoints
          rulesType="solid"
          rulesColor="rgba(226, 232, 240, 0.5)"
          yAxisLabelSuffix={unit === '%' ? '%' : ''}
          maxValue={maxValue}
          backgroundColor="transparent"
        />
      </View>
      
      <View style={styles.footer}>
        {footerLabels.map((label, i) => (
          <Text key={i} style={styles.timeLabel}>{label}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.1)',
    overflow: 'hidden',
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
    color: 'rgba(255, 255, 255, 0.9)',
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
  chartWrapper: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'flex-start',
    paddingBottom: 5,
  },
  emptyState: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  labelContainer: {
    backgroundColor: '#6366F1',
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
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  timeLabel: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '700',
  },
});

export default TrendChart;
