import React from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  Platform,
  TextInput,
  TextInputProps,
} from 'react-native';
import Svg, { Path, Circle, Rect, Ellipse, G } from 'react-native-svg';
export const theme = {
  bg: '#FAF8F3',
  ink: '#273D34',
  muted: '#7B837C',
  accent: '#DF694A',
  line: '#E8E9DF',
  white: '#FFFFFF',
  green: '#35634B',
  serif: Platform.OS === 'ios' ? 'Georgia' : Platform.OS === 'web' ? 'Georgia' : 'serif',
};
export const palette: Record<string, { bg: string; dark: string }> = {
  sage: { bg: '#E5EDDE', dark: '#466346' },
  peach: { bg: '#FAE4D8', dark: '#A7583F' },
  lilac: { bg: '#EDE6F4', dark: '#796389' },
  butter: { bg: '#F6EDCC', dark: '#8D763B' },
  blue: { bg: '#E2EDF1', dark: '#4E7789' },
};
const paths: Record<string, string> = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  image: 'M3 3h18v18H3zM3 16l6-6 5 5 3-3 4 4M15 7h.01',
  plus: 'M12 5v14M5 12h14',
  check: 'm5 12 4 4L19 6',
  back: 'm14 5-7 7 7 7',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  close: 'm6 6 12 12M18 6 6 18',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  basket: 'm3 9 2 11h14l2-11H3m4 0 5-7 5 7M9 12v5m6-5v5',
  lists: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3',
  people:
    'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8m9 4a4 4 0 0 1 4 4v3m-6-19a4 4 0 0 1 0 8',
  settings:
    'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3m7 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  trash: 'M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  edit: 'm15 4 5 5M4 20l5-1L21 7l-5-5L4 14v6',
  link: 'm10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 1 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
  copy: 'M8 8h13v13H8zM16 8V3H3v13h5',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  upload: 'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5',
  chevron: 'm9 5 7 7-7 7',
  down: 'm5 9 7 7 7-7',
  refresh: 'M20 7V2l-4 4a9 9 0 1 0 4 10M20 7h-6',
  wifi: 'M3 8a16 16 0 0 1 18 0M6 12a10 10 0 0 1 12 0m-9 4a4 4 0 0 1 6 0m-3 4h.01',
  minus: 'M5 12h14',
  heart:
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8',
};
export function Icon({
  name,
  size = 22,
  color = theme.ink,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={paths[name] || paths.basket}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
export function Button({
  title,
  label,
  onPress,
  icon,
  secondary = false,
  disabled = false,
  small = false,
  danger = false,
}: {
  title: string;
  label?: string;
  onPress: () => void;
  icon?: string;
  secondary?: boolean;
  disabled?: boolean;
  small?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label || title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        {
          backgroundColor: secondary ? '#EEF0E8' : danger ? '#C64436' : theme.ink,
          minHeight: small ? 43 : 54,
          paddingHorizontal: small ? 16 : 22,
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        },
        secondary && { borderWidth: 1, borderColor: theme.line },
      ]}
    >
      {icon && <Icon name={icon} size={19} color={secondary ? theme.ink : '#fff'} />}
      <Text
        style={{
          color: secondary ? theme.ink : '#fff',
          fontSize: small ? 14 : 16,
          fontWeight: '600',
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function IconButton({
  name,
  label,
  onPress,
  color = theme.ink,
}: {
  name: string;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        s.iconButton,
        { backgroundColor: pressed ? '#E8EADF' : 'transparent' },
      ]}
    >
      <Icon name={name} color={color} />
    </Pressable>
  );
}
export function Field(props: TextInputProps & { label?: string }) {
  const { label, ...rest } = props;
  return (
    <View style={{ gap: 8 }}>
      {label && <Text style={s.label}>{label}</Text>}
      <TextInput placeholderTextColor="#959B91" {...rest} style={[s.input, rest.style]} />
    </View>
  );
}
export function BasketArt({ size = 180 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 230">
      <Ellipse cx="125" cy="204" rx="75" ry="10" fill="#CCD8BE" opacity=".5" />
      <G rotation="-12" origin="115,110">
        <Path d="M70 111 47 59Q43 48 53 45q9-4 14 8l25 50" fill="#D4A367" />
        <Path
          d="m54 63 13-5M61 78l12-5M68 92l11-5"
          stroke="#A77B4F"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Rect x="105" y="43" width="45" height="89" rx="9" fill="#FBFBED" />
        <Path d="m105 59 8-20h28l9 20" fill="#D8E5E9" />
        <Path d="M113 39h28v-9h-28z" fill="#789B91" />
        <Rect x="110" y="80" width="35" height="31" rx="5" fill="#B3CEBC" />
        <Path d="M156 108q-19-28 4-40 17-7 18 13 12-20 25-8 14 15-12 37" fill="#779B56" />
        <Path
          d="m169 113 10-29m-7 20 17-12"
          stroke="#527840"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Circle cx="95" cy="111" r="25" fill="#E97B55" />
        <Path d="m87 87 8 9 8-9m-8 9 1-15" stroke="#4F7843" strokeWidth="4" strokeLinecap="round" />
        <Path d="M43 115h163l-18 76q-2 10-14 10H72q-11 0-14-11z" fill="#DDA04D" />
        <Path d="M41 111h167v15H41z" fill="#EABB6F" />
        <Path
          d="M72 140h107M76 158h99M80 177h91M90 136l5 50m24-50v50m25-50-5 50m24-50-8 50"
          stroke="#F4D798"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <Path
          d="M74 119q43-83 90 0"
          fill="none"
          stroke="#855F3C"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </G>
      <Path d="m206 37 2 8 8 2-8 2-2 8-2-8-8-2 8-2z" fill="#CB8252" />
      <Circle cx="31" cy="144" r="4" fill="#B4C29F" />
    </Svg>
  );
}
export const s = StyleSheet.create({
  button: {
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 13, fontWeight: '600', color: theme.ink },
  input: {
    backgroundColor: '#F1F2EA',
    borderWidth: 1,
    borderColor: '#E4E7DC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: theme.ink,
    minHeight: 52,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontFamily: theme.serif, fontSize: 36, color: theme.ink, letterSpacing: -1 },
  body: { fontSize: 15, lineHeight: 23, color: theme.muted },
});
