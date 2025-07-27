import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  Platform,
  Animated,
  Pressable,
  TouchableWithoutFeedback,
  useColorScheme,
  Appearance,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  amount: number;
  onClose?: () => void;
}

const CelebrationOverlay: React.FC<Props> = ({ visible, amount, onClose }) => {

  // console.log('CelebrationOverlay ', visible);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const colors = {
    backdrop: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.6)',
    containerBackground: isDarkMode ? '#2C2C2C' : '#ffffff',
    containerBorder: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    congratulationsText: '#FFD700',
    messageText: isDarkMode ? '#E0E0E0' : '#6B7280',
    amountText: '#00B9F5',
    closeIcon: isDarkMode ? '#B0B0B0' : '#888',
  };

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 90,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim]);

  // Amount formatting function
  const formatAmount = (value: number) => {
    if (Number.isInteger(value)) {
      return value.toString(); // If it's a whole number, display as integer
    } else {
      // If it has decimals, format it to a reasonable number of decimal places
      // We can use toFixed(2) if we always want two decimals for non-integers
      // Or toPrecision/toLocalString for more dynamic decimal handling
      // For your case, "10.3 then okay" suggests just showing significant decimals.
      // Math.round(value * 100) / 100 ensures two decimals at most, and avoids float issues
      return value.toFixed(2); // This will show 10.30 but 10.3 is also fine.
                               // If you want strictly '10.3' for 10.3,
                               // and '10.34' for 10.34, then simply value.toString()
                               // might work for basic cases, but for currency it's often fixed.

      // Let's refine based on "10.3 then okay but without .00"
      // This means 10.3 should be 10.3, 10.0 should be 10.
      // A simple toString() will work for this if it's already a float.
      // But to ensure max 2 decimals AND avoid trailing zeros,
      // parseFloat is often combined with toFixed, then regex to trim.

      const formatted = value.toFixed(2); // e.g., "10.30", "100.00", "10.34"
      if (formatted.endsWith('.00')) {
        return Math.floor(value).toString(); // Convert 100.00 to 100
      } else {
        return formatted; // Keep 10.30 or 10.34
      }
    }
  };


  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, { backgroundColor: colors.backdrop }]}>
          <TouchableWithoutFeedback>{/* prevent inner touch from closing */}
            <Animated.View
              style={[
                styles.container,
                {
                  backgroundColor: colors.containerBackground,
                  borderColor: colors.containerBorder,
                  transform: [{ scale: scaleAnim }],
                  ...Platform.select({
                    ios: {
                      shadowColor: isDarkMode ? '#000' : '#000',
                      shadowOpacity: isDarkMode ? 0.5 : 0.2,
                      shadowOffset: { width: 0, height: 8 },
                      shadowRadius: 15,
                    },
                    android: {
                      elevation: 15,
                    },
                  }),
                },
              ]}
            >
              {onClose && (
                <Pressable
                  style={styles.closeIcon}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close-circle-outline" size={30} color={colors.closeIcon} />
                </Pressable>
              )}

              <Text style={styles.emoji}>🎉</Text>
              <Text style={[styles.title, { color: colors.congratulationsText }]}>Congratulations!</Text>
              <Text style={[styles.message, { color: colors.messageText }]}>You've won a scratch card worth</Text>
              <Text style={[styles.amount, { color: colors.amountText }]}>₹{formatAmount(amount)}</Text>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.88,
    maxWidth: 400,
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  emoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  message: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  amount: {
    fontSize: 42,
    fontWeight: '900',
    marginTop: 15,
  },
  closeIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
});

export default CelebrationOverlay;