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
                <Text style={[styles.chartTitle, { color: textColor }]}>
                  Payment Breakdown
                </Text>
                <View style={styles.divider} />

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
                  height={hp('20%')}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    color: () => `#fff`,
                    labelColor: () => textColor,
                    decimalPlaces: 2,
                    propsForLabels: {
                      fontSize: wp('3.5%'),
                      fontWeight: 'bold',
                    },
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft={wp('1%')}
                  absolute
                />

                <View style={styles.customLegend}>
                  {[
                    { label: 'Foreclosure', color: '#5B6CFF', value: client?.fore_closure },
                    { label: 'Settlement', color: '#8A4CFB', value: client?.settlement },
                    { label: 'Min Payment', color: '#32CD32', value: client?.minimum_part_payment },
                  ].map((item, idx) => (
                    <View key={idx} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <Text style={[styles.legendLabel, { color: subColor }]}>
                        {item.label}: ₹{this.parseDecimal(item.value).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
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
    color: '#7B5CFA',
  },
  subtitle: {
    fontSize: wp('4.2%'),
    marginBottom: hp('3%'),
    lineHeight: hp('2.5%'),
    color: '#64748B',
  },
  paymentCard: {
    borderRadius: 20,
    padding: wp('5%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Slight glass effect
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(8px)', // optional in web
    overflow: 'hidden',
  },
  paymentCardTitle: {
    color: '#fff',
    fontSize: wp('4.6%'),
    fontWeight: '700',
    marginBottom: hp('0.5%'),
  },
  paymentAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  paymentAmount: {
    fontSize: wp('6.8%'),
    fontWeight: '900',
    color: '#fff',
  },
  paymentReward: {
    color: '#fff',
    fontSize: wp('3.6%'),
    marginTop: hp('0.3%'),
    fontWeight: '500',
    opacity: 0.9,
  },

  chartContainer: {
    marginTop: hp('2%'),
    alignItems: 'center',
    marginBottom: hp('13%'),
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  chartTitle: {
    fontSize: wp('5%'),
    fontWeight: '800',
    marginBottom: hp('1%'),
    color: '#475569',
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
    zIndex: 1000,
  },

  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('10%'),
    paddingHorizontal: wp('6%'),
  },
  noDataText: {
    fontSize: wp('4.5%'),
    textAlign: 'center',
    marginBottom: hp('2%'),
    color: '#94A3B8',
  },
  refreshButton: {
    backgroundColor: '#7B5CFA',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('6%'),
    borderRadius: 12,
    shadowColor: '#7B5CFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Custom Pie Chart Legend (if using)
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: hp('1.2%'),
    opacity: 0.3,
  },
  customLegend: {
    marginTop: hp('1.5%'),
    width: '100%',
    paddingHorizontal: wp('2%'),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.8%'),
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: wp('2%'),
  },
  legendLabel: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
  },
});

