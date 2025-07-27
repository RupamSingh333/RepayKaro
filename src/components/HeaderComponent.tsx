import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Appearance,
  StatusBar,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

// Theme Colors
const getThemeColors = () => {
  const colorScheme = Appearance.getColorScheme();
  const isDark = colorScheme === "dark";

  return {
    isDark,
    background: isDark ? "#1F2937" : "rgba(255,255,255,0.95)",
    text: isDark ? "#F9FAFB" : "#1F2937",
    icon: isDark ? "#E5E7EB" : "#374151",
    accent: isDark ? "#9D8CFF" : "#7B5CFA",
    shadow: "#000",
    shadowOpacity: isDark ? 0.3 : 0.08,
    borderColor: isDark ? "#2C2C2E" : "#DDDDDD",
  };
};

export default class HeaderComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: Appearance.getColorScheme(),
    };
    this.themeListener = null;
  }

  componentDidMount() {
    this.themeListener = Appearance.addChangeListener(({ colorScheme }) => {
      this.setState({ theme: colorScheme });
    });
  }

  componentWillUnmount() {
    if (this.themeListener) {
      this.themeListener.remove();
    }
  }

  render() {
    const { title, showBack, onBackPress } = this.props;
    const { theme } = this.state;
    const isHomePage = title === "RepayKaro";

    const Colors = getThemeColors();

    return (
      <View
        style={[
          styles.headerContainer,
          {
            backgroundColor: Colors.background,
            shadowColor: Colors.shadow,
            shadowOpacity: Colors.shadowOpacity,
            borderBottomColor: Colors.borderColor,
          },
        ]}
      >
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={Colors.isDark ? "light-content" : "dark-content"}
        />

        {/* Back Button */}
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <View style={styles.backCircle}>
                <Image
                  source={require("../assets/icons/back.png")}
                  style={[styles.icon, { tintColor: Colors.icon }]}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Title */}
        <View style={styles.centerContainer}>
          <Text
            style={[
              styles.titleText,
              { color: isHomePage ? Colors.accent : Colors.text },
              isHomePage && styles.repayTitle,
            ]}
          >
            {title}
          </Text>
        </View>

        {/* Right Placeholder */}
        <View style={styles.rightContainer} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    height: hp("9.5%"),
    paddingTop: Platform.OS === "ios" ? hp("5.5%") : hp("3.8%"),
    paddingHorizontal: wp("5%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
    borderBottomWidth: 0.5,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 10,
  },
  leftContainer: {
    width: wp("15%"),
    alignItems: "flex-start",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rightContainer: {
    width: wp("15%"),
    alignItems: "flex-end",
    justifyContent: "center",
  },
  backButton: {
    padding: wp("1.5%"),
  },
  backCircle: {
    backgroundColor: "rgba(120,120,120,0.1)",
    borderRadius: wp("7%"),
    padding: wp("2.5%"),
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: wp("5%"),
    height: wp("5%"),
    resizeMode: "contain",
  },
  titleText: {
    fontSize: wp("5.2%"),
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  repayTitle: {
    fontWeight: "800",
    letterSpacing: 1.2,
    fontSize: wp("6%"),
  },
});
