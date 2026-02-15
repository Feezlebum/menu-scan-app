import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { useAppTheme } from '@/src/theme/theme';
import { DietType, useOnboardingStore } from '@/src/stores/onboardingStore';

const diets: DietType[] = ['none', 'vegan', 'keto', 'lowcarb', 'mediterranean', 'cico'];
const intolerances = ['nuts','dairy','shellfish','eggs','soy','gluten'];

export default function DietaryPreferencesScreen(){
  const router=useRouter(); const theme=useAppTheme();
  const {dietType,intolerances:sel,toggleIntolerance,setDietType}=useOnboardingStore();
  return <OnboardingScreen title="Your food profile" subtitle="Tell me about your diet and any allergies — I'll remember everything! 📋" hideProgress onContinue={()=>router.push('/onboarding/food-preferences' as any)}>
    <View style={styles.wrap}><Badge step={10} total={14} />
      <AppText style={[styles.label,{color:theme.colors.subtext}]}>Diet Type</AppText>
      <View style={styles.row}>{diets.map(d=><Chip key={d} text={d} active={dietType===d} onPress={()=>setDietType(d)} />)}</View>
      <AppText style={[styles.label,{color:theme.colors.subtext}]}>Intolerances / Allergies</AppText>
      <View style={styles.row}>{intolerances.map(i=><Chip key={i} text={i} active={sel.includes(i)} onPress={()=>toggleIntolerance(i)} />)}</View>
    </View>
  </OnboardingScreen>
}

function Chip({text,active,onPress}:{text:string;active:boolean;onPress:()=>void}){const t=useAppTheme();return <TouchableOpacity onPress={onPress} style={[styles.chip,{borderColor:t.colors.border},active&&{borderColor:t.colors.brand,backgroundColor:t.colors.brand+'14'}]}><AppText style={{color:t.colors.text,fontSize:12}}>{text}</AppText></TouchableOpacity>}
function Badge({step,total}:{step:number;total:number}){const t=useAppTheme();return <View style={[styles.badge,{borderColor:t.colors.border}]}><AppText style={{color:t.colors.subtext,fontSize:12}}>Step {step}/{total}</AppText></View>}
const styles=StyleSheet.create({wrap:{gap:10},badge:{borderWidth:1,borderRadius:10,padding:8},label:{fontSize:12},row:{flexDirection:'row',flexWrap:'wrap',gap:8},chip:{borderWidth:1,borderRadius:10,paddingHorizontal:10,paddingVertical:8}});
