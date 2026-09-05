import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { t } from './i18n';
import { Icon, theme } from './ui';

type Option = { id: string; name: string; emoji: string };

export function CategoryStrip({
  options,
  selected,
  onSelect,
  label = 'Filtrar {0}',
}: {
  options: Option[];
  selected: string;
  onSelect: (id: string) => void;
  label?: string;
}) {
  const scroll = useRef<ScrollView>(null);
  const [offset, setOffset] = useState(0);
  const [viewport, setViewport] = useState(0);
  const [content, setContent] = useState(0);
  const maximum = Math.max(0, content - viewport);
  const move = (direction: number) =>
    scroll.current?.scrollTo({
      x: Math.max(0, Math.min(maximum, offset + direction * Math.max(100, viewport * 0.8))),
      animated: true,
    });
  const arrow = (direction: -1 | 1) => {
    const disabled = direction === -1 ? offset <= 1 : offset >= maximum - 1;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(direction === -1 ? 'Categorías anteriores' : 'Más categorías')}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => move(direction)}
        style={({ pressed }) => [
          styles.arrow,
          disabled && { opacity: 0.3 },
          pressed && { backgroundColor: '#DDE6D7' },
        ]}
      >
        <View style={direction === -1 ? { transform: [{ rotate: '180deg' }] } : undefined}>
          <Icon name="chevron" size={18} />
        </View>
      </Pressable>
    );
  };
  return (
    <View style={styles.row}>
      {arrow(-1)}
      <ScrollView
        ref={scroll}
        horizontal
        style={styles.scroll}
        showsHorizontalScrollIndicator
        keyboardShouldPersistTaps="handled"
        onLayout={(event) => setViewport(event.nativeEvent.layout.width)}
        onContentSizeChange={(width) => setContent(width)}
        onScroll={(event) => setOffset(event.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
      >
        {options.map((option) => (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityLabel={t(label, t(option.name))}
            accessibilityState={{ selected: selected === option.id }}
            aria-pressed={selected === option.id}
            onPress={() => onSelect(option.id)}
            style={[styles.chip, selected === option.id && { backgroundColor: theme.ink }]}
          >
            <Text style={styles.emoji} aria-hidden>
              {option.emoji}
            </Text>
            <Text style={{ fontSize: 13, color: selected === option.id ? '#fff' : theme.ink }}>
              {t(option.name)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {arrow(1)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scroll: { flex: 1, minWidth: 0 },
  content: { gap: 8, paddingVertical: 4 },
  arrow: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#E9EEE2',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#E9EEE2',
  },
  emoji: { fontSize: 18 },
});
