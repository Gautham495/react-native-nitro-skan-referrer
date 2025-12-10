// @ts-nocheck
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';

import {
  getInstallReferrer,
  registerAppForAdNetworkAttribution,
  updateConversionValue,
  updatePostbackConversionValue,
  isReferrerSuccess,
  isSKANSuccess,
  parseReferrerParams,
  type ReferrerResult,
  type InstallReferrerDetails,
} from 'react-native-nitro-skan-referrer';

export default function App() {
  const [referrerData, setReferrerData] =
    useState<InstallReferrerDetails | null>(null);
  const [referrerError, setReferrerError] = useState<string | null>(null);
  const [skanStatus, setSkanStatus] = useState('Not initialized');

  const isAndroid = Platform.OS === 'android';
  const isiOS = Platform.OS === 'ios';

  const fetchAndroidReferrer = async () => {
    try {
      const result: ReferrerResult = await getInstallReferrer();

      if (isReferrerSuccess(result)) {
        setReferrerError(null);
        setReferrerData(result.data);

        const params = parseReferrerParams(result.data.installReferrer);

        await sendToBackend({
          platform: 'android',
          installReferrer: result.data.installReferrer,
          clickTime: result.data.referrerClickTimestampSeconds,
          installTime: result.data.installBeginTimestampSeconds,
          utmParams: params,
        });
      } else {
        setReferrerData(null);
        setReferrerError(`${result}: ${result || ''}`);
      }
    } catch (err) {
      setReferrerError(String(err));
    }
  };

  const initializeSKAN = async () => {
    try {
      const result = await registerAppForAdNetworkAttribution();
      setSkanStatus(
        isSKANSuccess(result)
          ? 'Registered successfully'
          : `Registration failed: ${result.error}`
      );
    } catch (err) {
      setSkanStatus(String(err));
    }
  };

  useEffect(() => {
    if (isAndroid) fetchAndroidReferrer();
    if (isiOS) initializeSKAN();
  }, [isAndroid, isiOS]);

  const trackConversionEvent = async (label: string, value: number) => {
    try {
      const result = await updateConversionValue(value);
      setSkanStatus(
        isSKANSuccess(result)
          ? `Tracked: ${label} (${value})`
          : `Error: ${result.error}`
      );
    } catch (err) {
      setSkanStatus(`Error: ${String(err)}`);
    }
  };

  const trackPostbackEvent = async (
    label: string,
    value: number,
    coarse: 'low' | 'medium' | 'high'
  ) => {
    try {
      const result = await updatePostbackConversionValue(value, coarse, false);
      setSkanStatus(
        isSKANSuccess(result)
          ? `Postback: ${label} (${value}, ${coarse})`
          : `Error: ${result.error}`
      );
    } catch (err) {
      setSkanStatus(`Error: ${String(err)}`);
    }
  };

  const sendToBackend = async (payload: any) => {
    try {
      await fetch('https://your-api.com/attribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {}
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        {isAndroid ? 'Android Install Referrer' : 'iOS SKAdNetwork'}
      </Text>

      {isAndroid && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Install Referrer Details</Text>

          {!referrerData && (
            <Text style={styles.errorText}>{referrerError || 'Loading…'}</Text>
          )}

          {referrerData && (
            <View>
              <InfoRow
                label="Install Referrer"
                value={referrerData.installReferrer}
              />
              <InfoRow
                label="Click Time"
                value={new Date(
                  referrerData.referrerClickTimestampSeconds * 1000
                ).toLocaleString()}
              />
              <InfoRow
                label="Install Time"
                value={new Date(
                  referrerData.installBeginTimestampSeconds * 1000
                ).toLocaleString()}
              />
              <InfoRow
                label="Install Version"
                value={referrerData.installVersion}
              />
              <InfoRow
                label="Google Play Instant"
                value={String(referrerData.googlePlayInstantParam)}
              />

              <View style={styles.subSection}>
                <Text style={styles.subTitle}>UTM Parameters</Text>
                {Object.entries(
                  parseReferrerParams(referrerData.installReferrer)
                ).map(([key, val]) => (
                  <Text key={key} style={styles.valueText}>
                    {key}: {val}
                  </Text>
                ))}
              </View>
            </View>
          )}

          <PrimaryButton label="Retry" onPress={fetchAndroidReferrer} />
        </View>
      )}

      {isiOS && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SKAdNetwork Status</Text>
          <Text style={styles.valueText}>{skanStatus}</Text>

          <View style={styles.buttonGroup}>
            <PrimaryButton
              label="App Open (1)"
              onPress={() => trackConversionEvent('App Open', 1)}
            />
            <PrimaryButton
              label="Onboarding (5)"
              onPress={() => trackConversionEvent('Onboarding', 5)}
            />
            <PrimaryButton
              label="Purchase (20)"
              onPress={() => trackConversionEvent('Purchase', 20)}
            />
            <PrimaryButton
              label="High Value (40)"
              onPress={() => trackConversionEvent('High Value', 40)}
            />
            <PrimaryButton
              label="Subscription (63)"
              onPress={() => trackConversionEvent('Subscription', 63)}
            />
          </View>

          <Text style={styles.cardTitle}>Postback Events (iOS 16.1+)</Text>

          <View style={styles.buttonGroup}>
            <PrimaryButton
              label="Postback Low (10)"
              onPress={() => trackPostbackEvent('Low', 10, 'low')}
            />
            <PrimaryButton
              label="Postback Medium (30)"
              onPress={() => trackPostbackEvent('Medium', 30, 'medium')}
            />
            <PrimaryButton
              label="Postback High (50)"
              onPress={() => trackPostbackEvent('High', 50, 'high')}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.labelText}>{label}</Text>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f7f7f7',
    paddingTop: 100,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginVertical: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    marginTop: 20,
  },
  infoRow: {
    marginBottom: 12,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  valueText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  subSection: {
    marginTop: 14,
  },
  subTitle: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 5,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
});
