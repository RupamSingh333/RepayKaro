import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  StatusBar,
  Animated,
  Easing,
} from "react-native";

export default class SplashScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fadeAnim: new Animated.Value(0),
      scaleAnim: new Animated.Value(0.85),
    };
  }

  componentDidMount() {
    // Animate logo & text on load
    Animated.parallel([
      Animated.timing(this.state.fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(this.state.scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after delay
    // setTimeout(() => {
    //   this.props.navigation.replace("Login");
    // }, 2000);
  }

  render() {
    const { fadeAnim, scaleAnim } = this.state;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8b5cf6" />

        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require("../assets/appIcon/rpkk.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
          RepayKaro
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
          Manage Your Finances with Ease!
        </Animated.Text>
        <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
          Your ultimate solution for effortless loan tracking
        </Animated.Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoWrapper: {
    backgroundColor: "#fff",
    borderRadius: 100,
    padding: 36,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 28,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 16,
    color: "#f0f0f0",
    textAlign: "center",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    color: "#e4dbff",
    textAlign: "center",
    marginTop: 2,
  },
});
