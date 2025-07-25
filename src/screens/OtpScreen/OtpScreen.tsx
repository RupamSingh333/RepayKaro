import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
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
    };
    this.timer = null;
  }

  componentDidMount() {
    this.startResendTimer();
  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
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
      this.props.toastRef.current.show('Please enter a valid 4-digit OTP', 2000);
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
        this.props.toastRef.current.show('OTP Verified! Redirecting...', 1500);
        this.props.onLoginSuccess();
      } else {
        this.props.toastRef.current.show(json.message || 'Invalid OTP!', 2000);
      }
    } catch (error) {
      this.props.toastRef.current.show('Network error!', 2000);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleChangeNumber = () => {
    this.props.navigation.navigate('Login');
  };

  render() {
    const { resendTimer, otp, loading } = this.state;
    const mobile = this.props.route?.params?.mobile || 'XXXXXXXXXX';

    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#F9F9F9' }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <View style={styles.container}>
          <Text style={styles.heading}>OTP Verification</Text>
          <Text style={styles.subheading}>Enter the OTP sent to {mobile}</Text>

          <OTPInputView
            style={{ width: '80%', height: 60, alignSelf: 'center', marginTop: 30 }}
            pinCount={4}
            autoFocusOnLoad
            code={otp}
            codeInputFieldStyle={styles.inputBox}
            codeInputHighlightStyle={styles.inputBoxActive}
            onCodeChanged={(code) => this.setState({ otp: code })}
          />

          {resendTimer > 0 ? (
            <Text style={styles.resendText}>Resend OTP in {resendTimer}s</Text>
          ) : (
            <TouchableOpacity onPress={this.startResendTimer}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={this.handleChangeNumber}>
            <Text style={styles.changeNumber}>Change Mobile Number</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
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
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4B0082',
    textAlign: 'center',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputBox: {
    width: 55,
    height: 55,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    fontSize: 20,
    color: '#111',
    backgroundColor: '#fff',
  },
  inputBoxActive: {
    borderColor: '#8b5cf6',
  },
  resendText: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
    color: '#999',
  },
  resendLink: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
    color: '#8b5cf6',
    fontWeight: '600',
  },
  changeNumber: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    color: '#8b5cf6',
    fontWeight: '600',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
