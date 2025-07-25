import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { CommonActions } from "@react-navigation/native";


export default class HeaderComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLogoutModal: false,
      loading: false,
      logoScale: new Animated.Value(1),
    };
  }

  componentDidMount() {
    this.animateLogo();
  }

  animateLogo = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.logoScale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(this.state.logoScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  };

  openLogoutModal = () => this.setState({ showLogoutModal: true });
  closeLogoutModal = () => this.setState({ showLogoutModal: false });

  handleLogout = async () => {
    this.setState({ loading: true, showLogoutModal: false });

    try {
      await AsyncStorage.clear();
      this.props.setIsLoggedIn(false);

      this.props.rootNavigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      );

      if (this.props.toastRef?.current) {
        this.props.toastRef.current.show("Logged out successfully", 2000);
      }
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { title, showBack, onBackPress, showLogo, showLogout, navigation } = this.props;
    const { showLogoutModal, loading, logoScale } = this.state;

    return (
      <View style={styles.headerContainer}>
        {/* Left: Back Button */}
        <View style={styles.sideContainer}>
          {showBack && (
            <TouchableOpacity onPress={onBackPress}>
              <Image
                source={require("../assets/icons/back.png")}
                style={styles.icon}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Center: Logo */}
        <View style={styles.logoContainer}>
          {showLogo && (
            <TouchableOpacity onPress={() => navigation.navigate("Home2")}>
              <Animated.Image
                source={require("../assets/appIcon/rpkk.png")}
                style={[
                  styles.logo,
                  { transform: [{ scale: logoScale }] },
                ]}
              />
            </TouchableOpacity>
          )}
          {title && <Text style={styles.titleText}>{title}</Text>}
        </View>

        {/* Right: Logout */}
        <View style={styles.sideContainer}>
          {showLogout && (
            <TouchableOpacity onPress={this.openLogoutModal}>
              <Image
                source={require("../assets/icons/logout.png")}
                style={[styles.icon, { tintColor: "#FF4D4D" }]}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* 🔐 Logout Modal */}
        <Modal
          transparent
          animationType="fade"
          visible={showLogoutModal}
          onRequestClose={this.closeLogoutModal}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Logout</Text>
              <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={this.closeLogoutModal}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutConfirmButton} onPress={this.handleLogout}>
                  <Text style={styles.logoutConfirmText}>Yes, Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ⏳ Loading Overlay */}
        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#7B5CFA" />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    height: 65,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  sideContainer: {
    width: wp("20%"),
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  logo: {
    width: wp("30%"),
    height: hp("8%"),
    resizeMode: "contain",
    marginBottom: 2,
  },
  titleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 2,
  },
  icon: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
  },
  modalMessage: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  logoutConfirmButton: {
    flex: 1,
    backgroundColor: "#FF4D4D",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutConfirmText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    zIndex: 1000,
  },
});
