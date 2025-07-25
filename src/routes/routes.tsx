import React, { Component } from 'react';
import {
  View,
  StatusBar,
  Image,
  ActivityIndicator,
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

function BottomTab({ rootNavigation, setIsLoggedIn, toastRef }) {
  return (
    <Bottom.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color }) => {
          const icons = {
            Dashboard: require('./src/assets/icons/menu.png'),
            Reward: require('./src/assets/icons/coin.png'),
            'Upload Screenshot': require('./src/assets/icons/down-arrow.png'),
            'Payment Status': require('./src/assets/icons/coin.png'),
          };
          return (
            <Image
              source={icons[route.name]}
              style={{ width: 24, height: 24, tintColor: color }}
              resizeMode="contain"
            />
          );
        },
        tabBarActiveTintColor: '#7B5CFA',
        tabBarInactiveTintColor: 'gray',
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

export default class Routes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialRoute: null,
      isLoggedIn: false,
    };
    this.toastRef = React.createRef();
    this.navigatorRef = React.createRef();
  }

  async componentDidMount() {
    try {
      const token = await AsyncStorage.getItem('liveCustomerToken');
      const isLoggedIn = !!token;

      // Delay splash manually
      setTimeout(() => {
        this.setState({
          isLoggedIn,
          initialRoute: isLoggedIn ? 'BottomTab' : 'Login',
        });
      }, 2000);
    } catch (error) {
      this.setState({ isLoggedIn: false, initialRoute: 'Login' });
    }
  }

  setIsLoggedIn = async (status) => {
    if (!status) await AsyncStorage.removeItem('liveCustomerToken');
    this.setState({ isLoggedIn: status, initialRoute: status ? 'BottomTab' : 'Login' });
  };

  renderScreens = () => {
    const { initialRoute, isLoggedIn } = this.state;

    return (
      <Stack.Navigator
        initialRouteName={initialRoute || 'Splash'}
        screenOptions={{ headerShown: false }}
      >
        {initialRoute === null && (
          <Stack.Screen name="Splash" component={SplashScreen} />
        )}

        {initialRoute === 'Login' && (
          <>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen {...props} toastRef={this.toastRef} />
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

        {initialRoute === 'BottomTab' && (
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
    const { initialRoute } = this.state;

    return (
      <SafeAreaProvider>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />
        <NavigationContainer ref={this.navigatorRef}>
          {initialRoute === null ? (
            <SplashScreen />
          ) : (
            this.renderScreens()
          )}
        </NavigationContainer>
        <Toast ref={this.toastRef} />
      </SafeAreaProvider>
    );
  }
}


const styles = StyleSheet.create({
  drawerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.75,
    backgroundColor: '#fff',
    elevation: 10,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  drawerLogo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7B5CFA',
    marginBottom: 30,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  drawerActiveItem: {
    backgroundColor: '#EAD9FF',
    elevation: 2,
  },
  drawerItemIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#333',
  },
  drawerItemTextActive: {
    color: '#7B5CFA',
    fontWeight: 'bold',
  },
});
