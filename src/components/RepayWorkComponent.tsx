import React, { Component } from "react";
import { Text, View, StyleSheet, Animated } from "react-native"; // Added Animated
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

export default class RepayWorkComp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Added animated value for a subtle scale effect on the card
      cardScale: new Animated.Value(1),
    };
  }

  componentDidMount() {
    // Start a subtle pulse animation for the card
    this.animateCard();
  }

  animateCard = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.cardScale, {
          toValue: 1.01, // Slightly increase size
          duration: 1500, // Slower animation
          useNativeDriver: true,
          easing: Animated.Easing.inOut(Animated.Easing.ease),
        }),
        Animated.timing(this.state.cardScale, {
          toValue: 1, // Return to original size
          duration: 1500,
          useNativeDriver: true,
          easing: Animated.Easing.inOut(Animated.Easing.ease),
        }),
      ])
    ).start();
  };

  render() {
    const { item } = this.props;
    const { cardScale } = this.state;

    return (
      <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}>
        <View style={styles.circle}>
          <Text style={styles.circleText}>{item.id}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF", // Brighter white background
    borderRadius: 20, // More rounded corners for a modern feel
    padding: wp("6%"), // Increased padding for more breathing room
    marginHorizontal: wp("3%"), // Added horizontal margin for spacing when used in a list
    marginBottom: hp("2.5%"), // Slightly increased bottom margin
    alignItems: "center",
    // Enhanced shadow for a lifted, more prominent look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 }, // More vertical offset for shadow
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 15, // Wider blur radius for shadow
    elevation: 8, // Android shadow
    overflow: 'hidden', // Ensure shadow and border radius play nicely
  },
  circle: {
    width: wp("16%"), // Responsive size for the circle
    height: wp("16%"),
    borderRadius: wp("8%"), // Half of width/height for a perfect circle
    backgroundColor: "#7B5CFA", // Your distinctive purple color
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("2%"), // Increased margin below the circle
    // Add a subtle inner shadow or border for depth
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)', // Lighter border
    shadowColor: "#000", // Shadow for the circle itself
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  circleText: {
    color: "#fff",
    fontSize: wp("6%"), // Responsive font size for the ID
    fontWeight: "bold",
  },
  title: {
    fontSize: wp("4.8%"), // Responsive and slightly larger font size for title
    fontWeight: "700", // Bolder font weight
    color: "#333333", // Darker text for better contrast
    textAlign: "center",
    marginBottom: hp("1%"), // Adjusted margin below title
    lineHeight: wp("5.5%"), // Ensure consistent line height
  },
  description: {
    fontSize: wp("3.8%"), // Responsive font size for description
    color: "#666666", // Softer grey for description
    textAlign: "center",
    lineHeight: wp("5.5%"), // Consistent line height for readability
  },
});
