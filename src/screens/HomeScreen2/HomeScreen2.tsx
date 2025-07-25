import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  ScrollView,
  FlatList,
  Linking,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import styles from './styles';
import Data from '../../api/Data';
import RepayWorkComp from '../../components/RepayWorkComponent';

export default class HomeScreen2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scaleValue: new Animated.Value(1), // Hero image scale
      carouselScale: new Animated.Value(1), // Carousel image scale
    };
  }

  componentDidMount() {
    this.startScale();
    this.startCarouselScale();
  }

  startScale() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.scaleValue, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(this.state.scaleValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }

  startCarouselScale() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.carouselScale, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(this.state.carouselScale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }
renderItem=({item})=>{
return(
  <RepayWorkComp item={item}/>
)
}
handleNavigate=()=>{
  this.props.navigation.navigate('BottomTab')
}
  render() {
    return (
      <View style={{ flex: 1 }}>
        {/* Fixed Header */}
        <View style={styles.headerFixed}>
            <Image source={require('../../assets/appIcon/rpkk.png')} style={styles.logoImage}
                resizeMode="contain"/>
          <View style={styles.rightContainer}>
            <TouchableOpacity
  style={styles.phoneButton}
  onPress={() => Linking.openURL('tel:+9181789531431')}
>
  <Text style={styles.phoneButtonText}>+91 81789531431</Text>
</TouchableOpacity>

          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView contentContainerStyle={{ paddingTop: hp('10%') }}>
          {/* HERO SECTION */}
          <View style={styles.heroContainer}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>
                <Text style={styles.bold}>Simplify Your </Text>
                <Text style={[styles.purple, styles.bold]}>
                  Loan Repayment
                </Text>
                {'\n'}
                <Text style={styles.bold}>with RepayKaro</Text>
              </Text>
              <Text style={styles.heroSubTitle}>
                Managing loan repayments has never been easier. Track, plan,
                and repay your loans efficiently with our smart platform.
              </Text>
              <View style={styles.buttonsRow}>
                <TouchableOpacity style={styles.primaryButton} onPress={this.handleNavigate}>
                  <Text style={styles.primaryButtonText}>Check Your Offer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Learn More</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Animated.View
              style={[
                styles.heroRight,
                { transform: [{ scale: this.state.scaleValue }] },
              ]}
            >
              <Image
                source={require('../../assets/images/mobile-chat-white.jpg')}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* ABOUT SECTION */}
          <View style={styles.aboutContainer}>
            <View style={styles.aboutLeft}>
              <Image
                source={require('../../assets/images/mission_white.png')}
                style={styles.aboutIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.aboutRight}>
              <Text style={styles.aboutTitle}>
                <Text style={styles.bold}>About </Text>
                <Text style={[styles.purple, styles.bold]}>RepayKaro</Text>
              </Text>
              <Text style={styles.aboutSubTitle}>
                RepayKaro specializes in helping lenders recover bad debts
                efficiently, while offering customers the motivation to repay
                by providing attractive incentives.
              </Text>
            </View>
          </View>

          {/* LENDER & CUSTOMER */}
          <View style={styles.platformContainer}>
            <View style={styles.platformImageWrapper}>
              <Animated.Image
                source={require('../../assets/images/carousel-02.jpg')}
                style={[
                  styles.platformImage,
                  { transform: [{ scale: this.state.carouselScale }] },
                ]}
                resizeMode="cover"
              />
            </View>

            <View style={styles.platformContent}>
              <Text style={styles.platformTitle}>
                <Text style={styles.bold}>Lender & Customer </Text>
                <Text style={[styles.purple, styles.bold]}>Platform</Text>
              </Text>
              <Text style={styles.platformSubText}>
                RepayKaro is the part of True Business Minds Pvt. Ltd. and is
                designed with both the lender and customer in mind. Our approach
                focuses on creating a positive experience where customers are
                encouraged to settle their dues with added benefits, and lenders
                can recover bad debts with fewer hassles.
              </Text>
              <Text style={styles.platformSubHeading}>
                Incentives that Matter
              </Text>
              <Text style={styles.platformSubText}>
                We provide a variety of incentives such as discounts on
                repayment, gift coupons, and reward points. These incentives
                motivate customers to act promptly, reducing the chances of
                unpaid debts turning into more serious financial issues.
              </Text>
            </View>
          </View>
          {/* ESCALATIONS & REPAYMENT OPTIONS SECTION */}
<View style={styles.escalationContainer}>
  <View style={styles.escalationImageWrapper}>
  <Animated.View
    style={[
                  styles.platformImage,
      { transform: [{ scale: this.state.carouselScale }] },
    ]}
  >
    <Image
      source={require('../../assets/images/carousel-03.jpg')}
      style={styles.escalationImage}
      resizeMode="cover"
    />
  </Animated.View>
    </View>

  <View style={styles.escalationContent}>
    <Text style={styles.escalationTitle}>
      Avoid Escalations and Conflicts
    </Text>
    <Text style={styles.escalationText}>
      By giving customers the option to settle their loans with incentives,
      we minimize the chances of negative confrontations, complaints, or
      escalations. This results in smoother relationships between lenders and
      borrowers.
    </Text>

    <Text style={styles.escalationTitle}>
      Flexible Repayment Options
    </Text>
    <Text style={styles.escalationText}>
      Customers are provided with different repayment solutions depending on
      their financial situation. Whether they want to pay off pending dues,
      foreclose a loan, or settle the loan completely, we provide them with
      the flexibility to choose an option that works best for them.
    </Text>
  </View>
</View>
{/* HOW REPAYKARO WORKS SECTION */}
<View style={styles.worksContainer}>
  <Text style={styles.worksTitle}>
    How <Text style={styles.purple}>RepayKaro</Text> Works
  </Text>
  <Text style={styles.worksSubtitle}>
    RepayKaro provides a seamless process for both lenders and borrowers. Here's how it works:
  </Text>

  <FlatList
    data={Data.datatype}
    keyExtractor={(item) => item.id}
    numColumns={1}  // ✅ SINGLE COLUMN
    renderItem={this.renderItem}
  />
</View>


        </ScrollView>
      </View>
    );
  }
}