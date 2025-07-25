import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export default class Toast extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      message: '',
      fadeAnim: new Animated.Value(0),
    };
    this.timeout = null;
  }

  show = (message = '', duration = 2500) => {
    if (this.timeout) clearTimeout(this.timeout);

    this.setState({ visible: true, message }, () => {
      Animated.timing(this.state.fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        this.timeout = setTimeout(this.hide, duration);
      });
    });
  };

  hide = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    Animated.timing(this.state.fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      this.setState({ visible: false, message: '' });
    });
  };

  componentWillUnmount() {
    if (this.timeout) clearTimeout(this.timeout);
  }

  render() {
    if (!this.state.visible) return null;

    return (
      <Animated.View style={[styles.toastContainer, { opacity: this.state.fadeAnim }]}>
        <Text style={styles.toastText}>{this.state.message}</Text>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 70,
    left: width * 0.1,
    right: width * 0.1,
    backgroundColor: '#1E1E2F',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});
