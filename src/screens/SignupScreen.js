import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignUpScreen() {
  const navigation = useNavigation();
  const auth = getAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Sign Up Failed', error.message);
    }
  };

  return (
    <View style={{ height: '100%', width: '100%' }}>
      <ImageBackground
        source={require('../assets/sports-bg.jpg')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: 24, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: 'rgba(255,255,255,0.95)', padding: 32, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}>
            <Text style={{ fontSize: 36, fontWeight: '800', color: '#16a34a', marginBottom: 24, textAlign: 'center' }}>
              🏈 Join KnowBall!
            </Text>
            
            <Text style={{ fontSize: 18, color: '#4b5563', marginBottom: 32, textAlign: 'center' }}>
              Create an account to start competing with friends!
            </Text>

            <TextInput
              placeholder="Email"
              placeholderTextColor="#6b7280"
              style={{ width: '100%', padding: 16, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.8)', color: '#000' }}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="#6b7280"
              style={{ width: '100%', padding: 16, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.8)', color: '#000' }}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#6b7280"
              style={{ width: '100%', padding: 16, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 24, backgroundColor: 'rgba(255,255,255,0.8)', color: '#000' }}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={{ width: '100%', backgroundColor: '#16a34a', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 }}
              onPress={handleSignUp}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18, textAlign: 'center' }}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 24 }}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={{ color: '#16a34a', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>
                Already have an account? <Text style={{ fontWeight: '700' }}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
