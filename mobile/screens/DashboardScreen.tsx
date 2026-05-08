import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar, TouchableOpacity, TextInput } from 'react-native';
import IncidentCard from '../components/IncidentCard';
import { fetchIncidents } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const DashboardScreen = () => {
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const data = await fetchIncidents();
      setIncidents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidents = incidents.filter((item: any) => {
    const matchesFilter = filter === 'All' || item.severity.toLowerCase() === filter.toLowerCase();
    const matchesSearch = 
      item.unit_id.toLowerCase().includes(search.toLowerCase()) ||
      item.likely_issue.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.topSection}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>SYSTEM MONITOR</Text>
              <Text style={styles.title}>Maintenance</Text>
            </View>
            <TouchableOpacity style={styles.alertBtn}>
              <Icon name="bell-ring-outline" size={24} color="#FFF" />
              <View style={styles.badgeDot} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search units or issues..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.filterRow}>
            {['All', 'Critical', 'High', 'Medium'].map((label) => (
              <FilterChip 
                key={label}
                label={label} 
                active={filter === label} 
                onPress={() => setFilter(label)}
              />
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <FlatList
        data={filteredIncidents}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item: any) => item.start_time + item.unit_id}
        renderItem={({ item, index }) => (
          <IncidentCard
            incident={item}
            onPress={() => {
              // We find the index in the original array to match the backend CSV index
              const originalIndex = incidents.indexOf(item);
              router.push({
                pathname: "/incident/[id]",
                params: { id: item.unit_id, ...item, index: originalIndex }
              });
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="check-decagram-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Clear Skies</Text>
            <Text style={styles.emptySub}>No incidents match your current filter.</Text>
          </View>
        }
      />
    </View>
  );
};

const FilterChip = ({ label, active, onPress }: any) => (
  <TouchableOpacity 
    style={[styles.chip, active && styles.chipActive]} 
    onPress={onPress}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  topSection: {
    paddingBottom: 24,
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
  greeting: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
  },
  alertBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 24,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#3B82F6',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#334155',
    marginTop: 20,
  },
  emptySub: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default DashboardScreen;