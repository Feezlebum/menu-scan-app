import { Screen } from '@/src/components/ui/Screen';
import { AppText } from '@/src/components/ui/AppText';

export default function HistoryScreen() {
  return (
    <Screen>
      <AppText style={{ fontSize: 22, fontWeight: '700' }}>History</AppText>
      <AppText>Past scans and saved orders will appear here.</AppText>
    </Screen>
  );
}
