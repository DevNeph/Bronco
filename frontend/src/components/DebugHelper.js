// src/components/DebugHelper.js
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/apiClient';

/**
 * A debug component for testing API connections and authentication
 * Add this to any screen for debugging purposes
 */
const DebugHelper = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prevLogs) => [`[${timestamp}] ${message}`, ...prevLogs]);
  };

  const checkAuth = async () => {
    setIsLoading(true);
    addLog('Checking authentication status...');
    
    try {
      const userStr = await AsyncStorage.getItem('user');
      const tokensStr = await AsyncStorage.getItem('tokens');
      
      if (!userStr) {
        addLog('❌ No user found in AsyncStorage');
      } else {
        const user = JSON.parse(userStr);
        addLog(`✅ User found: ${user.email}`);
      }
      
      if (!tokensStr) {
        addLog('❌ No tokens found in AsyncStorage');
      } else {
        const tokens = JSON.parse(tokensStr);
        addLog(`✅ Access token found: ${tokens.accessToken.substring(0, 15)}...`);
        addLog(`✅ Refresh token found: ${tokens.refreshToken.substring(0, 15)}...`);
      }
    } catch (error) {
      addLog(`❌ Error checking auth: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAPI = async () => {
    setIsLoading(true);
    addLog('Testing API connection (no auth)...');
    
    try {
      const response = await apiClient.get('/products?limit=1');
      addLog(`✅ API connection successful! Status: ${response.status}`);
      addLog(`✅ Received ${response.data.data.products.length} products`);
    } catch (error) {
      addLog(`❌ API connection failed: ${error.message}`);
      if (error.response) {
        addLog(`Status code: ${error.response.status}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthAPI = async () => {
    setIsLoading(true);
    addLog('Testing authenticated API endpoint...');
    
    try {
      const response = await apiClient.get('/users/me');
      addLog(`✅ Auth API successful! Status: ${response.status}`);
      addLog(`✅ User data: ${JSON.stringify(response.data.data).substring(0, 50)}...`);
    } catch (error) {
      addLog(`❌ Auth API failed: ${error.message}`);
      if (error.response) {
        addLog(`Status code: ${error.response.status}`);
        if (error.response.data && error.response.data.message) {
          addLog(`Error message: ${error.response.data.message}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Card style={styles.container}>
      <Card.Title title="Debug Helper" />
      <Card.Content>
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={checkAuth} 
            loading={isLoading}
            style={styles.button}
          >
            Check Auth
          </Button>
          <Button 
            mode="contained" 
            onPress={testAPI} 
            loading={isLoading}
            style={styles.button}
          >
            Test API
          </Button>
          <Button 
            mode="contained" 
            onPress={testAuthAPI} 
            loading={isLoading}
            style={styles.button}
          >
            Test Auth API
          </Button>
          <Button 
            mode="outlined" 
            onPress={clearLogs}
            style={styles.button}
          >
            Clear Logs
          </Button>
        </View>
        
        <Text style={styles.logTitle}>Debug Logs:</Text>
        <ScrollView style={styles.logContainer}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>
              {log}
            </Text>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  button: {
    margin: 4,
    minWidth: '45%',
  },
  logTitle: {
    fontWeight: 'bold',
    marginVertical: 8,
  },
  logContainer: {
    maxHeight: 200,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});

export default DebugHelper;