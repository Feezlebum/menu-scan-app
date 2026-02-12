import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { signUp } from '@/src/lib/auth';

export default function AccountCreationScreen(){
 const theme=useAppTheme(); const router=useRouter();
 const {firstName,email,password,setFirstName,setEmail,setPassword}=useOnboardingStore();
 const [name,setName]=useState(firstName); const [mail,setMail]=useState(email); const [pass,setPass]=useState(password);
 const [loading,setLoading]=useState(false);
 const canContinue = name.trim().length>1 && /@/.test(mail) && pass.length>=6;

 const handleCreateAccount = async () => {
   if (loading) return false;

   setLoading(true);
   const result = await signUp(mail.trim(), pass, name.trim());
   setLoading(false);

   if (result.success) {
     setFirstName(name.trim());
     setEmail(mail.trim());
     setPassword(pass);
     router.push('/onboarding/success-vision' as any);
     return true;
   }

   Alert.alert('Account Creation Failed', result.error || 'Please try again');
   return false;
 };

 return <OnboardingScreen title="Account Creation" subtitle="Create your account to save progress and sync recommendations." hideProgress canContinue={canContinue && !loading} onContinue={handleCreateAccount} buttonText={loading ? 'Creating account...' : 'Continue'}>
   <View style={styles.wrap}><Badge step={13} total={14}/>
     <Field label="First name"><TextInput value={name} onChangeText={setName} style={[styles.input,{borderColor:theme.colors.border,color:theme.colors.text}]} editable={!loading} /></Field>
     <Field label="Email"><TextInput value={mail} onChangeText={setMail} autoCapitalize="none" keyboardType="email-address" style={[styles.input,{borderColor:theme.colors.border,color:theme.colors.text}]} editable={!loading} /></Field>
     <Field label="Password"><TextInput value={pass} onChangeText={setPass} secureTextEntry style={[styles.input,{borderColor:theme.colors.border,color:theme.colors.text}]} editable={!loading} /></Field>
     {loading ? <View style={styles.loading}><ActivityIndicator color={theme.colors.brand} /><AppText style={{color:theme.colors.subtext,fontSize:13}}>Creating account...</AppText></View> : null}
   </View>
 </OnboardingScreen>
}

function Field({label,children}:{label:string;children:React.ReactNode}){const t=useAppTheme();return <View><AppText style={{color:t.colors.subtext,fontSize:12,marginBottom:6}}>{label}</AppText>{children}</View>}
function Badge({step,total}:{step:number;total:number}){const t=useAppTheme();return <View style={[styles.badge,{borderColor:t.colors.border}]}><AppText style={{color:t.colors.subtext,fontSize:12}}>Step {step}/{total}</AppText></View>}
const styles=StyleSheet.create({
 wrap:{gap:10},
 badge:{borderWidth:1,borderRadius:10,padding:8},
 input:{borderWidth:1,borderRadius:10,paddingHorizontal:10,height:44},
 loading:{flexDirection:'row',alignItems:'center',gap:8,marginTop:8}
});
