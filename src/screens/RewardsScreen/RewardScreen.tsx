import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Appearance,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConfettiCannon from "react-native-confetti-cannon";
import HeaderComponent from "../../components/HeaderComponent";
import ScratchCard from "../../components/ScratchCard";
import CelebrationOverlay from "./CelebrationOverlay";
import { apiGet, apiPost } from "../../api/Api";

const { width } = Dimensions.get("window");

interface Coupon {
  _id: string;
  amount: { $numberDecimal: string };
  coupon_code: string;
  validity: number;
  createdAt: string;
  scratched?: number;
}

interface State {
  coupons: Coupon[];
  loading: boolean;
  refreshing: boolean;
  confettiVisible: boolean;
  celebrationVisible: boolean;
  celebrationAmount: number;
  theme: string | null;
  scratchingId: string | null; // ✅ NEW
}


interface Props {
  navigation: any;
  toastRef?: any;
}

export default class ScratchCardList extends Component<Props, State> {
  themeListener: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      coupons: [],
      loading: true,
      refreshing: false,
      confettiVisible: false,
      celebrationVisible: false,
      celebrationAmount: 0,
      theme: Appearance.getColorScheme(),
    };
  }

  componentDidMount() {
    this.getCoupons();
    this.themeListener = Appearance.addChangeListener(({ colorScheme }) => {
      this.setState({ theme: colorScheme });
    });
  }

  componentWillUnmount() {
    if (this.themeListener) this.themeListener.remove();
  }

  getCoupons = async () => {
    this.setState({ loading: true });
    try {
      const token = await AsyncStorage.getItem("liveCustomerToken");
      if (!token) {
        Alert.alert("Authentication Error", "Please log in to view rewards.");
        this.setState({ loading: false, refreshing: false });
        return;
      }

      const response = await apiGet("clients/get-coupon");
      if (response.success) {
        this.setState({
          coupons: response.coupon || [],
          loading: false,
          refreshing: false,
        });
      } else {
        Alert.alert("Error", response.message || "Failed to load coupons.");
        this.setState({ loading: false, refreshing: false });
      }
    } catch (error) {
      Alert.alert("Network Error", "Check your internet connection.");
      this.setState({ loading: false, refreshing: false });
    }
  };

  handleReveal = async (coupon: Coupon) => {
    const id = coupon._id;

    // ✅ Extract and format amount from item
    const rawAmount = parseFloat(coupon.amount?.$numberDecimal || "0");
    const formattedAmount = rawAmount % 1 === 0 ? rawAmount.toFixed(0) : rawAmount.toFixed(2);

    console.log(`Revealing coupon with ID: ${id}, amount: ₹${formattedAmount}`);

    // Prevent multiple API calls
    if (this.state.scratchingId === id) return;

    this.setState({ scratchingId: id });

    try {
      const result = await apiPost("coupons/coupon-scratch", { coupon_id: id });

      if (result?.success) {
        this.setState((prev) => ({
          coupons: prev.coupons.map((c) =>
            c._id === id ? { ...c, scratched: 1 } : c
          ),
          confettiVisible: true,
          celebrationVisible: true,
          celebrationAmount: rawAmount, // ✅ Number, not formatted string
        }));

      } else {
        this.setState({
          confettiVisible: false,
          celebrationVisible: false,
          celebrationAmount: 0, // ✅ Use numeric value
        });
        this.props.toastRef?.current?.show("Failed to reveal card.", 2500);
      }
    } catch (error) {
      this.props.toastRef?.current?.show("Something went wrong.", 2500);
      this.setState({
        confettiVisible: false,
        celebrationVisible: false,
        celebrationAmount: 0, // ✅ Use numeric value
      });
    } finally {
      this.setState({ scratchingId: null });
    }
  };

  onRefresh = () => {
    this.setState({ refreshing: true }, this.getCoupons);
  };

  renderItem = ({ item }: { item: Coupon }) => {
    const isDark = this.state.theme === "dark";

    return (
      <ScratchCard
        item={item}
        onScratchComplete={
          item.scratched == 1 ? undefined : () => this.handleReveal(item)
        }
        isDark={isDark}
      />
    );
  };

  renderEmptyList = () => {
    const isDark = this.state.theme == "dark";
    const textColor = isDark ? "#CBD5E0" : "#4A5568";

    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: textColor }]}>
          No scratch cards available yet!
        </Text>
        <Text style={[styles.emptySubText, { color: textColor }]}>
          Check back later for exciting rewards.
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={this.onRefresh}
        >
          <Text style={styles.refreshButtonText}>Tap to Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    const {
      coupons,
      loading,
      refreshing,
      confettiVisible,
      celebrationVisible,
      celebrationAmount,
      theme,
    } = this.state;

    const isDark = theme == "dark";
    const screenBgColor = isDark ? "#1A202C" : "#F8FAFC";
    const indicatorColor = isDark ? "#FFFFFF" : "#00B9F5";

    return (
      <View style={[styles.mainContainer, { backgroundColor: screenBgColor }]}>
        <StatusBar
          backgroundColor={screenBgColor}
          barStyle={isDark ? "light-content" : "dark-content"}
        />

        <HeaderComponent
          title="Rewards"
          showBack
          onBackPress={() => this.props.navigation.goBack()}
          isDark={isDark}
        />

        <CelebrationOverlay
          visible={celebrationVisible}
          amount={celebrationAmount}
          onClose={() => this.setState({ celebrationVisible: false, confettiVisible: false })}
        />


        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={indicatorColor} />
          ) : (
            <FlatList
              data={coupons}
              keyExtractor={(item) => item._id}
              renderItem={this.renderItem}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapperStyle}
              contentContainerStyle={styles.contentContainerStyle}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={this.onRefresh}
                  tintColor={indicatorColor}
                />
              }
              ListEmptyComponent={this.renderEmptyList}
            />
          )}

          {confettiVisible && (
            <ConfettiCannon
              count={200}
              origin={{ x: width / 2, y: 0 }}
              fadeOut
              autoStart
              colors={["#FFC107", "#E91E63", "#9C27B0", "#00B9F5", "#8BC34A"]}
              fallSpeed={3000}
              explosionSpeed={800}
              style={styles.confetti}
            />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  columnWrapperStyle: {
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  contentContainerStyle: {
    paddingBottom: 80,
    paddingTop: 10,
  },
  confetti: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: Dimensions.get("window").height * 0.5,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: "#00B9F5",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginTop: 20,
    elevation: 4,
    shadowColor: "#00B9F5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
