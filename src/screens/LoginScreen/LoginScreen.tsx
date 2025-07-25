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
} from 'react-native';

import { apiPost } from '../../api/Api';

const { height } = Dimensions.get('window');

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mobileNumber: '',
      loading: false,
      scaleValue: new Animated.Value(1),
    };
  }

  componentDidMount() {
    this.animateLogo();
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
    const { mobileNumber, loading, scaleValue } = this.state;
    const isValid = /^\d{10}$/.test(mobileNumber);

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safeArea}
      >
        <StatusBar barStyle="light-content" backgroundColor="#8b5cf6" />
        <View style={styles.container}>
          {/* Logo + App Name */}
          <View style={styles.topSection}>
            <Animated.Image
              source={require('../../assets/appIcon/rpkk.png')}
              style={[styles.logo, { transform: [{ scale: scaleValue }] }]}
              resizeMode="contain"
            />
            <Text style={styles.appName}>RepayKaro</Text>
            <Text style={styles.tagline}>Manage Your Finances with Ease!</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formCard}>
            <Text style={styles.welcome}>Welcome Back 👋</Text>
            <Text style={styles.instruction}>
              Enter your mobile number to receive OTP
            </Text>

            <Text style={styles.formLabel}>
              Mobile Number <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your mobile number"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
              maxLength={10}
              value={mobileNumber}
              onChangeText={(text) =>
                this.setState({ mobileNumber: text.replace(/[^0-9]/g, '') })
              }
            />

            <TouchableOpacity
              style={[styles.button, (!isValid || loading) && { opacity: 0.5 }]}
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
    backgroundColor: '#8b5cf6',
  },
  container: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    justifyContent: 'flex-start',
  },
  topSection: {
    alignItems: 'center',
    marginTop: 70,
  },
  logo: {
    width: 110,
    height: 110,
    backgroundColor: '#fff',
    borderRadius: 60,
    marginBottom: 10,
  },
  appName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  tagline: {
    fontSize: 14,
    color: '#eee',
    marginTop: 4,
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flex: 1,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 6,
  },
  instruction: {
    fontSize: 15,
    color: '#555',
    marginBottom: 25,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#8b5cf6',
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
