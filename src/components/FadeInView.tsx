import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

const OneTimeFadeInView = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hasAnimated) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setHasAnimated(true));
    }
  }, [hasAnimated]);

  if (hasAnimated) {
    return <View style={[{ flex: 1 }, style]}>{children}</View>;
  }

  return <Animated.View style={[{ flex: 1, opacity: fadeAnim }, style]}>{children}</Animated.View>;
};

export default OneTimeFadeInView;