import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

function TestApp() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.text}>Test App - Migration Successful!</Text>
        <Text style={styles.subtext}>
          React Native built-in APIs are working correctly
        </Text>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default TestApp;