import { t } from './i18n';
import React, { useEffect, useState } from 'react';
import { Keyboard, View, type ViewProps } from 'react-native';
import { requireNativeViewManager } from 'expo-modules-core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCommerce, getCommerce } from './commerce';
type Props = ViewProps & {
  enabled: boolean;
  onAdState: (event: { nativeEvent: { loaded: boolean; height: number } }) => void;
};
const NativeBanner = getCommerce().supported
  ? requireNativeViewManager<Props>('CestaCommerce')
  : null;
export function AdBanner({
  visible,
  onHeight,
}: {
  visible: boolean;
  onHeight: (height: number) => void;
}) {
  const commerce = useCommerce(),
    insets = useSafeAreaInsets();
  const [height, setHeight] = useState(0),
    [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    const a = Keyboard.addListener('keyboardWillShow', () => setKeyboard(true));
    const b = Keyboard.addListener('keyboardWillHide', () => setKeyboard(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);
  const enabled =
    visible && !keyboard && commerce.initialized && commerce.adsAllowed && !commerce.adsRemoved;
  useEffect(() => {
    onHeight(enabled ? height : 0);
  }, [enabled, height, onHeight]);
  useEffect(() => {
    if (!enabled) setHeight(0);
  }, [enabled]);
  if (!enabled || !NativeBanner) return null;
  return (
    <View
      accessibilityLabel={t('Anuncio')}
      style={{
        height: height ? height + 12 + insets.bottom : 1,
        paddingTop: height ? 12 : 0,
        paddingBottom: height ? insets.bottom : 0,
        backgroundColor: '#FAF8F3',
        borderTopWidth: height ? 1 : 0,
        borderTopColor: '#E8E9DF',
      }}
    >
      <NativeBanner
        style={{ height: height || 1, width: '100%' }}
        enabled={enabled}
        onAdState={(e) => setHeight(e.nativeEvent.loaded ? e.nativeEvent.height : 0)}
      />
    </View>
  );
}
