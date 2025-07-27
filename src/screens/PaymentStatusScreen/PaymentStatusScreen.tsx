import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Animated,
  Appearance,
  RefreshControl,
  StatusBar, // Import StatusBar for theme control
} from 'react-native';
import HeaderComponent from '../../components/HeaderComponent';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Ensure this is installed: npm install react-native-vector-icons
import { apiGet } from '../../api/Api'; // Your API utility

// --- Comprehensive Color Palette for Both Themes ---
const COLORS = {
  // Main Backgrounds
  lightBackground: '#F0F2F5', // Soft light gray
  darkBackground: '#1F2937',  // Deep dark gray (almost black)

  // Card & Item Backgrounds
  lightCard: '#FFFFFF',      // Pure white
  darkCard: '#1E1E1E',       // Slightly lighter than darkBackground for distinction

  // Primary Text
  lightTextPrimary: '#212121', // Dark almost-black
  darkTextPrimary: '#E0E0E0',  // Off-white

  // Secondary Text (e.g., descriptions, dates, muted)
  lightTextSecondary: '#757575', // Medium gray
  darkTextSecondary: '#A0A0A0',  // Lighter gray

  // Accent Colors for Timeline Circles/Icons (aligned with actions/status)
  primaryAccent: '#6C63FF',   // General accent, e.g., for default/unknown actions
  successGreen: '#4CAF50',    // For 'Scratch' success or general success
  infoBlue: '#2196F3',       // For 'Login' or general info actions
  warningYellow: '#FFC107',   // For 'Payment' or 'Update' actions
  errorRed: '#F44336',        // For 'Failed' actions or errors

  // Borders & Lines
  lightBorder: '#E0E0E0',
  darkBorder: '#333333',
  lightLine: '#B0BEC5',
  darkLine: '#455A64',

  // Shadows
  lightShadow: 'rgba(0,0,0,0.1)',
  darkShadow: 'rgba(0,0,0,0.4)',

  // Loader Color
  loaderLight: '#6C63FF',
  loaderDark: '#A0A0A0',
};

// --- Helper Function for User-Friendly Date Formatting ---
const formatTimelineDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Using the current local time in Bayana, Rajasthan, India (IST)
    const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' };
    const optionsDate = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kolkata' }; // e.g., 'Jul 27, 2025'

    const dateTodayIST = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const dateYesterdayIST = new Date(yesterday.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const itemDateIST = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));


    const isToday = itemDateIST.toDateString() === dateTodayIST.toDateString();
    const isYesterday = itemDateIST.toDateString() === dateYesterdayIST.toDateString();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', optionsTime)}`;
    } else if (isYesterday) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', optionsTime)}`;
    } else {
      return `${date.toLocaleDateString('en-US', optionsDate)} at ${date.toLocaleTimeString('en-US', optionsTime)}`;
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Formatting Error';
  }
};

// --- DEFINE STYLES HERE, BEFORE THE COMPONENT CLASS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40, // Ensure content doesn't get cut off at the bottom
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 1, // Increased spacing between items
    alignItems: 'stretch', // Ensures contentCard stretches to full height for line alignment
  },
  timelineVisuals: {
    alignItems: 'center',
    marginRight: 15, // Space between timeline and card
  },
  circleWrapper: {
    width: 30, // Larger circle for icon
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // Border around the icon circle
    // Dynamic background and border color will be set in renderItem
  },
  line: {
    width: 2,
    flex: 1, // Line extends to the end of the card
    marginTop: 5, // Gap from circle
    // Dynamic background color will be set in renderItem
  },
  contentCard: {
    flex: 1, // Takes remaining horizontal space
    padding: 15,
    borderRadius: 12,
    borderWidth: 1, // Subtle border for the card
    shadowOffset: { width: 0, height: 4 }, // More pronounced shadow
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // Android shadow
    marginBottom: 5, // Prevent line from overlapping card shadow
    // Dynamic background, border, and shadow color will be set in renderItem
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 5, // Space between icon and date
  },
  dateText: {
    fontSize: 13,
    // Dynamic text color will be set in renderItem
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    // Dynamic text color will be set in renderItem
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    // Dynamic text color will be set in renderItem
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 80, // More space from top
    fontSize: 16,
    fontWeight: '500',
  },
});

