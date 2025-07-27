import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Pressable,
  Easing,
  useColorScheme,
  ToastAndroid,
  Platform,
  Linking,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 0.7;

const COLORS = {
  lightBg: '#F8FAFC',
  darkBg: '#18181B',
  cardLight: '#FFFFFF',
  cardDark: '#27272A',
  primaryAccentLight: '#00B9F5',
  primaryAccentDark: '#67E8F9',
  secondaryAccentLight: '#FFD700',
  secondaryAccentDark: '#FACC15',
  textLight: '#1F2937',
  textDark: '#F3F4F6',
  mutedTextLight: '#6B7280',
  mutedTextDark: '#A1A1AA',
  scratchSilverLight: '#BCC4CC',
  scratchShineLight: '#E6EBF0',
  scratchSilverDark: '#4B5563',
  scratchShineDark: '#6B7280',
  shadowLight: 'rgba(0,0,0,0.15)',
  shadowDark: 'rgba(0,0,0,0.45)',
  badgeBgLight: '#E0F7FF',
  badgeBgDark: '#3F3F46',
};

interface Props {
  item: {
    _id: string;
    amount: { $numberDecimal: string };
    coupon_code: string;
    validity: number;
    scratched: number;
    updatedAt?: string; // ✅ Add this
    createdAt?: string;
  };
  onScratchComplete: () => void;
  isDark?: boolean;
}

const ScratchCard: React.FC<Props> = ({ item, onScratchComplete, isDark }) => {
  const theme = useColorScheme();
  const isDarkMode = isDark ?? theme === 'dark';

  const [scratched, setScratched] = useState(item.scratched === 1);
  const [scratchPercent, setScratchPercent] = useState(0);

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(scratched ? 0 : 1)).current;

  const confettiParticles = useRef(
    Array.from({ length: 18 }, () => new Animated.Value(0))
  ).current;

  const isRevealing = useRef(false); // ✅ Lock to prevent multiple API calls

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: () => {
      if (scratched || isRevealing.current) return; // ✅ Prevent re-entry

      const percent = Math.min(scratchPercent + 5, 100);
      setScratchPercent(percent);

      if (percent >= 70 && !isRevealing.current) {
        isRevealing.current = true; // ✅ Lock the scratch trigger
        revealCard();
      }
    },
  });

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 40,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (item.scratched === 1) triggerConfetti();
  }, [item.scratched]);

  const revealCard = () => {
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      onScratchComplete?.();       // 🚀 Trigger backend + celebration
      triggerConfetti();
      setScratched(true);          // ✅ Update scratch state to render reward view
    });
  };

  const triggerConfetti = () => {
    confettiParticles.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 900 + i * 50,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start(() => anim.setValue(0));
    });
  };

  const handleCopy = () => {
    if (item.coupon_code) {
      Clipboard.setString(item.coupon_code);
      Platform.OS === 'android' &&
        ToastAndroid.show('Coupon Copied!', ToastAndroid.SHORT);
    }
  };

  const handleRedeem = () => {
    Linking.openURL('https://repaykaro.rewardzpromo.com').catch(console.error);
  };

  const confettiStyles = confettiParticles.map((anim, i) => {
    const angle = (i * 360) / confettiParticles.length;
    const dx = Math.cos((angle * Math.PI) / 180) * (CARD_WIDTH * 0.4 + Math.random() * 50);
    const dy = Math.sin((angle * Math.PI) / 180) * (CARD_HEIGHT * 0.4 + Math.random() * 50);

    return {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: [
        { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, dx - CARD_WIDTH / 2] }) },
        { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, dy - CARD_HEIGHT / 2] }) },
        { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.5] }) },
        { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${Math.random() * 720}deg`] }) },
      ],
      opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
      color: i % 2 === 0
        ? (isDarkMode ? COLORS.secondaryAccentDark : COLORS.secondaryAccentLight)
        : (isDarkMode ? COLORS.primaryAccentDark : COLORS.primaryAccentLight),
    };
  });

  const cardBg = isDarkMode ? COLORS.cardDark : COLORS.cardLight;
  const shadowColor = isDarkMode ? COLORS.shadowDark : COLORS.shadowLight;
  const textColor = isDarkMode ? COLORS.textDark : COLORS.textLight;
  const accent = isDarkMode ? COLORS.primaryAccentDark : COLORS.primaryAccentLight;
  const muted = isDarkMode ? COLORS.mutedTextDark : COLORS.mutedTextLight;
  const badgeBg = isDarkMode ? COLORS.badgeBgDark : COLORS.badgeBgLight;

  return (
    <Animated.View style={[styles.card, { backgroundColor: cardBg, shadowColor, transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>
      {confettiStyles.map((s, i) => (
        <Animated.Text key={i} style={[s, styles.emoji]}>🎉</Animated.Text>
      ))}

      {!scratched && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} {...panResponder.panHandlers}>
          <Svg width={CARD_WIDTH} height={CARD_HEIGHT} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={isDarkMode ? COLORS.scratchShineDark : COLORS.scratchShineLight} />
                <Stop offset="50%" stopColor={isDarkMode ? COLORS.scratchSilverDark : COLORS.scratchSilverLight} />
                <Stop offset="100%" stopColor={isDarkMode ? '#374151' : '#9CA3AF'} />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT} fill="url(#silver)" rx={18} ry={18} opacity={1 - Math.min(scratchPercent / 70, 1)} />
          </Svg>
          <View style={styles.scratchTextWrap}>
            <Icon name="gesture-tap" size={28} color={textColor} />
            <Text style={[styles.scratchText, { color: textColor }]}>Scratch to Reveal</Text>
          </View>
        </Animated.View>
      )}

      {scratched && (
        <View style={styles.cardContent}>
          <Text style={[styles.amount, { color: accent }]}>
            ₹{item.amount?.$numberDecimal || '0.00'}
          </Text>

          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: accent }]}>Reward Unlocked!</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.redeemBtn,
              { backgroundColor: accent, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleRedeem}
          >
            <Text style={styles.redeemText}>Redeem Now</Text>
          </Pressable>

          <View style={styles.codeWrap}>
            <Text style={[styles.code, { color: muted }]}>
              Code: {item.coupon_code}
            </Text>
            <Pressable onPress={handleCopy} style={styles.copyBtn}>
              <Icon name="content-copy" size={18} color={accent} />
              <Text style={[styles.copyText, { color: accent }]}>Copy</Text>
            </Pressable>
          </View>

          <Text style={[styles.validity, { color: muted }]}>
            Valid for {item.validity || 10} days
          </Text>

          {item.updatedAt && (
            <Text style={[styles.scratchedOn, { color: muted }]}>
              Scratched on:{' '}
              {new Date(item.updatedAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          )}
        </View>
      )}

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    margin: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scratchTextWrap: {
    alignItems: 'center',
  },
  scratchText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  cardContent: {
    alignItems: 'center',
    gap: 8,
  },
  scratchedOn: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  amount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  badge: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  redeemBtn: {
    marginTop: 12,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  redeemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  codeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  code: {
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  copyText: {
    fontSize: 14,
    fontWeight: '700',
  },
  validity: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
  },
  emoji: {
    fontSize: 24,
  },
});

export default ScratchCard;
