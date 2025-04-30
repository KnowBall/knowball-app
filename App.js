import { View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <View style={{ height: '100vh', width: '100vw' }}>
      <AppNavigator />
    </View>
  );
}
