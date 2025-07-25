import React, { Component } from 'react';
import {
  View,
  StatusBar,
  Image,
  Platform,
  UIManager,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Dashboard from './src/screens/DashBoardScreen/DashBoardScreen';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen/LoginScreen';
import OTPScreen from './src/screens/OtpScreen/OtpScreen';
import HomeScreen2 from './src/screens/HomeScreen2/HomeScreen2';
import UploadPaymentScreenshot from './src/screens/UploadScreenShot/UplaodScreenshot';
import RewardScreen from './src/screens/RewardsScreen/RewardScreen';
import PaymentStatusScreen from './src/screens/PaymentStatusScreen/PaymentStatusScreen';
import Toast from './src/components/Toast';

const Stack = createNativeStackNavigator();
const Bottom = createBottomTabNavigator();

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function BottomTab({ rootNavigation, setIsLoggedIn, toastRef }) {
  return (
    <Bottom.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color }) => {
          let icon;
          switch (route.name) {
            case 'Dashboard':
              icon = require('./src/assets/icons/menu.png');
              break;
            case 'Reward':
              icon = require('./src/assets/icons/coin.png');
              break;
            case 'Upload Screenshot':
              icon = require('./src/assets/icons/down-arrow.png');
              break;
            case 'Payment Status':
              icon = require('./src/assets/icons/coin.png');
              break;
            default:
              break;
          }

          return (
            <Image
              source={icon}
              style={{ width: 24, height: 24, tintColor: color }}
              resizeMode="contain"
            />
          );
        },
        tabBarActiveTintColor: '#7B5CFA',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          paddingBottom: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Bottom.Screen name="Dashboard">
        {(props) => (
          <Dashboard
            {...props}
            rootNavigation={rootNavigation}
            setIsLoggedIn={setIsLoggedIn}
          />
        )}
      </Bottom.Screen>
      <Bottom.Screen name="Reward" component={RewardScreen} />
      <Bottom.Screen name="Upload Screenshot">
        {(props) => <UploadPaymentScreenshot {...props} toastRef={toastRef} />}
      </Bottom.Screen>
      <Bottom.Screen name="Payment Status" component={PaymentStatusScreen} />
    </Bottom.Navigator>
  );
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentRoute: 'Splash',
      isLoggedIn: false,
    };
    this.toastRef = React.createRef();
    this.navigatorRef = React.createRef();
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
  }

  setIsLoggedIn = async (status) => {
    if (!status) await AsyncStorage.removeItem('liveCustomerToken');
    this.setState({ isLoggedIn: status, currentRoute: status ? 'BottomTab' : 'Login' });
  };

  renderScreens = () => {
    const { currentRoute } = this.state;

    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentRoute === 'Splash' && <Stack.Screen name="Splash" component={SplashScreen} />}

        {currentRoute === 'Login' && (
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
        )}

        {currentRoute === 'BottomTab' && (
          <>
            <Stack.Screen name="BottomTab">
              {(props) => (
                <BottomTab
                  {...props}
                  rootNavigation={this.navigatorRef}
                  setIsLoggedIn={this.setIsLoggedIn}
                  toastRef={this.toastRef}
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
    return (
      <SafeAreaProvider>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <NavigationContainer ref={this.navigatorRef}>
          {this.renderScreens()}
        </NavigationContainer>
        <Toast ref={this.toastRef} />
      </SafeAreaProvider>
    );
  }
}
