import { Screen } from '@/src/components/ui/Screen';
import { AppText } from '@/src/components/ui/AppText';

export default function ProfileScreen() {
  return (
    <Screen>
      <AppText style={{ fontSize: 22, fontWeight: '700' }}>Profile</AppText>
      <AppText>Diet preferences and subscription settings.</AppText>
    </Screen>
  );
}
