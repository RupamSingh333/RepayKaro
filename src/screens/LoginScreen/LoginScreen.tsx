import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Animated,
  Easing,
  Image,
  Dimensions,
  Appearance, // Import Appearance
} from 'react-native';

import { apiPost } from '../../api/Api'; // Assuming apiPost handles API calls

const { height } = Dimensions.get('window');

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mobileNumber: '8538945025',
      loading: false,
      scaleValue: new Animated.Value(1),
      theme: Appearance.getColorScheme(), // Initialize theme from system
    };
    this.themeListener = null; // To store the theme listener
  }

  componentDidMount() {
    this.animateLogo();
    // Add event listener for theme changes
    this.themeListener = Appearance.addChangeListener(({ colorScheme }) => {
      this.setState({ theme: colorScheme });
    });
  }

  componentWillUnmount() {
    // Remove the event listener when the component unmounts
    if (this.themeListener) {
      this.themeListener.remove();
    }
  }

  animateLogo = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.scaleValue, {
          toValue: 1.08,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(this.state.scaleValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  handleSendOTP = async () => {
    const { mobileNumber } = this.state;

    if (!/^\d{10}$/.test(mobileNumber)) {
      this.props.toastRef.current.show('Enter a valid 10-digit mobile number', 2000);
      return;
    }

    this.setState({ loading: true });

    try {
      const json = await apiPost('clientAuth/login', { phone: mobileNumber });

      if (json.success) {
        this.props.toastRef.current.show('OTP sent successfully!', 2000);
        this.props.navigation.navigate('OTP', { mobile: mobileNumber });
      } else {
        this.props.toastRef.current.show(json.message || 'Something went wrong!', 2000);
      }
    } catch (error) {
      console.error(error);
      this.props.toastRef.current.show('Network error!', 2000);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { mobileNumber, loading, scaleValue, theme } = this.state;
    const isValid = /^\d{10}$/.test(mobileNumber);
    const isDark = theme === 'dark';

    // Define color variables based on the theme
    const primaryBrandColor = isDark ? '#5e3cbe' : '#8b5cf6'; // Darker purple for dark mode
    const topSectionTextColor = isDark ? '#E5E7EB' : '#fff'; // White/light gray for top section text
    const formCardBgColor = isDark ? '#2D3748' : '#FFFFFF';
    const textColor = isDark ? '#E5E7EB' : '#111'; // Main text color
    const subColor = isDark ? '#9CA3AF' : '#555'; // Secondary text color
    const inputBorderColor = isDark ? '#4B5563' : '#ddd';
    const inputBgColor = isDark ? '#374151' : '#fff';
    const inputTextColor = isDark ? '#E5E7EB' : '#111';
    const placeholderTextColor = isDark ? '#9CA3AF' : '#aaa';
    const logoBgColor = isDark ? '#374151' : '#fff'; // Logo background color

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.safeArea, { backgroundColor: primaryBrandColor }]}
      >
        <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} backgroundColor={primaryBrandColor} />
        <View style={[styles.container, { backgroundColor: primaryBrandColor }]}>
          {/* Logo + App Name */}
          <View style={styles.topSection}>
            <Animated.Image
              source={require('../../assets/appIcon/rpkk.png')}
              style={[styles.logo, { transform: [{ scale: scaleValue }], backgroundColor: logoBgColor }]}
              resizeMode="contain"
            />
            <Text style={[styles.appName, { color: topSectionTextColor }]}>RepayKaro</Text>
            <Text style={[styles.tagline, { color: topSectionTextColor }]}>Manage Your Finances with Ease!</Text>
          </View>

          {/* Form Section */}
          <View style={[styles.formCard, { backgroundColor: formCardBgColor }]}>
            <Text style={[styles.welcome, { color: textColor }]}>Welcome Back 👋</Text>
            <Text style={[styles.instruction, { color: subColor }]}>
              Enter your mobile number to receive OTP
            </Text>

            <Text style={[styles.formLabel, { color: textColor }]}>
              Mobile Number <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: inputBorderColor,
                  backgroundColor: inputBgColor,
                  color: inputTextColor,
                },
              ]}
              placeholder="Enter your mobile number"
              placeholderTextColor={placeholderTextColor}
              keyboardType="number-pad"
              maxLength={10}
              value={mobileNumber}
              onChangeText={(text) =>
                this.setState({ mobileNumber: text.replace(/[^0-9]/g, '') })
              }
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: primaryBrandColor }, (!isValid || loading) && { opacity: 0.5 }]}
              onPress={this.handleSendOTP}
              disabled={!isValid || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  topSection: {
    alignItems: 'center',
    marginTop: 70,
    flex: 1, // Allow this section to take available space
    justifyContent: 'center', // Center content vertically
    paddingBottom: 40, // Add some padding bottom to push card up slightly
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginBottom: 10,
  },
  appName: {
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 10,
  },
  tagline: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    // flex: 1, // This caused the card to take all remaining space, making it too tall.
    // Instead, rely on content height and push to bottom
    minHeight: height * 0.6, // Ensure it's at least half the screen height
    paddingBottom: 50, // More padding for bottom to ensure content isn't cut off by keyboard
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  instruction: {
    fontSize: 15,
    marginBottom: 25,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});