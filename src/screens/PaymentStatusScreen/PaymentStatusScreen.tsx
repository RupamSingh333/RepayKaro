import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Animated,
} from "react-native";
import HeaderComponent from "../../components/HeaderComponent";
import { apiGet } from "../../api/Api";

export default class PaymentStatusScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeline: [],
      loading: true,
      fadeAnim: new Animated.Value(0),
      refreshing: false, // 👈 add this
    };

  }

  componentDidMount() {
    this.loadData();
  }

  loadData = async (isRefreshing = false) => {
    this.setState({ loading: !isRefreshing, refreshing: isRefreshing });

    try {
      const result = await apiGet("clients/get-timeline");

      if (result && result.success && result.timeline?.length > 0) {
        this.setState(
          {
            timeline: result.timeline,
            loading: false,
            refreshing: false,
          },
          this.startAnimation
        );
      } else {
        this.setState({ loading: false, refreshing: false });
      }
    } catch (error) {
      console.error("Error fetching timeline:", error);
      this.setState({ loading: false, refreshing: false });
    }
  };


  startAnimation = () => {
    Animated.timing(this.state.fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  renderItem = ({ item, index }) => {
    const isLast = index === this.state.timeline.length - 1;
    const delay = index * 100;

    const scaleAnim = new Animated.Value(0.95);
    const opacityAnim = new Animated.Value(0);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();

    return (
      <View style={styles.itemContainer}>
        <View style={styles.timeline}>
          <View style={styles.circle} />
          {!isLast && <View style={styles.line} />}
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Text style={styles.date}>{this.formatDate(item.createdAt)}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  render() {
    const { timeline, loading } = this.state;

    return (
      <View style={styles.container}>
        <HeaderComponent
          title="Payment Status"
          showBack={true}
          onBackPress={() => this.props.navigation.goBack()}
        />

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#7B5CFA" />
          </View>
        ) : (
          <FlatList
            data={timeline}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No timeline data found.</Text>
            }
            refreshing={this.state.refreshing}
            onRefresh={() => this.loadData(true)} // 👈 call refresh
          />

        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  timeline: {
    alignItems: "center",
    marginRight: 14,
  },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#7B5CFA",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 3,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#CBD5E1",
    marginTop: 2,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    elevation: 3,
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 2,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 100,
    color: "#9CA3AF",
    fontSize: 16,
  },
});
