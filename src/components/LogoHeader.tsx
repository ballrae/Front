import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LogoHeaderProps {
  title?: string;
}

const LogoHeader: React.FC<LogoHeaderProps> = ({ title }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <Image
          source={require('../assets/app_logos/ballrae_title_logo.png')}
          style={styles.logo}
        />
        {title && <Text style={styles.title}>{title}</Text>}
      </View>
    </SafeAreaView>
  );
};

export default LogoHeader;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    margin:-2
  },
  wrapper: {
    backgroundColor: '#fff',
   // paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 90,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
     marginBottom: -15,
  },
});