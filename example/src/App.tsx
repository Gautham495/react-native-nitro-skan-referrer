import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Platform } from 'react-native';
import {
  getInstallReferrer,
  registerAppForAdNetworkAttribution,
  updateConversionValue,
  type ReferrerResult,
  type SKANConversionResult,
} from 'react-native-nitro-skan-referrer';

export default function App() {
  const [platform, setPlatform] = useState<string>('');
  const [referrerResult, setReferrerResult] = useState<ReferrerResult | null>(
    null
  );
  const [skanResult, setSkanResult] = useState<SKANConversionResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPlatform(Platform.OS);
  }, []);

  const handleGetReferrer = async () => {
    setLoading(true);
    try {
      const result = await getInstallReferrer();
      setReferrerResult(result);
    } catch (error) {
      console.error('Error getting referrer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSKAN = async () => {
    setLoading(true);
    try {
      const result = await registerAppForAdNetworkAttribution();
      setSkanResult(result);
    } catch (error) {
      console.error('Error registering SKAN:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConversion = async () => {
    setLoading(true);
    try {
      const result = await updateConversionValue(10);
      setSkanResult(result);
    } catch (error) {
      console.error('Error updating conversion:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nitro SKAN Referrer</Text>
      <Text style={styles.platform}>Platform: {platform}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Android - Install Referrer</Text>
        <Button
          title="Get Install Referrer"
          onPress={handleGetReferrer}
          disabled={loading || Platform.OS !== 'android'}
        />
        {referrerResult && (
          <View style={styles.result}>
            <Text>Success: {referrerResult.success ? 'Yes' : 'No'}</Text>
            {referrerResult.success && referrerResult.data && (
              <>
                <Text numberOfLines={2}>
                  Referrer: {referrerResult.data.installReferrer || 'N/A'}
                </Text>
                <Text>
                  Click Time:{' '}
                  {referrerResult.data.referrerClickTimestampSeconds}
                </Text>
                <Text>
                  Install Time:{' '}
                  {referrerResult.data.installBeginTimestampSeconds}
                </Text>
              </>
            )}
            {!referrerResult.success && (
              <Text>Error: {referrerResult.errorMessage}</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>iOS - SKAdNetwork</Text>
        <Button
          title="Register for Attribution"
          onPress={handleRegisterSKAN}
          disabled={loading || Platform.OS !== 'ios'}
        />
        <View style={styles.spacer} />
        <Button
          title="Update Conversion (value: 10)"
          onPress={handleUpdateConversion}
          disabled={loading || Platform.OS !== 'ios'}
        />
        {skanResult && (
          <View style={styles.result}>
            <Text>Success: {skanResult.success ? 'Yes' : 'No'}</Text>
            {skanResult.error && <Text>Error: {skanResult.error}</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  platform: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    width: '100%',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  result: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  spacer: {
    height: 8,
  },
});
