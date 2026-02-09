import { Screen } from '@/src/components/ui/Screen';
import { Card } from '@/src/components/ui/Card';
import { AppText } from '@/src/components/ui/AppText';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';

export default function ScanScreen() {
  return (
    <Screen>
      <Card>
        <AppText style={{ fontSize: 22, fontWeight: '700' }}>Scan</AppText>
        <AppText style={{ marginVertical: 8 }}>Camera capture + AI parsing hooks start here.</AppText>
        <PrimaryButton label="Open Camera" />
      </Card>
    </Screen>
  );
}