// --- PaymentStatusScreen Component ---
export default class PaymentStatusScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeline: [],
      loading: true,
      refreshing: false,
      theme: Appearance.getColorScheme(),
    };
    this.themeListener = null;
  }

  componentDidMount() {
    this.loadData();
    this.themeListener = Appearance.addChangeListener(({ colorScheme }) => {
      this.setState({ theme: colorScheme });
    });
  }

  componentWillUnmount() {
    if (this.themeListener) {
      this.themeListener.remove();
    }
  }

  loadData = async (isRefreshing = false) => {
    this.setState({ loading: !isRefreshing, refreshing: isRefreshing });

    try {
      const result = await apiGet('clients/get-timeline');

      if (result && result.success && result.timeline?.length > 0) {
        // Sort the timeline by createdAt to ensure newest items are at the top
        const sortedTimeline = result.timeline.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        this.setState({
          timeline: sortedTimeline,
          loading: false,
          refreshing: false,
        });
      } else {
        this.setState({ loading: false, refreshing: false });
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
      // You might want to show a toast message here for the user
      this.setState({ loading: false, refreshing: false });
    }
  };

  // Helper to get icon based on 'action' or 'title'
  getIconForAction = (item) => {
    // Prioritize 'action' field, then 'title', then 'description' for icon logic
    const keyword = (item.action || item.title || item.description || '').toLowerCase();

    if (keyword.includes('scratch')) {
      return { name: 'credit-card-scan', color: COLORS.successGreen };
    }
    if (keyword.includes('login') || keyword.includes('logout') || keyword.includes('user')) {
      return { name: 'account-check', color: COLORS.infoBlue };
    }
    if (keyword.includes('payment') || keyword.includes('bill') || keyword.includes('paid')) {
      return { name: 'cash-multiple', color: COLORS.warningYellow };
    }
    if (keyword.includes('update') || keyword.includes('profile')) {
      return { name: 'account-edit', color: COLORS.primaryAccent };
    }
    if (keyword.includes('successful') || keyword.includes('success')) {
      return { name: 'check-bold', color: COLORS.successGreen };
    }
    if (keyword.includes('failed') || keyword.includes('error')) {
      return { name: 'close-circle', color: COLORS.errorRed };
    }
    return { name: 'information', color: COLORS.primaryAccent }; // Default icon
  };

  renderItem = ({ item, index }) => {
    const isLast = index === this.state.timeline.length - 1;
    const isDark = this.state.theme === 'dark';
    const delay = index * 100; // Staggered animation delay

    // Dynamic colors for the item
    const itemCardBg = isDark ? COLORS.darkCard : COLORS.lightCard;
    const itemPrimaryText = isDark ? COLORS.darkTextPrimary : COLORS.lightTextPrimary;
    const itemSecondaryText = isDark ? COLORS.darkTextSecondary : COLORS.lightTextSecondary;
    const itemBorderColor = isDark ? COLORS.darkBorder : COLORS.lightBorder;
    const itemLineColor = isDark ? COLORS.darkLine : COLORS.lightLine;
    const itemShadowColor = isDark ? COLORS.darkShadow : COLORS.lightShadow;

    // Determine icon based on item data (action, title, description)
    const { name: iconName, color: iconColor } = this.getIconForAction(item);

    const scaleAnim = new Animated.Value(0.95);
    const opacityAnim = new Animated.Value(0);

    // Animate items on mount/render
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
      <Animated.View
        style={[
          styles.itemContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.timelineVisuals}>
          <View style={[styles.circleWrapper, { backgroundColor: itemCardBg, borderColor: itemBorderColor }]}>
            <Icon name={iconName} size={20} color={iconColor} />
          </View>
          {!isLast && <View style={[styles.line, { backgroundColor: itemLineColor }]} />}
        </View>

        <View
          style={[
            styles.contentCard,
            {
              backgroundColor: itemCardBg,
              borderColor: itemBorderColor,
              shadowColor: itemShadowColor,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Icon name="calendar-range" size={16} color={itemSecondaryText} />
            <Text style={[styles.dateText, { color: itemSecondaryText }]}>
              {formatTimelineDate(item.createdAt)}
            </Text>
          </View>
          <Text style={[styles.titleText, { color: itemPrimaryText }]}>
            {item.title}
          </Text>
          <Text style={[styles.descriptionText, { color: itemSecondaryText }]}>
            {item.description}
          </Text>
        </View>
      </Animated.View>
    );
  };

  render() {
    const { timeline, loading, refreshing, theme } = this.state;
    const isDark = theme === 'dark';

    const containerBg = isDark ? COLORS.darkBackground : COLORS.lightBackground;
    const loaderColor = isDark ? COLORS.loaderDark : COLORS.loaderLight;
    const emptyTextColor = isDark ? COLORS.darkTextSecondary : COLORS.lightTextSecondary;

    return (
      <View style={[styles.container, { backgroundColor: containerBg }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? COLORS.darkBackground : COLORS.lightBackground}
        />
        <HeaderComponent
          title="Payment Status"
          showBack={true}
          onBackPress={() => this.props.navigation.goBack()}
          isDark={isDark}
        />

        {loading && !refreshing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={loaderColor} />
          </View>
        ) : (
          <FlatList
            data={timeline}
            renderItem={this.renderItem}
            keyExtractor={(item) => item._id || item.createdAt} // Use _id if available, fallback to createdAt
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: emptyTextColor }]}>
                {refreshing ? 'Loading...' : 'No payment activity found.'}
              </Text>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => this.loadData(true)}
                tintColor={loaderColor}
              />
            }
          />
        )}
      </View>
    );
  }
}