import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  RefreshControl,
  Appearance,
} from 'react-native';
import HeaderComponent from '../../components/HeaderComponent';
import { apiGet } from '../../api/Api';
import { PieChart } from 'react-native-chart-kit';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      client: null,
      loading: true,
      refreshing: false,
      fadeAnim: new Animated.Value(0),
      slideAnim: new Animated.Value(30),
    };
  }

  componentDidMount() {
    this.animateUI();
    this.fetchClientData();
  }

  animateUI = () => {
    Animated.parallel([
      Animated.timing(this.state.fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(this.state.slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  fetchClientData = async () => {
    this.setState({ loading: true });
    try {
      const result = await apiGet('clients/get-client');
      if (result?.success && result?.client) {
        this.setState({ client: result.client });
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      this.setState({ loading: false, refreshing: false });
    }
  };

  onRefresh = () => {
    this.setState({ refreshing: true }, () => {
      this.fetchClientData();
    });
  };

  parseDecimal = (value) =>
    typeof value === 'object' && value?.$numberDecimal
      ? parseFloat(value.$numberDecimal)
      : parseFloat(value || 0);

  makePaymentOptions = (client) => [
    {
      id: '1',
      title: 'Foreclosure Amount',
      amount: this.parseDecimal(client.fore_closure),
      reward: this.parseDecimal(client.foreclosure_reward),
      color: '#5B6CFF',
      payment_url: client.payment_url,
    },
    {
      id: '2',
      title: 'Settlement Amount',
      amount: this.parseDecimal(client.settlement),
      reward: this.parseDecimal(client.settlement_reward),
      color: '#7D5BA6',
      payment_url: client.payment_url,
    },
    {
      id: '3',
      title: 'Minimum Payment',
      amount: this.parseDecimal(client.minimum_part_payment),
      reward: this.parseDecimal(client.minimum_part_payment_reward),
      color: '#5A554C',
      payment_url: client.payment_url,
    },
  ];

  handlePayment = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error('Failed to open URL:', err)
      );
    }
  };

  renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => this.handlePayment(item.payment_url)}
      activeOpacity={0.9}
    >
      <View style={[styles.card, { backgroundColor: item.color }]}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amount}>₹ {item.amount.toFixed(2)}</Text>
          <Image
            source={require('../../assets/icons/wallet.png')}
            style={styles.walletIcon}
          />
        </View>
        <Text style={styles.reward}>Reward ₹ {item.reward.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  render() {
    const { client, loading, fadeAnim, slideAnim, refreshing } = this.state;
    const isDark = Appearance.getColorScheme() === 'dark';
    const textColor = isDark ? '#E5E7EB' : '#1F2937';
    const subColor = isDark ? '#9CA3AF' : '#4B5563';
    const bgColor = isDark ? '#111827' : '#F9F9FF';

    return (
      <View style={{ flex: 1, backgroundColor: bgColor }}>
        <HeaderComponent
          navigation={this.props.navigation}
          showBack={false}
          showLogo={true}
          showLogout={true}
          onBackPress={() => this.props.navigation.goBack()}
          setIsLoggedIn={this.props.setIsLoggedIn}
        />

        <Animated.ScrollView
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            padding: 20,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={this.onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.welcome, { color: textColor }]}>
            👋 Welcome {client?.customer || 'Customer'}
          </Text>
          <Text style={[styles.subtitle, { color: subColor }]}>
            Your OK Credit loan outstanding: ₹
            {this.parseDecimal(client?.fore_closure).toFixed(2) || '0.00'}
          </Text>

          {client && (
            <>
              <FlatList
                data={this.makePaymentOptions(client)}
                renderItem={this.renderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />

              <View style={[styles.statusCard, { backgroundColor: isDark ? '#1F2937' : '#EAFBF1' }]}>
                <Text style={[styles.statusLabel, { color: textColor }]}>Payment Status</Text>
                <Text style={[styles.statusValue, { color: '#0E8F43' }]}>
                  {client?.payment_status || 'Completed'}
                </Text>
                <Text style={[styles.statusSub, { color: subColor }]}>Paid (Part payment)</Text>
              </View>

              <View style={styles.chartContainer}>
                <Text style={[styles.chartTitle, { color: textColor }]}>Payment Breakdown</Text>
                <PieChart
                  data={[
                    {
                      name: 'Foreclosure',
                      amount: this.parseDecimal(client?.fore_closure),
                      color: '#5B6CFF',
                      legendFontColor: textColor,
                      legendFontSize: 13,
                    },
                    {
                      name: 'Settlement',
                      amount: this.parseDecimal(client?.settlement),
                      color: '#7D5BA6',
                      legendFontColor: textColor,
                      legendFontSize: 13,
                    },
                    {
                      name: 'Min Payment',
                      amount: this.parseDecimal(client?.minimum_part_payment),
                      color: '#5A554C',
                      legendFontColor: textColor,
                      legendFontSize: 13,
                    },
                  ]}
                  width={SCREEN_WIDTH - 40}
                  height={220}
                  chartConfig={{
                    color: () => textColor,
                    labelColor: () => textColor,
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: bgColor,
                    backgroundGradientTo: bgColor,
                    decimalPlaces: 2,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            </>
          )}
        </Animated.ScrollView>

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
  welcome: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  amount: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  walletIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
  reward: {
    color: '#fff',
    fontSize: 13,
    marginTop: 4,
  },
  statusCard: {
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusSub: {
    fontSize: 13,
  },
  chartContainer: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
