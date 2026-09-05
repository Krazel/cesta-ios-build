import React, { useEffect, useRef } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { t } from './i18n';
import { theme } from './ui';

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
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = scroll.current?.getScrollableNode() as HTMLElement | undefined;
    if (!node) return;
    let start: { x: number; offset: number } | null = null;
    let dragged = false;
    const down = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      start = { x: event.clientX, offset: node.scrollLeft };
      dragged = false;
    };
    const move = (event: PointerEvent) => {
      if (!start) return;
      const delta = event.clientX - start.x;
      if (Math.abs(delta) > 6) dragged = true;
      if (dragged) {
        event.preventDefault();
        node.scrollLeft = start.offset - delta;
      }
    };
    const up = () => {
      start = null;
    };
    const click = (event: MouseEvent) => {
      if (dragged) {
        event.preventDefault();
        event.stopPropagation();
        dragged = false;
      }
    };
    node.addEventListener('pointerdown', down);
    node.addEventListener('click', click, true);
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      node.removeEventListener('pointerdown', down);
      node.removeEventListener('click', click, true);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);
  return (
    <ScrollView
      ref={scroll}
      horizontal
      style={styles.scroll}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
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
  );
}
const styles = StyleSheet.create({
  scroll: { flexGrow: 0, flexShrink: 0, minWidth: 0 },
  content: { gap: 8, paddingVertical: 4 },
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
