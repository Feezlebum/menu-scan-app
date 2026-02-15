import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/components/ui/AppText';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

export default function SuccessVisionScreen(){
  const theme=useAppTheme(); const router=useRouter();
  const {healthGoalV2,weeklyDiningBudget,completeOnboarding}=useOnboardingStore();

  const finish=(path:'trial'|'freemium')=>{
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeOnboarding();
    router.replace('/(tabs)');
  }

  return <OnboardingScreen title="You're all set!" subtitle="Woohoo! 🎊 Pick how you want to roll — you can always change your mind later!" hideProgress showBack={false} buttonText="Start Free" onContinue={()=>finish('freemium')}>
    <View style={styles.wrap}><Badge step={14} total={14}/>
      <View style={[styles.card,{borderColor:theme.colors.border,backgroundColor:'#fff'}]}>
        <AppText style={[styles.h,{color:theme.colors.text}]}>Projected first-month outcome</AppText>
        <AppText style={{color:theme.colors.subtext,fontSize:13}}>Goal focus: {healthGoalV2 || 'personalized'}</AppText>
        <AppText style={{color:theme.colors.subtext,fontSize:13}}>Weekly budget target: ${weeklyDiningBudget?.toFixed(0) || '100'}</AppText>
      </View>
      <TouchableOpacity style={[styles.cta,{backgroundColor:theme.colors.brand}]} onPress={()=>finish('trial')}><AppText style={styles.ctaText}>Start Free Trial</AppText></TouchableOpacity>
      <TouchableOpacity style={[styles.cta,{borderColor:theme.colors.border,borderWidth:1,backgroundColor:'#fff'}]} onPress={()=>finish('freemium')}><AppText style={[styles.ctaText,{color:theme.colors.text}]}>Start Free</AppText></TouchableOpacity>
    </View>
  </OnboardingScreen>
}

function Badge({step,total}:{step:number;total:number}){const t=useAppTheme();return <View style={[styles.badge,{borderColor:t.colors.border}]}><AppText style={{color:t.colors.subtext,fontSize:12}}>Step {step}/{total}</AppText></View>}
const styles=StyleSheet.create({wrap:{gap:10},badge:{borderWidth:1,borderRadius:10,padding:8},card:{borderWidth:1,borderRadius:12,padding:12,gap:4},h:{fontSize:15,fontWeight:'700'},cta:{borderRadius:12,paddingVertical:14,alignItems:'center'},ctaText:{color:'#fff',fontSize:15,fontWeight:'700'}});
