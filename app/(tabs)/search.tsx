import { Screen } from '@/src/components/ui/Screen';
import { AppText } from '@/src/components/ui/AppText';

export default function SearchScreen() {
  return (
    <Screen>
      <AppText style={{ fontSize: 22, fontWeight: '700' }}>Search</AppText>
      <AppText>Restaurant lookup shell ready.</AppText>
    </Screen>
  );
}
