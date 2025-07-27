import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput, // Although OTPInputView replaces direct TextInput, good to keep if needed
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Appearance, // Import Appearance
  StatusBar, // For status bar color
} from 'react-native';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import { apiPost } from '../../api/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class OTPScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      otp: '',
      resendTimer: 48,
      loading: false,
      theme: Appearance.getColorScheme(), // Initialize theme from system
    };
    this.timer = null;
    this.themeListener = null; // To store the theme listener
  }

  componentDidMount() {
    this.startResendTimer();
    // Add event listener for theme changes
    this.themeListener = Appearance.addChangeListener(({ colorScheme }) => {
      this.setState({ theme: colorScheme });
    });
  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
    // Remove the event listener when the component unmounts
    if (this.themeListener) {
      this.themeListener.remove();
    }
  }

  startResendTimer = () => {
    if (this.timer) clearInterval(this.timer);

    this.setState({ resendTimer: 48 });

    this.timer = setInterval(() => {
      this.setState((prev) => {
        if (prev.resendTimer > 1) {
          return { resendTimer: prev.resendTimer - 1 };
        } else {
          clearInterval(this.timer);
          return { resendTimer: 0 };
        }
      });
    }, 1000);
  };

  handleVerifyOTP = async () => {
    const { otp } = this.state;
    const mobile = this.props.route?.params?.mobile || '';

    if (otp.length !== 4) {
      this.props.toastRef?.current?.show('Please enter a valid 4-digit OTP', 2000);
      return;
    }

    this.setState({ loading: true });

    try {
      const json = await apiPost('clientAuth/validate-otp', {
        phone: mobile,
        otp: otp,
      });

      if (json.success && json.jwtToken) {
        await AsyncStorage.setItem('liveCustomerToken', json.jwtToken);
        await AsyncStorage.setItem('customerName', json.name || '');
        await AsyncStorage.setItem('customerPhone', mobile);

        this.props.toastRef?.current?.show('OTP Verified! Redirecting...', 1500);
        this.props.onLoginSuccess();
      } else {
        this.props.toastRef?.current?.show(json.message || 'Invalid OTP!', 2000);
      }
    } catch (error) {
      this.props.toastRef?.current?.show('Network error!', 2000);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleResendOTP = async () => {
    const mobile = this.props.route?.params?.mobile || '';
    if (!mobile) return; // Should not happen if coming from LoginScreen

    this.setState({ loading: true });
    try {
      const json = await apiPost('clientAuth/login', { phone: mobile });
      if (json.success) {
        this.props.toastRef.current.show('OTP re-sent successfully!', 2000);
        this.startResendTimer(); // Restart the timer
      } else {
        this.props.toastRef.current.show(json.message || 'Failed to re-send OTP.', 2000);
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      this.props.toastRef.current.show('Network error during re-send!', 2000);
    } finally {
      this.setState({ loading: false });
    }
  };


  handleChangeNumber = () => {
    this.props.navigation.navigate('Login');
  };

  render() {
    const { resendTimer, loading, theme } = this.state;
    const mobile = this.props.route?.params?.mobile || 'XXXXXXXXXX';
    const isDark = theme === 'dark';

    // Define color variables based on the theme
    const bgColor = isDark ? '#1F2937' : '#F4F7FC'; // Main background
    const textColor = isDark ? '#E5E7EB' : '#1F2937'; // General text color
    const subColor = isDark ? '#9CA3AF' : '#4B5563'; // Subheading, info text
    const primaryAccentColor = '#7B5CFA'; // Button, active OTP border, resend link
    const otpInputBg = isDark ? '#374151' : '#FFFFFF';
    const otpInputBorder = isDark ? '#4B5563' : '#ddd';
    const otpInputActiveBorder = primaryAccentColor; // Active border color
    const otpInputTextColor = isDark ? '#E5E7EB' : '#1F2937';
    const disabledButtonBg = isDark ? '#4B5563' : '#C0C0C0';
    const resendTimerColor = isDark ? '#6B7280' : '#999'; // Color for timer text

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={[styles.safeArea, { backgroundColor: bgColor }]}
          behavior={Platform.OS === 'ios' ? 'padding' : null}
        >
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={bgColor} />
          <View style={styles.container}>
            <Text style={[styles.heading, { color: textColor }]}>OTP Verification</Text>
            <Text style={[styles.subheading, { color: subColor }]}>
              Enter the 4-digit code sent to <Text style={{ fontWeight: 'bold' }}>{mobile}</Text>
            </Text>

            <OTPInputView
              style={styles.otpInputView}
              pinCount={4}
              autoFocusOnLoad
              codeInputFieldStyle={[
                styles.inputBox,
                {
                  borderColor: otpInputBorder,
                  backgroundColor: otpInputBg,
                  color: otpInputTextColor,
                },
              ]}
              codeInputHighlightStyle={{ borderColor: otpInputActiveBorder }}
              onCodeFilled={(code) => this.setState({ otp: code })}
            />

            {resendTimer > 0 ? (
              <Text style={[styles.resendText, { color: resendTimerColor }]}>
                Resend OTP in {resendTimer}s
              </Text>
            ) : (
              <TouchableOpacity onPress={this.handleResendOTP}>
                <Text style={[styles.resendLink, { color: primaryAccentColor }]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={this.handleChangeNumber}>
              <Text style={[styles.changeNumber, { color: primaryAccentColor }]}>
                Change Mobile Number
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: primaryAccentColor },
                loading && { opacity: 0.6, backgroundColor: disabledButtonBg }, // Apply disabled styles
              ]}
              onPress={this.handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center', // Center content horizontally
  },
  heading: {
    fontSize: 28, // Slightly larger
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16, // Slightly larger
    textAlign: 'center',
    marginBottom: 30, // More spacing
    lineHeight: 24, // Better readability
  },
  otpInputView: {
    width: '85%', // Wider
    height: 70, // Taller
    alignSelf: 'center',
    marginTop: 20, // Reduced top margin
    marginBottom: 20, // Added bottom margin
  },
  inputBox: {
    width: 60, // Wider
    height: 60, // Taller
    borderWidth: 1,
    borderRadius: 12, // More rounded corners
    fontSize: 22, // Larger font
    fontWeight: '600', // Bolder font
  },
  resendText: {
    marginTop: 15, // Adjusted margin
    fontSize: 14,
    textAlign: 'center',
  },
  resendLink: {
    marginTop: 15,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    textDecorationLine: 'underline', // Underline for links
  },
  changeNumber: {
    marginTop: 15, // Adjusted margin
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    textDecorationLine: 'underline', // Underline for links
  },
  button: {
    marginTop: 40, // More spacing to button
    paddingVertical: 18, // Taller button
    borderRadius: 12, // More rounded
    alignItems: 'center',
    width: '100%', // Full width
    shadowColor: '#000', // Add shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18, // Larger text
  },
});