import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Appearance,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import HeaderComponent from '../../components/HeaderComponent';

// --- Define Color Palette for Both Themes ---
const COLORS = {
  // Backgrounds
  lightBackground: '#F8FAFC',
  darkBackground: '#1A202C',

  // Card & Modal Backgrounds
  lightCard: '#FFFFFF',
  darkCard: '#2D3748',

  // Text Colors
  lightTextPrimary: '#1F2937',
  darkTextPrimary: '#E2E8F0',

  lightTextSecondary: '#6B7280',
  darkTextSecondary: '#A0EC0',

  // Accent Colors
  primaryAccent: '#7B5CFA',
  dangerRed: '#EF4444',
  successGreen: '#10B981',

  // Button & Modal Specific
  buttonTextLight: '#FFFFFF',
  buttonTextDark: '#FFFFFF',

  modalBackdrop: 'rgba(0,0,0,0.6)',
  modalButtonCancelLight: '#E0E0E0',
  modalButtonCancelDark: '#4A5568',
};

// --- Component Definition ---
export default class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLogoutModal: false,
      customerName: '',
      customerPhone: '',
      theme: Appearance.getColorScheme(),
    };
    this.themeListener = null;
  }

  async componentDidMount() {
    this.loadUserInfo();

    this.themeListener = Appearance.addChangeListener(({ colorScheme }) => {
      this.setState({ theme: colorScheme });
    });
  }

  componentWillUnmount() {
    if (this.themeListener) {
      this.themeListener.remove();
    }
  }

  loadUserInfo = async () => {
    try {
      const name = await AsyncStorage.getItem('customerName');
      const phone = await AsyncStorage.getItem('customerPhone');
      this.setState({
        customerName: name || 'Guest User',
        customerPhone: phone || 'Not Available',
      });
    } catch (err) {
      console.error('Failed to load user info:', err);
      this.props.toastRef?.current?.show('Failed to load profile info.', 2000);
    }
  };

  handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      this.props.setIsLoggedIn(false);
      this.props.toastRef?.current?.show('Logged out successfully.', 2000);
    } catch (error) {
      console.error('Logout error:', error);
      this.props.toastRef?.current?.show(
        'Logout failed. Please try again.',
        2000,
      );
    } finally {
      this.setState({ showLogoutModal: false });
    }
  };

  render() {
    const { navigation } = this.props;
    const { showLogoutModal, customerName, customerPhone, theme } = this.state;
    const isDark = theme === 'dark';

    // --- Dynamic Styles based on Theme ---
    const containerBg = isDark ? COLORS.darkBackground : COLORS.lightBackground;
    const cardBg = isDark ? COLORS.darkCard : COLORS.lightCard;
    const primaryTextColor = isDark ? COLORS.darkTextPrimary : COLORS.lightTextPrimary;
    const secondaryTextColor = isDark ? COLORS.darkTextSecondary : COLORS.lightTextSecondary;
    const logoutBtnBg = COLORS.dangerRed;
    const modalBg = cardBg;
    const modalConfirmBtnBg = COLORS.dangerRed;
    const modalCancelBtnBg = isDark ? COLORS.modalButtonCancelDark : COLORS.modalButtonCancelLight;
    const modalCancelBtnText = isDark ? COLORS.darkTextPrimary : COLORS.lightTextPrimary;
    const cardShadowColor = isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.1)';

    return (
      <View style={[styles.container, { backgroundColor: containerBg }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? COLORS.darkBackground : COLORS.lightBackground}
        />

        <HeaderComponent
          title="Profile"
          showBack={true}
          onBackPress={() => navigation.goBack()}
          isDark={isDark}
        />

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: cardBg,
              shadowColor: cardShadowColor,
            },
          ]}
        >
          <View style={[styles.avatarContainer, { borderColor: isDark ? COLORS.darkTextSecondary : COLORS.lightTextSecondary }]}>
            <Icon name="account-circle" size={wp('28%')} color={COLORS.primaryAccent} />
          </View>
          <Text style={[styles.nameText, { color: primaryTextColor }]}>
            {customerName}
          </Text>
          <Text style={[styles.mobileText, { color: secondaryTextColor }]}>
            Mobile: {customerPhone}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: logoutBtnBg,
              shadowColor: logoutBtnBg,
            },
          ]}
          onPress={() => this.setState({ showLogoutModal: true })}
          activeOpacity={0.8}
        >
          <Icon name="logout" size={wp(5)} color={COLORS.buttonTextLight} style={styles.logoutIcon} />
          <Text style={[styles.logoutButtonText, { color: COLORS.buttonTextLight }]}>Logout</Text>
        </TouchableOpacity>

        <Modal
          transparent
          animationType="fade"
          visible={showLogoutModal}
          onRequestClose={() => this.setState({ showLogoutModal: false })}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalBox,
                {
                  backgroundColor: modalBg,
                  shadowColor: cardShadowColor,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: primaryTextColor }]}>
                Confirm Logout
              </Text>
              <Text style={[styles.modalMessage, { color: secondaryTextColor }]}>
                Are you sure you want to log out of your account?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalCancelButton,
                    { backgroundColor: modalCancelBtnBg },
                  ]}
                  onPress={() => this.setState({ showLogoutModal: false })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalCancelButtonText, { color: modalCancelBtnText }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalConfirmButton,
                    { backgroundColor: modalConfirmBtnBg },
                  ]}
                  onPress={this.handleLogout}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalConfirmButtonText, { color: COLORS.buttonTextLight }]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center', // This centers the direct children horizontally
    // Background color set dynamically
  },
  profileCard: {
    width: wp('90%'),
    borderRadius: 20,
    paddingVertical: hp('3.5%'),
    paddingHorizontal: wp('6%'),
    alignItems: 'center',
    marginTop: hp('3%'),
    marginBottom: hp('3%'),
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    // Background and shadow color set dynamically
  },
  avatarContainer: {
    marginBottom: hp('2%'),
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('15%'),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    // Border color set dynamically
  },
  nameText: {
    fontSize: wp('6%'),
    fontWeight: '700',
    marginBottom: hp('0.8%'),
    textAlign: 'center',
  },
  mobileText: {
    fontSize: wp('4%'),
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('7%'),
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('2%'),
    width: wp('60%'),
    // --- THIS IS THE KEY CHANGE ---
    alignSelf: 'center', // Ensures the button itself is centered within its parent (the container)
    // -----------------------------
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    // Background and shadow color set dynamically
  },
  logoutIcon: {
    marginRight: wp('2.5%'),
  },
  logoutButtonText: {
    fontSize: wp('4.8%'),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // --- Modal Styles ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.modalBackdrop, // Consistent backdrop color
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: wp('80%'),
    borderRadius: 18,
    padding: wp('7%'),
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    // Background and shadow color set dynamically
  },
  modalTitle: {
    fontSize: wp('5.8%'),
    fontWeight: '700',
    marginBottom: hp('1.5%'),
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: wp('4.2%'),
    textAlign: 'center',
    marginBottom: hp('3.5%'),
    lineHeight: hp('2.5%'),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp('4%'),
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: hp('1.5%'),
    borderRadius: 12,
    alignItems: 'center',
    // Background color set dynamically
  },
  modalCancelButtonText: {
    fontSize: wp('4.3%'),
    fontWeight: '600',
    // Color set dynamically
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: hp('1.5%'),
    backgroundColor: COLORS.dangerRed,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: wp('4.3%'),
    fontWeight: '600',
    color: COLORS.buttonTextLight,
  },
});