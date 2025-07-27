import React, { Component } from 'react';
import {
  View,
  StatusBar,
  Image,
  Platform,
  UIManager,
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  StyleSheet,
  Appearance,
} from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import your screens
import Dashboard from './src/screens/DashBoardScreen/DashBoardScreen';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen/LoginScreen';
import OTPScreen from './src/screens/OtpScreen/OtpScreen';
import HomeScreen2 from './src/screens/HomeScreen2/HomeScreen2';
import UploadPaymentScreenshot from './src/screens/UploadScreenShot/UplaodScreenshot';
import RewardScreen from './src/screens/RewardsScreen/RewardScreen';
import PaymentStatusScreen from './src/screens/PaymentStatusScreen/PaymentStatusScreen';
import ProfileScreen from './src/screens/ProfileScreen/ProfileScreen';
import Toast from './src/components/Toast';
import { setNavigatorRef } from './src/navigation/NavigationService';


const Stack = createNativeStackNavigator();
const Bottom = createBottomTabNavigator();

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Custom Tab Bar Button component to handle active state visual effect
function CustomTabBarButton({ children, accessibilityState, onPress, focused, activeIndicatorColor }) {
  const insets = useSafeAreaInsets();

  const iconScale = React.useRef(new Animated.Value(1)).current;
  const backgroundOpacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(iconScale, {
        toValue: focused ? 1.2 : 1,
        duration: 250,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: focused ? 1 : 0,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: focused ? hp(-1.5) : 0,
        duration: 250,
        easing: Easing.out(Easing.circle),
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[tabStyles.tabButton, { paddingBottom: insets.bottom / 2 }]}
    >
      {/* Curved Active Background */}
      <Animated.View
        style={[
          tabStyles.activeIndicator,
          {
            opacity: backgroundOpacity,
            backgroundColor: activeIndicatorColor,
          },
        ]}
      />
      {/* Icon (Lifted when focused) */}
      <Animated.View
        style={{
          transform: [{ translateY }, { scale: iconScale }],
          zIndex: 2,
        }}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}



function BottomTab({ rootNavigation, setIsLoggedIn, toastRef, theme }) {
  const isDark = theme === 'dark';

  // Define tab bar colors based on theme
  const tabBarBgColor = isDark ? '#2D3748' : '#FFFFFF';
  const tabBarShadowColor = isDark ? '#000' : '#000';
  const activeIndicatorBgColor = isDark ? '#3F326B' : '#E8E2FF';
  const tabBarActiveTintColor = isDark ? '#FFFFFF' : '#7B5CFA'; // White in dark mode, purple in light mode
  const tabBarInactiveTintColor = isDark ? '#6B7280' : '#B0BEC5';

  return (
    <Bottom.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ color, focused }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'view-dashboard';
              break;
            case 'Reward':
              iconName = 'trophy';
              break;
            case 'Screenshot':
              iconName = 'upload';
              break;
            case 'Payment':
              iconName = 'receipt';
              break;
            case 'Profile':
              iconName = 'account';
              break;
            default:
              iconName = 'help-circle';
              break;
          }

          return (
            <Icon
              name={iconName}
              size={wp(7)} // Increased icon size
              color={color}
            />
          );
        },
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        tabBarStyle: {
          ...tabStyles.tabBarContainer,
          backgroundColor: tabBarBgColor,
          shadowColor: tabBarShadowColor,
          shadowOpacity: isDark ? 0.3 : 0.15, // Slightly more shadow in dark mode for depth
        },
        tabBarButton: (props) => (
          <CustomTabBarButton {...props} activeIndicatorColor={activeIndicatorBgColor} />
        ),
      })}
    >
      <Bottom.Screen name="Dashboard">
        {(props) => (
          <Dashboard
            {...props}
            rootNavigation={rootNavigation}
            setIsLoggedIn={setIsLoggedIn}
            toastRef={toastRef}
          />
        )}
      </Bottom.Screen>
      <Bottom.Screen name="Reward" component={RewardScreen} />
      <Bottom.Screen name="Screenshot">
        {(props) => <UploadPaymentScreenshot {...props} toastRef={toastRef} />}
      </Bottom.Screen>
      <Bottom.Screen name="Payment">
        {(props) => <PaymentStatusScreen {...props} />}
      </Bottom.Screen>
      <Bottom.Screen name="Profile">
        {(props) => (
          <ProfileScreen
            {...props}
            setIsLoggedIn={setIsLoggedIn}
            toastRef={toastRef}
          />
        )}
      </Bottom.Screen>
    </Bottom.Navigator>
  );
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentRoute: 'Splash',
      isLoggedIn: false,
      theme: Appearance.getColorScheme(),
    };
    this.toastRef = React.createRef();
    this.navigatorRef = React.createRef();
    this.themeListener = null;
  }

  async componentDidMount() {
    try {
      const token = await AsyncStorage.getItem('liveCustomerToken');
      const isLoggedIn = !!token;

      setTimeout(() => {
        this.setState({
          isLoggedIn,
          currentRoute: isLoggedIn ? 'BottomTab' : 'Login',
        });
      }, 2000);
    } catch (error) {
      console.error('Error checking login status:', error);
      this.setState({ isLoggedIn: false, currentRoute: 'Login' });
    }

    this.themeListener = Appearance.addChangeListener(({ colorScheme }) => {
      this.setState({ theme: colorScheme });
    });
  }

  componentWillUnmount() {
    if (this.themeListener) {
      this.themeListener.remove();
    }
  }

  setIsLoggedIn = async (status) => {
    if (!status) {
      await AsyncStorage.removeItem('liveCustomerToken');
    }
    this.setState({ isLoggedIn: status, currentRoute: status ? 'BottomTab' : 'Login' });
  };

  renderScreens = () => {
    const { currentRoute, theme } = this.state;
    const isDark = theme === 'dark';

    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentRoute === 'Splash' ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : currentRoute === 'Login' ? (
          <>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  toastRef={this.toastRef}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="OTP">
              {(props) => (
                <OTPScreen
                  {...props}
                  toastRef={this.toastRef}
                  onLoginSuccess={() => this.setIsLoggedIn(true)}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="BottomTab">
              {(props) => (
                <BottomTab
                  {...props}
                  rootNavigation={this.navigatorRef}
                  setIsLoggedIn={this.setIsLoggedIn}
                  toastRef={this.toastRef}
                  theme={theme}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Home2" component={HomeScreen2} />
          </>
        )}
      </Stack.Navigator>
    );
  };


  render() {
    const { theme } = this.state;
    const isDark = theme === 'dark';

    return (
      <SafeAreaProvider>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={isDark ? 'light-content' : 'dark-content'}
        />
        <NavigationContainer ref={this.navigatorRef}>
          {this.renderScreens()}
        </NavigationContainer>
        <Toast ref={this.toastRef} />
      </SafeAreaProvider>
    );
  }
}
const isDark = Appearance.getColorScheme() === 'dark';

const tabStyles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: hp('1%'),
    left: wp('5%'),
    right: wp('5%'),
    height: hp('9.2%'),
    borderRadius: 40,
    backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
    borderColor: isDark ? '#333' : '#ddd',
    overflow: 'hidden',
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },

  activeIndicator: {
    position: 'absolute',
    top: -hp('2%'),
    width: wp('17%'),
    height: hp('8.2%'),
    backgroundColor: isDark ? '#3A2F55' : '#E8E3FF',
    borderRadius: 35,
    shadowColor: isDark ? '#8B5CF6' : '#7B5CFA',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 0,
    transform: [{ scale: 1.05 }],
  },
});
