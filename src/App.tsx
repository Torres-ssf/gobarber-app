import React from 'react';
import { View, StatusBar, Text } from 'react-native';

const App: React.FC = () => (
  <>
    <StatusBar barStyle="light-content" backgroundColor="#312e38" />
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#312e38',
      }}
    >
      <Text style={{ color: '#fff', fontSize: 20 }}>Hello World!</Text>
    </View>
  </>
);

export default App;
