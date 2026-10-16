import React, { useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import { t } from './i18n';
import { Icon, s, theme } from './ui';

export type Choice = { id: string; name: string; emoji?: string; literal?: boolean };
export function ChoiceField({
  label,
  value,
  options,
  onChange,
  optionLabel = '{0}',
  compact = false,
}: {
  label: string;
  value: string;
  options: Choice[];
  onChange: (value: string) => void;
  optionLabel?: string;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const selected = options.find((option) => option.id === value);
  return (
    <View style={{ gap: 8, minWidth: 0 }}>
      {!compact && <Text style={s.label}>{label}</Text>}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded }}
        aria-expanded={expanded}
        onPress={() => {
          Keyboard.dismiss();
          setExpanded(!expanded);
        }}
        style={[
          s.row,
          {
            minHeight: compact ? 44 : 52,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.line,
            backgroundColor: '#F1F2EA',
            gap: 8,
          },
        ]}
      >
        <Text style={{ flex: 1, fontSize: compact ? 13 : 16, color: theme.ink }}>
          {compact ? `${label}: ` : ''}
          {selected?.emoji ? selected.emoji + ' ' : ''}
          {selected?.literal ? selected.name : t(selected?.name || value)}
        </Text>
        <Icon name="down" size={17} />
      </Pressable>
      {expanded && (
        <ScrollView
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          style={{
            maxHeight: 240,
            borderWidth: 1,
            borderColor: theme.line,
            borderRadius: 14,
            backgroundColor: '#fff',
          }}
        >
          {options.map((option) => (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityLabel={t(optionLabel, option.literal ? option.name : t(option.name))}
              accessibilityState={{ checked: option.id === value }}
              aria-checked={option.id === value}
              onPress={() => {
                onChange(option.id);
                setExpanded(false);
              }}
              style={[
                s.row,
                {
                  minHeight: 48,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  gap: 10,
                  backgroundColor: option.id === value ? '#E5EDDE' : '#fff',
                },
              ]}
            >
              {option.emoji && (
                <Text aria-hidden style={{ fontSize: 20 }}>
                  {option.emoji}
                </Text>
              )}
              <Text style={{ color: theme.ink, fontSize: 15, flex: 1 }}>
                {option.literal ? option.name : t(option.name)}
              </Text>
              {option.id === value && <Icon name="check" size={18} color={theme.green} />}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
