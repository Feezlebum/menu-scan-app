import { Card } from '@/src/components/ui/Card';
import { Screen } from '@/src/components/ui/Screen';
import { AppText } from '@/src/components/ui/AppText';

export default function HomeScreen() {
  return (
    <Screen>
      <Card>
        <AppText style={{ fontSize: 24, fontWeight: '700' }}>Menu Scan</AppText>
        <AppText style={{ marginTop: 8 }}>Foundation is live. Next up: onboarding + scan pipeline.</AppText>
      </Card>
    </Screen>
  );
}
