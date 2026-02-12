import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { useAppTheme } from '@/src/theme/theme';
import { MacroPriority, useOnboardingStore } from '@/src/stores/onboardingStore';

const cuisines=['Italian','Mexican','Japanese','Indian','Thai','American'];
const dislikes=['mushrooms','seafood','spicy food','onions','olives'];
const macros: MacroPriority[]=['highprotein','balanced','lowcarb','lowcal'];

export default function FoodPreferencesScreen(){
 const router=useRouter(); const theme=useAppTheme();
 const {favoriteCuisines,toggleCuisine,dislikes:selDislikes,toggleDislike,macroPriority,setMacroPriority}=useOnboardingStore();
 return <OnboardingScreen title="Food Preferences & Dislikes" subtitle="Choose cuisines, dislikes, and macro focus." hideProgress onContinue={()=>router.push('/onboarding/dining-habits' as any)}>
  <View style={styles.wrap}><Badge step={11} total={14}/>
    <AppText style={[styles.label,{color:theme.colors.subtext}]}>Favorite cuisines</AppText>
    <View style={styles.row}>{cuisines.map(c=><Chip key={c} text={c} active={favoriteCuisines.includes(c)} onPress={()=>toggleCuisine(c)} />)}</View>
    <AppText style={[styles.label,{color:theme.colors.subtext}]}>Dislikes</AppText>
    <View style={styles.row}>{dislikes.map(d=><Chip key={d} text={d} active={selDislikes.includes(d)} onPress={()=>toggleDislike(d)} />)}</View>
    <AppText style={[styles.label,{color:theme.colors.subtext}]}>Macro priority</AppText>
    <View style={styles.row}>{macros.map(m=><Chip key={m} text={m} active={macroPriority===m} onPress={()=>setMacroPriority(m)} />)}</View>
  </View>
 </OnboardingScreen>
}

function Chip({text,active,onPress}:{text:string;active:boolean;onPress:()=>void}){const t=useAppTheme();return <TouchableOpacity onPress={onPress} style={[styles.chip,{borderColor:t.colors.border},active&&{borderColor:t.colors.brand,backgroundColor:t.colors.brand+'14'}]}><AppText style={{color:t.colors.text,fontSize:12}}>{text}</AppText></TouchableOpacity>}
function Badge({step,total}:{step:number;total:number}){const t=useAppTheme();return <View style={[styles.badge,{borderColor:t.colors.border}]}><AppText style={{color:t.colors.subtext,fontSize:12}}>Step {step}/{total}</AppText></View>}
const styles=StyleSheet.create({wrap:{gap:10},badge:{borderWidth:1,borderRadius:10,padding:8},label:{fontSize:12},row:{flexDirection:'row',flexWrap:'wrap',gap:8},chip:{borderWidth:1,borderRadius:10,paddingHorizontal:10,paddingVertical:8}});
