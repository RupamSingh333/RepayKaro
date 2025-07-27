export let navigatorRef = null;

export const setNavigatorRef = (ref) => {
  navigatorRef = ref;
};

export const resetToLogin = () => {
  if (navigatorRef && navigatorRef.current) {
    navigatorRef.current.dispatch({
      ...CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    });
  }
};
