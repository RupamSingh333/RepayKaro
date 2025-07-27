import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Dimensions,
  ActivityIndicator,
  Animated,
  Easing,
  RefreshControl,
  Appearance,
  Platform,
} from 'react-native';
import HeaderComponent from '../../components/HeaderComponent';
import { apiGet } from '../../api/Api';
import { PieChart } from 'react-native-chart-kit';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ...all necessary imports remain the same

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
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(this.state.slideAnim, {
        toValue: 0,
        duration: 700,
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
      console.error('Fetch Error:', error);
    } finally {
      this.setState({ loading: false, refreshing: false });
    }
  };

  parseDecimal = (value) =>
    typeof value === 'object' && value?.$numberDecimal
      ? parseFloat(value.$numberDecimal)
      : parseFloat(value || 0);

  formatAmount = (amount) =>
    amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2);

  onRefresh = () => this.setState({ refreshing: true }, this.fetchClientData);

  makePaymentOptions = (client) => [
    {
      id: '1',
      title: 'Foreclosure Amount',
      amount: this.parseDecimal(client.fore_closure),
      reward: this.parseDecimal(client.foreclosure_reward),
      color: '#5B6CFF',
      icon: 'bank',
      payment_url: client.payment_url,
    },
    {
      id: '2',
      title: 'Settlement Amount',
      amount: this.parseDecimal(client.settlement),
      reward: this.parseDecimal(client.settlement_reward),
      color: '#8A4CFB',
      icon: 'cash-multiple',
      payment_url: client.payment_url,
    },
    {
      id: '3',
      title: 'Minimum Payment',
      amount: this.parseDecimal(client.minimum_part_payment),
      reward: this.parseDecimal(client.minimum_part_payment_reward),
      color: '#32CD32',
      icon: 'credit-card-outline',
      payment_url: client.payment_url,
    },
    {
      id: '4',
      title: 'Payment Status',
      amount: null,
      reward: null,
      color: '#0E8F43',
      icon: 'check-decagram',
      status: client?.payment_status || 'Completed',
      statusSub: 'Paid (Part payment)',
    },
  ];

  handlePayment = (url) => {
    if (url) Linking.openURL(url).catch(console.error);
  };

  renderPaymentCard = (item) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => item.payment_url && this.handlePayment(item.payment_url)}
        disabled={!item.payment_url}
        activeOpacity={0.85}
      >
        <View style={[styles.paymentCard, { backgroundColor: item.color }]}>
          <View style={styles.paymentAmountRow}>
            <Text style={styles.paymentCardTitle}>{item.title}</Text>
            <Icon name={item.icon} size={28} color="#fff" />
          </View>

          {item.amount !== null && (
            <Text style={styles.paymentAmount}>₹ {this.formatAmount(item.amount)}</Text>
          )}
          {item.reward !== null && (
            <Text style={styles.paymentReward}>
              🎁 Reward: ₹ {this.formatAmount(item.reward)}
            </Text>
          )}

          {item.status && (
            <>
              <Text style={styles.paymentAmount}>{item.status}</Text>
              <Text style={styles.paymentReward}>{item.statusSub}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { client, loading, fadeAnim, slideAnim, refreshing } = this.state;

    const isDark = Appearance.getColorScheme() === 'dark';
    const textColor = isDark ? '#E5E7EB' : '#1F2937';
    const subColor = isDark ? '#9CA3AF' : '#4B5563';
    const bgColor = isDark ? '#1F2937' : '#F4F7FC';
    const cardBgColor = isDark ? '#2D3748' : '#FFFFFF';

    const paymentCards = client ? this.makePaymentOptions(client).map(this.renderPaymentCard) : [];

    return (
      <View style={{ flex: 1, backgroundColor: bgColor }}>
        <HeaderComponent
          navigation={this.props.navigation}
          showBack={false}
          title="RepayKaro"
          showLogout={true}
          onBackPress={() => this.props.navigation.goBack()}
          setIsLoggedIn={this.props.setIsLoggedIn}
          rootNavigation={this.props.navigation}
        />

        <Animated.ScrollView
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingHorizontal: wp('5%'),
            paddingVertical: hp('2%'),
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={this.onRefresh} tintColor={textColor} />
          }
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.welcome, { color: textColor }]}>
            👋 Welcome {client?.customer || 'Customer'}
          </Text>

          <Text style={[styles.subtitle, { color: subColor }]}>
            Your OK Credit loan outstanding: ₹{' '}
            {client ? this.formatAmount(this.parseDecimal(client?.fore_closure)) : '0.00'}
          </Text>

          {client ? (
            <>
              {paymentCards}

              <View style={[styles.chartContainer, { backgroundColor: cardBgColor }]}>
                <Text style={[styles.chartTitle, { color: textColor }]}>Payment Breakdown</Text>
                <PieChart
                  data={[
                    {
                      name: 'Foreclosure',
                      amount: this.parseDecimal(client?.fore_closure),
                      color: '#5B6CFF',
                      legendFontColor: subColor,
                      legendFontSize: wp('3.5%'),
                    },
                    {
                      name: 'Settlement',
                      amount: this.parseDecimal(client?.settlement),
                      color: '#8A4CFB',
                      legendFontColor: subColor,
                      legendFontSize: wp('3.5%'),
                    },
                    {
                      name: 'Min Payment',
                      amount: this.parseDecimal(client?.minimum_part_payment),
                      color: '#32CD32',
                      legendFontColor: subColor,
                      legendFontSize: wp('3.5%'),
                    },
                  ]}
                  width={SCREEN_WIDTH - wp('15%')}
                  height={hp('22%')}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    color: () => `#fff`,
                    labelColor: () => textColor,
                    decimalPlaces: 2,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft={wp('1%')}
                  absolute
                />
              </View>
            </>
          ) : (
            !loading && (
              <View style={styles.noDataContainer}>
                <Text style={[styles.noDataText, { color: subColor }]}>No client data available.</Text>
                <TouchableOpacity onPress={this.onRefresh} style={styles.refreshButton}>
                  <Text style={styles.refreshButtonText}>Tap to Refresh</Text>
                </TouchableOpacity>
              </View>
            )
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
    fontSize: wp('6.5%'),
    fontWeight: '800',
    marginBottom: hp('0.8%'),
    marginTop: hp('1%'),
  },
  subtitle: {
    fontSize: wp('4.2%'),
    marginBottom: hp('3%'),
    lineHeight: hp('2.5%'),
  },
  paymentCard: {
    borderRadius: 18,
    padding: wp('5%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  paymentCardTitle: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: '700',
  },
  paymentAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  paymentAmount: {
    fontSize: wp('7%'),
    fontWeight: '900',
    color: '#fff',
  },
  paymentReward: {
    color: '#fff',
    fontSize: wp('3.5%'),
    marginTop: hp('0.5%'),
    fontWeight: '500',
  },
  chartContainer: {
    marginTop: hp('0.5%'),
    alignItems: 'center',
    marginBottom: hp('12%'),
    paddingVertical: hp('2%'),
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: wp('4.8%'),
    fontWeight: '700',
    marginBottom: hp('1.5%'),
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('10%'),
  },
  noDataText: {
    fontSize: wp('4.5%'),
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  refreshButton: {
    backgroundColor: '#7B5CFA',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('6%'),
    borderRadius: 10,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: '600',
  },
});
