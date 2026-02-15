import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { ActivityLevel, Gender, useOnboardingStore } from '@/src/stores/onboardingStore';

const genders: Gender[] = ['male', 'female', 'other'];
const activities: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'very_active'];

export default function TellAboutYouScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { age, gender, activityLevel, heightCm, currentWeightKg, setAge, setGender, setActivityLevel, setHeight, setCurrentWeight } = useOnboardingStore();
  const [ageInput, setAgeInput] = useState(age ? String(age) : '');
  const [heightInput, setHeightInput] = useState(heightCm ? String(heightCm) : '');
  const [weightInput, setWeightInput] = useState(currentWeightKg ? String(currentWeightKg) : '');

  const canContinue = !!ageInput && !!heightInput && !!weightInput && !!gender && !!activityLevel;

  return (
    <OnboardingScreen title="Tell me about you!" subtitle="These details help me personalize your nutrition scores and goals~ ✨" hideProgress canContinue={canContinue} onContinue={() => {
      setAge(Math.max(12, Math.min(100, Number(ageInput) || 25)));
      setHeight(Math.max(120, Math.min(230, Number(heightInput) || 170)));
      setCurrentWeight(Math.max(30, Math.min(300, Number(weightInput) || 70)));
      router.push('/onboarding/dietary-preferences' as any);
    }}>
      <View style={styles.wrap}>
        <Badge step={9} total={14} />
        <Field label="Age"><TextInput value={ageInput} onChangeText={(t)=>setAgeInput(t.replace(/[^0-9]/g,''))} keyboardType="number-pad" style={[styles.input,{borderColor:theme.colors.border,color:theme.colors.text}]} /></Field>
        <Field label="Height (cm)"><TextInput value={heightInput} onChangeText={(t)=>setHeightInput(t.replace(/[^0-9.]/g,''))} keyboardType="decimal-pad" style={[styles.input,{borderColor:theme.colors.border,color:theme.colors.text}]} /></Field>
        <Field label="Current Weight (kg)"><TextInput value={weightInput} onChangeText={(t)=>setWeightInput(t.replace(/[^0-9.]/g,''))} keyboardType="decimal-pad" style={[styles.input,{borderColor:theme.colors.border,color:theme.colors.text}]} /></Field>
        <Field label="Gender">
          <View style={styles.row}>{genders.map(g=><Chip key={g} text={g} active={gender===g} onPress={()=>setGender(g)} />)}</View>
        </Field>
        <Field label="Activity">
          <View style={styles.row}>{activities.map(a=><Chip key={a} text={a.replace('_',' ')} active={activityLevel===a} onPress={()=>setActivityLevel(a)} />)}</View>
        </Field>
      </View>
    </OnboardingScreen>
  );
}

function Field({label,children}:{label:string;children:React.ReactNode}){ const t=useAppTheme(); return <View><AppText style={{color:t.colors.subtext,fontSize:12,marginBottom:6}}>{label}</AppText>{children}</View>; }
function Chip({text,active,onPress}:{text:string;active:boolean;onPress:()=>void}){ const t=useAppTheme(); return <TouchableOpacity onPress={onPress} style={[styles.chip,{borderColor:t.colors.border},active&&{borderColor:t.colors.brand,backgroundColor:t.colors.brand+'14'}]}><AppText style={{color:t.colors.text,fontSize:12}}>{text}</AppText></TouchableOpacity>; }
function Badge({step,total}:{step:number;total:number}){ const t=useAppTheme(); return <View style={[styles.badge,{borderColor:t.colors.border}]}><AppText style={{color:t.colors.subtext,fontSize:12}}>Step {step}/{total}</AppText></View>; }

const styles=StyleSheet.create({wrap:{gap:10},badge:{borderWidth:1,borderRadius:10,padding:8},input:{borderWidth:1,borderRadius:10,paddingHorizontal:10,height:44},row:{flexDirection:'row',flexWrap:'wrap',gap:8},chip:{borderWidth:1,borderRadius:10,paddingHorizontal:10,paddingVertical:8}});
