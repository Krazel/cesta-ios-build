import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  type GestureResponderEvent,
  type ViewProps,
} from 'react-native';

// Capture without claiming the responder, so buttons still work on the first tap.
export function dismissOutsideInput(event: GestureResponderEvent) {
  if (Platform.OS === 'web') return false;
  const focused = TextInput.State.currentlyFocusedInput();
  // Fabric events expose the native element as target, as ScrollView does internally.
  if (focused && (event.target as unknown) !== focused) Keyboard.dismiss();
  return false;
}

export function KeyboardScreen({ children, style, ...props }: ViewProps) {
  const [viewport, setViewport] = useState<{ height: number; top: number } | null>(null);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const vv = window.visualViewport;
    const resize = () =>
      setViewport(
        vv && vv.scale === 1 && window.innerHeight - vv.height > 120
          ? { height: vv.height, top: vv.offsetTop }
          : null,
      );
    const dismiss = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('input, textarea, [contenteditable="true"]'))
        return;
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      Keyboard.dismiss();
    };
    vv?.addEventListener('resize', resize);
    vv?.addEventListener('scroll', resize);
    document.addEventListener('pointerdown', dismiss, true);
    resize();
    return () => {
      vv?.removeEventListener('resize', resize);
      vv?.removeEventListener('scroll', resize);
      document.removeEventListener('pointerdown', dismiss, true);
    };
  }, []);
  return (
    <KeyboardAvoidingView
      {...props}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      onStartShouldSetResponderCapture={dismissOutsideInput}
      style={[
        style,
        viewport && {
          flex: 0,
          position: 'absolute',
          left: 0,
          top: viewport.top,
          width: '100%',
          height: viewport.height,
        },
      ]}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
