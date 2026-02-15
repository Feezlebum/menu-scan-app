import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { useAppTheme } from '@/src/theme/theme';
import { DiningChallenge, EatingFrequency, useOnboardingStore } from '@/src/stores/onboardingStore';

const freqs: EatingFrequency[]=['1-2x','3-4x','5+'];
const challenges: DiningChallenge[]=['calories','social','willpower','overwhelm'];

export default function DiningHabitsScreen(){
 const router=useRouter(); const theme=useAppTheme();
 const {eatingFrequency,setEatingFrequency,diningChallenge,setDiningChallenge}=useOnboardingStore();
 return <OnboardingScreen title="Dining habits" subtitle="How often do you eat out, and what usually trips you up? 🍽️" hideProgress canContinue={!!eatingFrequency&&!!diningChallenge} onContinue={()=>router.push('/onboarding/account-creation' as any)}>
  <View style={styles.wrap}><Badge step={12} total={14}/>
    <AppText style={[styles.label,{color:theme.colors.subtext}]}>Dining frequency</AppText>
    <View style={styles.row}>{freqs.map(f=><Chip key={f} text={f} active={eatingFrequency===f} onPress={()=>setEatingFrequency(f)} />)}</View>
    <AppText style={[styles.label,{color:theme.colors.subtext}]}>Biggest challenge</AppText>
    <View style={styles.row}>{challenges.map(c=><Chip key={c} text={c} active={diningChallenge===c} onPress={()=>setDiningChallenge(c)} />)}</View>
  </View>
 </OnboardingScreen>
}

function Chip({text,active,onPress}:{text:string;active:boolean;onPress:()=>void}){const t=useAppTheme();return <TouchableOpacity onPress={onPress} style={[styles.chip,{borderColor:t.colors.border},active&&{borderColor:t.colors.brand,backgroundColor:t.colors.brand+'14'}]}><AppText style={{color:t.colors.text,fontSize:12}}>{text}</AppText></TouchableOpacity>}
function Badge({step,total}:{step:number;total:number}){const t=useAppTheme();return <View style={[styles.badge,{borderColor:t.colors.border}]}><AppText style={{color:t.colors.subtext,fontSize:12}}>Step {step}/{total}</AppText></View>}
const styles=StyleSheet.create({wrap:{gap:10},badge:{borderWidth:1,borderRadius:10,padding:8},label:{fontSize:12},row:{flexDirection:'row',flexWrap:'wrap',gap:8},chip:{borderWidth:1,borderRadius:10,paddingHorizontal:10,paddingVertical:8}});
