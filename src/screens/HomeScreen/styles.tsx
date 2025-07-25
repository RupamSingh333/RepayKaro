import React from "react";
import { StyleSheet } from "react-native";
import { widthPercentageToDP as wp,heightPercentageToDP as hp } from "react-native-responsive-screen";


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
headerFixed: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  backgroundColor: '#FFFFFF',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: wp('4%'),
  height: hp('8%'), // ✅ Fix a height for header
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4,
},

logoImage: {
  width: wp('25%'),  // ✅ Responsive: 20-25% of screen width
  height: '100%',    // ✅ Let it fill header height naturally
  resizeMode: 'contain', // ✅ Ensures logo is not cropped
},

  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  logoText: {
    fontSize: wp('5%'),
  },
  logoTextBold: {
    fontWeight: 'bold',
    color: '#7F4FF4',
  },
  logoTextPurple: {
    color: '#7F4FF4',
    fontWeight: 'bold',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneButton: {
    borderWidth: 1,
    borderColor: '#7F4FF4',
    borderRadius: wp('5%'),
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('3%'),
  },
  phoneButtonText: {
    color: '#7F4FF4',
    fontWeight: 'bold',
    fontSize: wp('3.5%'),
  },
  heroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('4%'),
  },
  heroLeft: {
    width: '55%',
  },
  heroTitle: {
    fontSize: wp('7%'),
    color: '#000',
    marginBottom: hp('2%'),
  },
  purple: {
    color: '#7F4FF4',
  },
  bold: {
    fontWeight: 'bold',
  },
  heroSubTitle: {
    fontSize: wp('3.8%'),
    color: '#555',
    marginBottom: hp('3%'),
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: hp('2%'),
  },
  primaryButton: {
    backgroundColor: '#7F4FF4',
    borderRadius: wp('3%'),
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
    marginRight: wp('2%'),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    borderWidth: 1,
    borderColor: '#7F4FF4',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
  },
  secondaryButtonText: {
    color: '#7F4FF4',
    fontWeight: 'bold',
  },
  heroRight: {
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: wp('35%'),
    height: wp('35%'),
  },
  aboutContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: wp('6%'),
  paddingVertical: hp('4%'),
  backgroundColor: '#F9FAFB', // halka grey background same jaise screenshot mein
},

aboutLeft: {
  width: '15%',
  alignItems: 'center',
},

aboutIcon: {
  width: wp('15%'),
  height: wp('15%'),
},

aboutRight: {
  width: '80%',
  paddingLeft: wp('4%'),
},

aboutTitle: {
  fontSize: wp('5%'),
  marginBottom: hp('1%'),
},

aboutSubTitle: {
  fontSize: wp('3.8%'),
  color: '#374151', // dark grey jaise screenshot mein
  lineHeight: wp('5%'),
},
platformContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginVertical: hp('5%'),
  paddingHorizontal: wp('5%'),
  flexWrap: 'wrap',
},

platformImageWrapper: {
  backgroundColor: '#E9D8FD', // Light purple shade
  padding: 20,
  borderRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 5,
  marginBottom: hp('2%'),
},

platformImage: {
  width: wp('80%'),
  height: hp('30%'),
  borderRadius: 10,
},

platformContent: {
  flex: 1,
  paddingLeft: wp('5%'),
},

platformTitle: {
  fontSize: 22,
  fontWeight: 'bold',
  marginBottom: 10,
},

platformSubText: {
  fontSize: 16,
  color: '#333',
  marginBottom: 10,
  lineHeight: 22,
},

platformSubHeading: {
  fontSize: 18,
  fontWeight: 'bold',
  marginTop: 10,
  marginBottom: 5,
},
escalationContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: wp('5%'),
},

escalationImageWrapper: {
  backgroundColor: '#E9D8FD',
  padding: 20,
  borderRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 5,
  marginBottom: hp('2%'),
},

escalationImage: {
  width: wp('80%'),
  height: hp('30%'),
  borderRadius: 10,
},

escalationContent: {
  flex: 1,
  paddingLeft: wp('5%'),
},

escalationTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 5,
},

escalationText: {
  fontSize: 16,
  color: '#333',
  marginBottom: 15,
  lineHeight: 22,
},
worksContainer: {
  marginTop: hp('5%'),
  paddingHorizontal: wp('5%'),
},

worksTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 10,
},

worksSubtitle: {
  fontSize: 16,
  textAlign: 'center',
  marginBottom: 20,
  color: '#555',
},

workCard: {
  flex: 1,
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 20,
  marginBottom: 20,
  marginHorizontal: 5,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 5,
  elevation: 3,
},

workCircle: {
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: '#E9D8FD',
  justifyContent: 'center',
  alignItems: 'center',
  alignSelf: 'center',
  marginBottom: 15,
},

workCircleText: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#7A5AF8',
},

workCardTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 8,
},

workCardDescription: {
  fontSize: 14,
  textAlign: 'center',
  color: '#555',
  lineHeight: 20,
},


});
export default styles